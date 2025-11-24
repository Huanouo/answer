# Quickstart Guide: 錯題收集網站

**Feature**: 001-mistake-collection-site  
**Date**: 2025-11-17  
**Target Audience**: 開發者

## 專案概述

錯題收集網站是一個純前端靜態應用程式，讓學生可以上傳、管理和分類錯題照片。所有資料儲存在瀏覽器本地端（IndexedDB），支援離線使用，可部署至 GitHub Pages。

---

## 快速開始

### Prerequisites

- 現代瀏覽器（Chrome 90+, Firefox 88+, Safari 14+）
- 本地端網頁伺服器（開發用，如 `python -m http.server` 或 VS Code Live Server）
- Node.js 18+（僅用於測試，非必要）

### 開發環境設定

```bash
# 1. Clone repository
git clone <repository-url>
cd answer

# 2. Checkout feature branch
git checkout 001-mistake-collection-site

# 3. 啟動本地端伺服器
cd frontend/src
python -m http.server 8000

# 或使用 VS Code Live Server extension
# 右鍵點擊 index.html → Open with Live Server

# 4. 開啟瀏覽器
open http://localhost:8000
```

### 目錄結構

```
frontend/
├── src/
│   ├── index.html              # 主頁面
│   ├── styles/
│   │   ├── main.css            # 全域樣式
│   │   └── components.css      # 元件樣式
│   ├── scripts/
│   │   ├── app.js              # 應用程式入口
│   │   ├── storage.js          # IndexedDB API 實作
│   │   ├── photo-upload.js     # 照片上傳邏輯
│   │   ├── photo-list.js       # 照片列表顯示
│   │   └── filters.js          # 篩選功能
│   ├── components/
│   │   ├── upload-button.js    # 上傳按鈕元件
│   │   ├── photo-card.js       # 照片卡片元件
│   │   └── filter-panel.js     # 篩選面板元件
│   └── assets/
│       └── icons/              # SVG 圖示
└── tests/
    ├── unit/
    └── integration/
```

---

## 核心技術棧

| 技術 | 版本 | 用途 |
|------|------|------|
| **JavaScript** | ES6+ | 核心語言（原生，無框架） |
| **IndexedDB** | - | 本地端資料庫 |
| **idb** | 7.x | IndexedDB Promise 封裝 |
| **Compressor.js** | 1.2.x | 照片壓縮 |
| **Iodine.js** | 8.x | 表單驗證 |
| **Day.js** | 1.11.x | 時間格式化 |
| **Vitest** | 1.x | 測試框架（dev） |

---

## 開發工作流程

### Phase 0: Setup (已完成)

- [x] 建立專案結構
- [x] 初始化 Git branch
- [x] 安裝依賴套件

### Phase 1: Foundational

實作核心基礎設施，阻塞所有使用者故事。

**Tasks**:
1. 實作 IndexedDB 初始化（`storage.js`）
2. 實作 Storage API（PhotoStorage, UnitStorage, SettingsStorage）
3. 實作照片壓縮功能（Compressor.js 整合）
4. 建立基本 HTML 結構和 CSS 樣式系統
5. 實作 Service Worker 框架（離線支援）

**Test**:
```bash
npm test -- storage.test.js
```

**Deliverable**: 可在 DevTools Console 中測試 Storage API

---

### Phase 2: P1 - 上傳錯題照片

實作第一個使用者故事。

**Tasks**:
1. 建立上傳按鈕 UI（支援檔案選擇和相機拍照）
2. 實作檔案驗證（類型、大小）
3. 整合 Storage API（createPhoto）
4. 實作上傳進度指示
5. 實作成功/失敗回饋訊息

**Component Code**:
```javascript
// components/upload-button.js
class UploadButton {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.render();
    this.attachListeners();
  }

  render() {
    this.container.innerHTML = `
      <label class="upload-btn">
        <input type="file" accept="image/*" capture="environment" hidden>
        <span>📷 上傳錯題</span>
      </label>
    `;
  }

  async handleFileSelect(file) {
    try {
      // Validate
      if (!file.type.startsWith('image/')) {
        throw new InvalidFileTypeError('只接受圖片檔案');
      }
      
      // Upload
      const photo = await PhotoStorage.createPhoto({}, file);
      
      // Notify success
      this.showSuccess('照片上傳成功！');
      
      // Trigger refresh
      this.dispatchEvent('photo-uploaded', { photo });
    } catch (error) {
      this.showError(error.message);
    }
  }
}
```

**Test Scenario**:
```
Given 使用者在網站首頁
When 點擊上傳按鈕並選擇一張照片
Then 照片成功上傳並顯示在錯題列表中
```

---

### Phase 3: P2 - 瀏覽錯題集

**Tasks**:
1. 建立照片列表 UI（網格佈局）
2. 實作照片卡片元件（顯示縮圖、時間）
3. 整合 getAllPhotos API
4. 實作大圖檢視（點擊放大）
5. 實作空白狀態提示

