# Storage API Contract

**Version**: 1.0.0  
**Feature**: 錯題收集網站  
**Date**: 2025-11-17

## Overview

本文件定義前端應用程式與 IndexedDB 之間的資料存取介面契約。由於是靜態網站，此 API 為客戶端函式介面，而非 HTTP REST API。

---

## API Modules

### 1. PhotoStorage API

管理錯題照片的 CRUD 操作。

#### `createPhoto(photoData, file)`

建立新的錯題照片記錄。

**Parameters**:
```typescript
photoData: {
  units?: string[],      // 單元 ID 陣列（可選）
  tags?: string[]        // 標籤陣列（可選）
}
file: File                // 原始照片檔案物件
```

**Returns**: `Promise<MistakePhoto>`

**Process**:
1. 驗證檔案類型和大小
2. 使用 Compressor.js 壓縮原圖（quality: 0.8, maxWidth: 2000）
3. 生成縮圖（300x300, quality: 0.7）
4. 建立 MistakePhoto 物件（生成 UUID, 設定 timestamp）
5. 儲存至 IndexedDB photos store
6. 回傳完整的 photo 物件

**Errors**:
- `InvalidFileTypeError`: 檔案類型不支援
- `FileSizeExceededError`: 檔案超過大小限制
- `StorageQuotaExceededError`: 瀏覽器儲存空間不足
- `CompressionError`: 照片壓縮失敗

**Example**:
```javascript
const photoData = {
  units: ['unit-math-algebra'],
  tags: ['重要']
};
const file = fileInput.files[0];

try {
  const photo = await PhotoStorage.createPhoto(photoData, file);
  console.log('照片已上傳:', photo.id);
} catch (error) {
  if (error instanceof FileSizeExceededError) {
    alert('照片太大，請選擇小於 10MB 的檔案');
  }
}
```

---

#### `getPhoto(id)`

取得單一照片的完整資料。

**Parameters**:
```typescript
id: string  // 照片 UUID
```

**Returns**: `Promise<MistakePhoto | null>`

**Example**:
```javascript
const photo = await PhotoStorage.getPhoto('550e8400-...');
if (photo) {
  // 顯示大圖
  const url = URL.createObjectURL(photo.originalImage);
  imgElement.src = url;
}
```

---

#### `getAllPhotos(options)`

取得所有照片列表（支援篩選和排序）。

**Parameters**:
```typescript
options?: {
  sortBy?: 'uploadedAt' | 'fileName',  // 排序欄位（預設: uploadedAt）
  sortOrder?: 'asc' | 'desc',           // 排序方向（預設: desc）
  filterByUnits?: string[],             // 單元篩選（OR 邏輯）
  filterByTags?: string[],              // 標籤篩選（AND 邏輯）
  limit?: number,                       // 限制筆數（分頁用）
  offset?: number                       // 略過筆數（分頁用）
}
```

**Returns**: `Promise<MistakePhoto[]>`

**Example**:
```javascript
// 取得最新 20 張照片
const photos = await PhotoStorage.getAllPhotos({
  sortBy: 'uploadedAt',
  sortOrder: 'desc',
  limit: 20
});

// 篩選「數學代數」單元的照片
const mathPhotos = await PhotoStorage.getAllPhotos({
  filterByUnits: ['unit-math-algebra']
});

// 篩選同時有「重要」和「考前複習」標籤的照片
const importantPhotos = await PhotoStorage.getAllPhotos({
  filterByTags: ['重要', '考前複習']
});
```

---

#### `updatePhoto(id, updates)`

更新照片的單元或標籤。

**Parameters**:
```typescript
id: string
updates: {
  units?: string[],  // 覆蓋單元列表
  tags?: string[]    // 覆蓋標籤列表
}
```

**Returns**: `Promise<MistakePhoto>`

**Note**: 無法更新照片圖檔本身，僅能更新 metadata

**Example**:
```javascript
const updated = await PhotoStorage.updatePhoto('550e8400-...', {
  units: ['unit-math-algebra', 'unit-math-geometry'],
  tags: ['已理解', '重要']
});
```

---

#### `deletePhoto(id)`

刪除照片（永久刪除，無復原機制）。

**Parameters**:
```typescript
id: string
```

**Returns**: `Promise<void>`

**Example**:
```javascript
if (confirm('確定要刪除此照片嗎？刪除後無法復原。')) {
  await PhotoStorage.deletePhoto('550e8400-...');
  // 更新 UI，移除照片卡片
}
```

---

#### `getPhotoCount()`

取得照片總數（用於空白狀態檢查）。

**Returns**: `Promise<number>`

**Example**:
```javascript
const count = await PhotoStorage.getPhotoCount();
if (count === 0) {
  showEmptyState();
}
```

---

### 2. UnitStorage API

管理單元分類的操作。

#### `getAllUnits()`

取得所有單元列表（含預設和自訂）。

**Returns**: `Promise<Unit[]>`

**Example**:
```javascript
const units = await UnitStorage.getAllUnits();
// 群組化顯示
const grouped = units.reduce((acc, unit) => {
  if (!acc[unit.category]) acc[unit.category] = [];
  acc[unit.category].push(unit);
  return acc;
}, {});
```

---

#### `createUnit(unitData)`

建立使用者自訂單元。

**Parameters**:
```typescript
unitData: {
  name: string,      // 單元名稱（1-50 字元）
  category: string   // 學科分類（1-20 字元）
}
```

**Returns**: `Promise<Unit>`

