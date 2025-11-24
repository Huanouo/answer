# Phase 0: Research & Decisions

**Feature**: 錯題收集網站  
**Date**: 2025-11-17  
**Status**: Complete

## Research Tasks

### 1. Primary Dependencies - 框架選擇

**Research Question**: 靜態網站是否需要前端框架？若需要，哪個框架最適合此專案？

**Decision**: 使用原生 JavaScript（Vanilla JS）+ 少量工具函式庫

**Rationale**:
- **簡潔至上原則**: 專案功能範圍小（5 個使用者故事），不需要 React/Vue 等大型框架
- **無建置步驟**: 原生 JS 可直接部署至 GitHub Pages，無需 Node.js 建置流程
- **效能考量**: 無框架意味著更小的初始載入體積（<50KB vs 框架的 100-200KB）
- **學習曲線**: 原生 JS 更容易理解和維護，符合「不要過度設計」原則
- **離線支援**: Service Worker 搭配原生 JS 即可實現完整離線功能

**Alternatives Considered**:
- **React/Vue**: 過於複雜，需要建置工具鏈，違反簡潔原則
- **Alpine.js**: 輕量級（15KB），但對於此專案仍非必要
- **Lit/Preact**: 輕量但增加額外抽象層，當前需求用原生 JS 已足夠

**Selected Tools**:
- **Iodine.js** (5KB): 表單驗證（檔案類型、大小驗證）
- **Day.js** (7KB): 時間格式化（顯示上傳時間）
- **Compressor.js** (20KB): 照片壓縮（優化儲存空間）

---

### 2. Storage - IndexedDB 實作方式

**Research Question**: IndexedDB 是否需要封裝函式庫？如何處理照片二進制資料？

