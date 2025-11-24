# Data Model: 錯題收集網站

**Feature**: 001-mistake-collection-site  
**Date**: 2025-11-17  
**Status**: Design Phase

## Overview

本專案採用客戶端資料模型，所有資料儲存於使用者瀏覽器的 IndexedDB 中。資料模型設計遵循簡潔原則，僅包含必要的實體和欄位。

---

## Entities

### 1. MistakePhoto (錯題照片)

**Description**: 使用者上傳的題目照片主實體，包含照片資料和元資料。

**Fields**:

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| `id` | String (UUID v4) | Yes | 唯一識別碼 | 自動生成 |
| `originalImage` | Blob | Yes | 壓縮後的原始照片 | image/*, <1MB |
| `thumbnail` | Blob | Yes | 縮圖（300x300） | image/*, <100KB |
| `uploadedAt` | Date | Yes | 上傳時間戳記 | ISO 8601 |
| `fileName` | String | No | 原始檔案名稱 | 255 字元以內 |
| `fileSize` | Number | Yes | 原始檔案大小（bytes） | >0 |
| `units` | Array<String> | No | 所屬單元 ID 列表 | 參照 Unit.id |
| `tags` | Array<String> | No | 標籤文字列表 | 每個標籤 50 字元以內 |

**Indexes**:
- Primary: `id` (unique)
- Secondary: `uploadedAt` (for sorting by time)

**Example**:
```javascript
{
  id: "550e8400-e29b-41d4-a716-446655440000",
  originalImage: Blob (800KB),
  thumbnail: Blob (50KB),
  uploadedAt: new Date("2025-11-17T10:30:00Z"),
  fileName: "數學題目.jpg",
  fileSize: 2560000,
  units: ["unit-math-algebra", "unit-math-geometry"],
  tags: ["重要", "考前複習", "已理解"]
}
```

**State Transitions**:
1. **Created**: 照片上傳後建立，包含壓縮圖和縮圖
2. **Updated**: 修改 units 或 tags
3. **Deleted**: 從 IndexedDB 永久刪除（無軟刪除）

---

### 2. Unit (單元分類)

**Description**: 結構化的學科單元分類，採用單層級扁平結構。

**Fields**:

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| `id` | String | Yes | 唯一識別碼（kebab-case） | `unit-{category}-{name}` |
| `name` | String | Yes | 單元名稱（顯示文字） | 1-50 字元 |
| `category` | String | Yes | 學科分類（如：數學、物理） | 1-20 字元 |
| `isCustom` | Boolean | Yes | 是否為使用者自訂 | true/false |
| `createdAt` | Date | Yes | 建立時間 | ISO 8601 |

**Indexes**:
- Primary: `id` (unique)
- Secondary: `category` (for grouping)

**Default Units** (預設單元列表):
```javascript
[
  { id: "unit-math-algebra", name: "數學代數", category: "數學", isCustom: false },
  { id: "unit-math-geometry", name: "數學幾何", category: "數學", isCustom: false },
  { id: "unit-math-calculus", name: "數學微積分", category: "數學", isCustom: false },
  { id: "unit-physics-mechanics", name: "物理力學", category: "物理", isCustom: false },
  { id: "unit-physics-electromagnetism", name: "物理電磁學", category: "物理", isCustom: false },
  { id: "unit-chemistry-organic", name: "化學有機化學", category: "化學", isCustom: false },
  { id: "unit-chemistry-inorganic", name: "化學無機化學", category: "化學", isCustom: false },
]
```

**Example** (使用者自訂):
```javascript
{
  id: "unit-english-grammar",
  name: "英文文法",
  category: "英文",
  isCustom: true,
  createdAt: new Date("2025-11-17T11:00:00Z")
}
```

**State Transitions**:
1. **Preset**: 系統預設單元（首次載入時建立）
2. **Created**: 使用者新增自訂單元
3. **Deleted**: 刪除單元（需先檢查是否有照片使用）

**Validation Rules**:
- 單元名稱不可重複（不分大小寫）
- 刪除單元前必須確認無照片參照

---

### 3. AppSettings (應用程式設定)

**Description**: 全域應用程式設定和使用者偏好。

**Fields**:

| Field | Type | Required | Description | Default |
|-------|------|----------|-------------|---------|
| `id` | String | Yes | 固定為 "app-settings" | "app-settings" |
| `language` | String | Yes | 介面語言 | "zh-TW" |
| `displayMode` | String | Yes | 顯示模式（網格/列表） | "grid" |
| `gridColumns` | Object | Yes | 各斷點的網格列數 | {mobile: 1, tablet: 2, desktop: 4} |
| `showFileSize` | Boolean | Yes | 是否顯示檔案大小 | true |
| `confirmBeforeDelete` | Boolean | Yes | 刪除前確認 | true |
| `maxFileSize` | Number | Yes | 單檔大小上限（MB） | 10 |
| `compressionQuality` | Number | Yes | 壓縮品質（0-1） | 0.8 |
| `lastBackupDate` | Date | No | 最後備份時間 | null |

**Example**:
```javascript
{
  id: "app-settings",
  language: "zh-TW",
  displayMode: "grid",
  gridColumns: { mobile: 1, tablet: 2, desktop: 4 },
  showFileSize: true,
  confirmBeforeDelete: true,
  maxFileSize: 10,
  compressionQuality: 0.8,
  lastBackupDate: null
}
```

---

## Relationships

```
MistakePhoto N ─────┐
                    │
                    ├──> M Unit (多對多，透過 units 陣列)
                    │
MistakePhoto 1 ─────┘

MistakePhoto N ──── tags ────> Tags (自由文字，無實體關聯)
```

**關聯說明**:
- **MistakePhoto - Unit**: 多對多關聯，一張照片可屬於多個單元，一個單元可包含多張照片
- **Tags**: 標籤為自由形式文字，不建立獨立實體，直接儲存於 MistakePhoto.tags 陣列

---

## IndexedDB Schema

**Database Name**: `MistakeCollectionDB`  
**Version**: 1

**Object Stores**:

```javascript
// Object Store 1: photos
{
  name: "photos",
  keyPath: "id",
  indexes: [
    { name: "uploadedAt", keyPath: "uploadedAt", unique: false }
  ]
}

// Object Store 2: units
{
  name: "units",
  keyPath: "id",
  indexes: [
    { name: "category", keyPath: "category", unique: false }
  ]
}

// Object Store 3: settings
{
  name: "settings",
  keyPath: "id",
  indexes: []
}
```

---

## Data Validation Rules

### MistakePhoto Validation

1. **檔案類型**: 僅接受 `image/jpeg`, `image/png`, `image/webp`, `image/heic`
2. **檔案大小**: 原始檔案 ≤ 10MB（可在 AppSettings 調整）
3. **壓縮後大小**: originalImage < 1MB, thumbnail < 100KB
4. **Units**: 每個 unit ID 必須存在於 units store 中
5. **Tags**: 每個標籤 ≤ 50 字元，總數無限制但建議 ≤ 10 個

### Unit Validation

1. **ID 格式**: `unit-{category}-{name}` (kebab-case)
2. **名稱唯一性**: 同一 category 下名稱不可重複
3. **刪除限制**: 刪除前檢查是否有 MistakePhoto 參照

### AppSettings Validation

1. **compressionQuality**: 0.5 ≤ value ≤ 1.0
2. **maxFileSize**: 1 ≤ value ≤ 50 (MB)
3. **gridColumns**: mobile (1-2), tablet (2-3), desktop (3-6)

---

## Data Migration Strategy

**Version 1 (Current)**: 初始 schema

**Future Versions** (if needed):
- 使用 IndexedDB `onupgradeneeded` 事件處理 schema 升級
- 保留向後相容性（舊資料自動遷移）
- 在 `research.md` 記錄遷移腳本

---

## Storage Capacity Planning

**Estimated Storage per Photo**:
- Original (compressed): ~500KB
- Thumbnail: ~50KB
- Metadata: ~1KB
- **Total**: ~550KB/photo

**Capacity Calculations**:
- 100 photos: ~55MB
- 300 photos: ~165MB
- 500 photos: ~275MB

**Browser Limits**:
- Chrome: ~60% of available disk space (dynamic)
- Firefox: ~50% of available disk space
- Safari: ~1GB (iOS), unlimited (macOS)

**Recommendation**: 警告使用者當儲存超過 200 張照片（~110MB）時考慮匯出備份

---

## Data Export/Import (Future Phase)

**Export Format**: JSON + Base64 encoded images
```javascript
{
  version: 1,
  exportedAt: "2025-11-17T12:00:00Z",
  photos: [
    {
      id: "...",
      originalImage: "data:image/jpeg;base64,...",
      thumbnail: "data:image/jpeg;base64,...",
      // ... other fields
    }
  ],
  units: [...],
  settings: {...}
}
```

**Import**: 驗證 JSON schema → 檢查衝突 → 寫入 IndexedDB

---

## Summary

此資料模型設計遵循以下原則：
- ✅ **簡潔**: 僅 3 個實體（MistakePhoto, Unit, AppSettings）
- ✅ **扁平化**: 單層級分類，無複雜階層
- ✅ **自包含**: 所有資料在瀏覽器本地，無伺服器依賴
- ✅ **可擴展**: 透過 IndexedDB 版本機制支援未來遷移
- ✅ **效能優化**: 使用索引加速查詢，縮圖減少記憶體使用