**Key Function**:
```javascript
// scripts/photo-list.js
async function renderPhotoList() {
  const photos = await PhotoStorage.getAllPhotos({
    sortBy: 'uploadedAt',
    sortOrder: 'desc'
  });

  if (photos.length === 0) {
    showEmptyState();
    return;
  }

  const grid = document.getElementById('photo-grid');
  grid.innerHTML = photos.map(photo => `
    <div class="photo-card" data-id="${photo.id}">
      <img src="${URL.createObjectURL(photo.thumbnail)}" alt="錯題照片">
      <div class="photo-meta">
        <span class="time">${formatTime(photo.uploadedAt)}</span>
      </div>
    </div>
  `).join('');
}
```

---

### Phase 4: P3 - 刪除錯題

**Tasks**:
1. 在照片卡片加入刪除按鈕
2. 實作確認對話框
3. 整合 deletePhoto API
4. 更新列表顯示

---

### Phase 5: P4 - 單元分類

**Tasks**:
1. 建立單元選擇器 UI（多選 checkbox）
2. 顯示預設單元列表
3. 實作自訂單元功能
4. 整合 updatePhoto API（儲存單元）
5. 實作單元篩選

---

### Phase 6: P5 - 標籤系統

**Tasks**:
1. 建立標籤輸入 UI（tag input component）
2. 實作標籤新增/刪除
3. 整合 updatePhoto API（儲存標籤）
4. 實作標籤篩選

---

## 測試指南

### 單元測試

```bash
# 安裝測試依賴（首次）
npm install --save-dev vitest jsdom @testing-library/dom

# 執行所有測試
npm test

# 執行特定測試
npm test storage.test.js

# 監視模式（開發中）
npm test -- --watch
```

### 手動測試

1. **上傳照片測試**:
   - 開啟網站 → 點擊上傳 → 選擇照片 → 確認顯示在列表
   - 測試行動裝置相機（使用 Chrome DevTools Device Toolbar）
   - 測試大檔案（>10MB，應顯示錯誤）
   - 測試非圖片檔案（應顯示錯誤）

2. **瀏覽照片測試**:
   - 上傳多張照片 → 確認按時間倒序排列
   - 點擊照片 → 確認大圖顯示
   - 空白狀態測試（刪除所有照片）

3. **離線測試**:
   - DevTools → Application → Service Workers → Offline
   - 重新整理頁面 → 確認仍可查看照片

---

## 除錯技巧

### IndexedDB 檢查

```javascript
// Chrome DevTools Console
// 檢查資料庫內容
const db = await idb.openDB('MistakeCollectionDB', 1);
const photos = await db.getAll('photos');
console.log(photos);

// 清空資料庫（重置測試）
await db.clear('photos');
```

### Service Worker 除錯

```
Chrome DevTools → Application → Service Workers
- 查看註冊狀態
- 點擊 "Unregister" 清除快取
- 點擊 "Update" 強制更新
```

### 常見問題

**Q: 照片上傳後沒有顯示？**
A: 檢查 Console 是否有錯誤。確認 `photo-uploaded` 事件有觸發列表刷新。

**Q: IndexedDB 錯誤 "QuotaExceededError"？**
A: 瀏覽器儲存空間已滿。清理資料或增加儲存配額（Chrome Settings → Site Settings → Storage）。

**Q: Service Worker 沒有註冊？**
A: 確認使用 HTTPS 或 localhost。HTTP 不支援 Service Worker。

---

## 部署指南

### GitHub Pages 部署

```bash
# 1. 建立 gh-pages branch
git checkout -b gh-pages

# 2. 複製 frontend/src 到根目錄
cp -r frontend/src/* .

# 3. Commit and push
git add .
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages

# 4. 在 GitHub 啟用 Pages
# Settings → Pages → Source: gh-pages branch
```

**Live URL**: `https://<username>.github.io/<repo-name>/`

---

## 效能優化

### 照片壓縮設定

```javascript
// 調整壓縮品質（trade-off：品質 vs 檔案大小）
await SettingsStorage.updateSettings({
  compressionQuality: 0.7  // 0.5-1.0，預設 0.8
});
```

### 延遲載入

```javascript
// 僅載入可見範圍的照片（虛擬捲動）
// 在 Phase 2+ 實作
```

---

## 進階功能（未來規劃）

- [ ] 資料匯出/匯入（JSON 格式）
- [ ] 雲端同步（Google Drive API）
- [ ] OCR 文字辨識（Tesseract.js）
- [ ] 錯題統計分析
- [ ] 深色模式

---

## 相關文件

- [Feature Specification](./spec.md) - 功能需求詳細說明
- [Implementation Plan](./plan.md) - 實作計劃
- [Data Model](./data-model.md) - 資料模型設計
- [Storage API Contract](./contracts/storage-api.md) - API 介面規格
- [Research](./research.md) - 技術選型研究

---

## 支援與貢獻

- **Issues**: 在 GitHub Issues 回報問題
- **PRs**: 歡迎提交改進建議
- **Code Style**: 使用 Prettier 格式化，ESLint 檢查

---

**Last Updated**: 2025-11-17  
**Maintainer**: Answer Project Team