**Decision**: 使用 idb (Jake Archibald's IndexedDB Promised library, 1.5KB) 封裝 IndexedDB

**Rationale**:
- **Promise 介面**: 原生 IndexedDB 使用 callback，idb 提供 async/await 介面，程式碼更清晰
- **極輕量**: 僅 1.5KB gzipped，幾乎無負擔
- **穩定成熟**: Google 團隊維護，廣泛使用於 PWA 專案
- **二進制支援**: IndexedDB 原生支援 Blob 儲存，適合照片資料

**Alternatives Considered**:
- **原生 IndexedDB**: 語法複雜，錯誤處理困難，開發效率低
- **Dexie.js** (27KB): 功能強大但對此專案過於複雜
- **LocalForage** (22KB): 自動降級至 localStorage，但我們明確需要 IndexedDB 的大容量支援

**Data Schema**:
```javascript
{
  id: 'uuid-v4',           // 唯一識別碼
  image: Blob,             // 照片二進制資料
  timestamp: Date,         // 上傳時間
  units: ['數學代數'],     // 單元分類（陣列，支援多選）
  tags: ['重要', '考前複習'] // 標籤（陣列，無限制）
}
```

---

### 3. Testing - 靜態網站測試工具

**Research Question**: 如何測試前端靜態網站？需要哪些測試工具？

**Decision**: 使用 Vitest + jsdom + Testing Library

**Rationale**:
- **Vitest**: 快速的現代測試框架，支援 ES Modules，無需複雜設定
- **jsdom**: 模擬瀏覽器環境（DOM、localStorage、IndexedDB mock）
- **Testing Library**: 從使用者角度測試（點擊、輸入、視覺回饋）
- **可選 E2E**: Playwright（用於 P1-P2 關鍵流程的瀏覽器測試）

**Alternatives Considered**:
- **Jest**: 設定複雜，對 ES Modules 支援不如 Vitest
- **純手動測試**: 不可靠，無法保證回歸測試
- **Cypress**: E2E 專用，對單元測試過於重量級

**Testing Strategy**:
- **Unit Tests**: storage.js（IndexedDB 操作）、filters.js（篩選邏輯）
- **Integration Tests**: 上傳流程（檔案選擇→驗證→儲存→顯示）、刪除流程（確認對話框→移除→更新列表）
- **E2E Tests** (optional Phase 3+): 關鍵使用者流程（P1 上傳、P2 瀏覽）

---

### 4. Image Processing - 照片處理最佳實務

**Research Question**: 如何處理大尺寸照片？是否需要壓縮？如何顯示縮圖？

**Decision**: 客戶端壓縮 + 雙版本儲存（原圖 + 縮圖）

**Rationale**:
- **瀏覽器限制**: IndexedDB 總容量有限（~50MB-500MB 視瀏覽器），需壓縮節省空間
- **效能考量**: 列表頁載入原圖會很慢，需要縮圖加速渲染
- **離線可用**: 客戶端壓縮不依賴伺服器，符合靜態網站架構

**Implementation**:
1. **Upload**: 使用 Compressor.js 壓縮原圖至 <1MB（quality: 0.8）
2. **Thumbnail**: 生成 300x300 縮圖用於列表顯示
3. **Storage**: 儲存兩個 Blob（compressed original + thumbnail）

**Alternatives Considered**:
- **僅儲存原圖**: 浪費空間，列表載入慢
- **僅儲存縮圖**: 無法查看高解析度細節
- **伺服器端處理**: 違反靜態網站架構

---

### 5. Responsive Design - 響應式設計策略

**Research Question**: 如何確保手機、平板、桌面裝置的良好體驗？

**Decision**: Mobile-first CSS + CSS Grid/Flexbox + 原生相機 API

**Rationale**:
- **Mobile-first**: 主要使用場景是手機拍照上傳，先設計手機版再擴展至桌面
- **CSS Grid**: 照片網格自動調整列數（手機 1 列、平板 2-3 列、桌面 4 列）
- **Native Camera**: `<input type="file" accept="image/*" capture="environment">` 直接呼叫相機

**Breakpoints**:
- Mobile: < 640px（1 列網格）
- Tablet: 640px - 1024px（2-3 列網格）
- Desktop: > 1024px（4 列網格）

**Alternatives Considered**:
- **CSS Framework** (Bootstrap/Tailwind): 過於複雜，手寫 CSS 已足夠
- **Media Query 自動生成工具**: 當前規模不需要

---

### 6. Offline Support - 離線功能實作

**Research Question**: 如何實現完整的離線支援？Service Worker 如何設定？

**Decision**: Service Worker + Cache-first 策略

**Rationale**:
- **PWA 標準**: Service Worker 是實現離線功能的標準方式
- **Cache-first**: 靜態資源（HTML/CSS/JS）優先從快取載入，確保離線可用
- **Background Sync** (optional): 若未來需要，可加入離線上傳排隊功能

**Service Worker Caching Strategy**:
```javascript
// Cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('v1').then((cache) => {
      return cache.addAll([
        '/index.html',
        '/styles/main.css',
        '/scripts/app.js',
        // ... other static files
      ]);
    })
  );
});

// Cache-first for static, network-only for IndexedDB
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('indexedDB')) {
    return; // Let IndexedDB handle its own requests
  }
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

**Alternatives Considered**:
- **Application Cache** (deprecated): 已被棄用
- **Pure localStorage**: 無法儲存照片（5MB 限制）

---

### 7. Deployment - GitHub Pages 部署策略

**Research Question**: 如何部署至 GitHub Pages？需要建置步驟嗎？

**Decision**: 直接部署 frontend/ 目錄，無需建置

**Rationale**:
- **原生 JS**: 無需 npm build，直接服務靜態檔案
- **GitHub Actions**: 可選自動化部署（push to main → deploy）
- **Custom Domain** (optional): 支援自訂網域

**Deployment Steps**:
1. 將 `frontend/src` 內容 push 至 `gh-pages` 分支
2. 在 GitHub Settings 啟用 GitHub Pages（source: gh-pages branch）
3. (Optional) 設定 GitHub Actions 自動化

**Alternatives Considered**:
- **Vercel/Netlify**: 功能過剩，GitHub Pages 已足夠
- **需建置的部署**: 增加複雜度，違反簡潔原則

---

## Technology Stack Summary

| Layer | Technology | Size | Rationale |
|-------|-----------|------|-----------|
| **Core** | Vanilla JavaScript (ES6+) | - | 簡潔、無建置步驟 |
| **Storage** | IndexedDB (via idb) | 1.5KB | 大容量二進制支援 |
| **Validation** | Iodine.js | 5KB | 輕量表單驗證 |
| **Image** | Compressor.js | 20KB | 客戶端照片壓縮 |
| **Time** | Day.js | 7KB | 時間格式化 |
| **Testing** | Vitest + jsdom | dev-only | 現代快速測試 |
| **Offline** | Service Worker | - | PWA 標準 |
| **UI** | CSS Grid/Flexbox | - | 原生響應式 |

**Total Runtime Size**: ~35KB (libraries) + ~50KB (app code) = **<100KB** 初始載入

---

## Resolved Clarifications

All NEEDS CLARIFICATION items from Technical Context have been resolved:

- ✅ **Primary Dependencies**: 原生 JS + idb + Compressor.js + Iodine.js + Day.js
- ✅ **Testing**: Vitest + jsdom + Testing Library (+ optional Playwright for E2E)

---

## Next Steps

Proceed to **Phase 1: Design & Contracts**:
1. Create `data-model.md` (entity definitions)
2. Create `contracts/` (API 規格 - 對於靜態網站，定義 IndexedDB schema 和 storage API)
3. Create `quickstart.md` (開發者快速上手指南)
4. Run `.specify/scripts/bash/update-agent-context.sh copilot`
5. Re-check Constitution compliance