**Process**:
1. 驗證名稱唯一性（同 category 下）
2. 生成 kebab-case ID
3. 設定 isCustom = true
4. 儲存至 units store

**Errors**:
- `DuplicateUnitNameError`: 同 category 下名稱重複

**Example**:
```javascript
const unit = await UnitStorage.createUnit({
  name: '英文文法',
  category: '英文'
});
// unit.id = 'unit-english-grammar'
```

---

#### `deleteUnit(id)`

刪除單元（檢查是否有照片使用）。

**Parameters**:
```typescript
id: string
```

**Returns**: `Promise<void>`

**Errors**:
- `UnitInUseError`: 有照片參照此單元

**Example**:
```javascript
try {
  await UnitStorage.deleteUnit('unit-english-grammar');
} catch (error) {
  if (error instanceof UnitInUseError) {
    alert(`無法刪除，有 ${error.photoCount} 張照片使用此單元`);
  }
}
```

---

#### `initializeDefaultUnits()`

初始化預設單元列表（首次載入時呼叫）。

**Returns**: `Promise<void>`

**Note**: 僅在 units store 為空時執行

---

### 3. SettingsStorage API

管理應用程式設定。

#### `getSettings()`

取得應用程式設定。

**Returns**: `Promise<AppSettings>`

**Example**:
```javascript
const settings = await SettingsStorage.getSettings();
console.log(`當前壓縮品質: ${settings.compressionQuality}`);
```

---

#### `updateSettings(updates)`

更新部分設定。

**Parameters**:
```typescript
updates: Partial<AppSettings>
```

**Returns**: `Promise<AppSettings>`

**Example**:
```javascript
await SettingsStorage.updateSettings({
  displayMode: 'list',
  maxFileSize: 15
});
```

---

#### `resetSettings()`

重設為預設值。

**Returns**: `Promise<AppSettings>`

---

## Error Handling

所有 API 方法統一使用 Promise rejection 傳遞錯誤。

**Error Types**:

```typescript
class StorageError extends Error {
  constructor(message: string, public code: string) {
    super(message);
  }
}

// 具體錯誤類別
class InvalidFileTypeError extends StorageError {}
class FileSizeExceededError extends StorageError {}
class StorageQuotaExceededError extends StorageError {}
class CompressionError extends StorageError {}
class DuplicateUnitNameError extends StorageError {}
class UnitInUseError extends StorageError {
  constructor(message: string, public photoCount: number) {
    super(message, 'UNIT_IN_USE');
  }
}
```

**Usage**:
```javascript
try {
  await PhotoStorage.createPhoto(data, file);
} catch (error) {
  if (error instanceof FileSizeExceededError) {
    showError('檔案太大');
  } else if (error instanceof StorageQuotaExceededError) {
    showError('儲存空間不足');
  } else {
    showError('上傳失敗');
  }
}
```

---

## Database Initialization

### Initialization Flow

1. 開啟 `MistakeCollectionDB` v1
2. 建立 object stores（photos, units, settings）
3. 初始化預設單元（`UnitStorage.initializeDefaultUnits()`）
4. 初始化預設設定（`SettingsStorage.getSettings()` 自動建立）

**Code**:
```javascript
async function initializeDatabase() {
  const db = await idb.openDB('MistakeCollectionDB', 1, {
    upgrade(db) {
      // Photos store
      const photoStore = db.createObjectStore('photos', { keyPath: 'id' });
      photoStore.createIndex('uploadedAt', 'uploadedAt', { unique: false });

      // Units store
      const unitStore = db.createObjectStore('units', { keyPath: 'id' });
      unitStore.createIndex('category', 'category', { unique: false });

      // Settings store
      db.createObjectStore('settings', { keyPath: 'id' });
    }
  });

  // Initialize default units
  await UnitStorage.initializeDefaultUnits();

  return db;
}
```

---

## Testing Contracts

每個 API 方法都應有對應的單元測試：

**Test Cases**:
- ✅ Happy path（正常流程）
- ✅ 驗證錯誤（檔案類型、大小、格式）
- ✅ 邊界條件（空列表、單一項目、大量資料）
- ✅ 錯誤處理（儲存空間不足、網路錯誤）

**Example Test** (Vitest):
```javascript
describe('PhotoStorage.createPhoto', () => {
  it('should create photo with compressed images', async () => {
    const file = new File(['fake image'], 'test.jpg', { type: 'image/jpeg' });
    const photo = await PhotoStorage.createPhoto({}, file);
    
    expect(photo.id).toMatch(/^[0-9a-f]{8}-/);
    expect(photo.originalImage).toBeInstanceOf(Blob);
    expect(photo.thumbnail).toBeInstanceOf(Blob);
    expect(photo.uploadedAt).toBeInstanceOf(Date);
  });

  it('should reject invalid file type', async () => {
    const file = new File(['fake'], 'test.pdf', { type: 'application/pdf' });
    
    await expect(PhotoStorage.createPhoto({}, file))
      .rejects.toThrow(InvalidFileTypeError);
  });
});
```

---

## Performance Considerations

- **批次讀取**: `getAllPhotos()` 使用 IndexedDB cursor 批次讀取，避免記憶體溢位
- **延遲載入**: 列表頁僅載入縮圖，大圖按需載入
- **索引優化**: 使用 `uploadedAt` 索引加速排序查詢
- **快取策略**: 常用設定（AppSettings）快取於記憶體，減少 IndexedDB 查詢

---

## Version History

- **1.0.0** (2025-11-17): Initial contract definition
