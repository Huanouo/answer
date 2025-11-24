# Implementation Plan: 錯題收集網站

**Branch**: `001-mistake-collection-site` | **Date**: 2025-11-17 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-mistake-collection-site/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

建立一個能夠上傳題目照片的錯題收集網站，使用者可以上傳、瀏覽、分類和管理錯題照片。採用前端靜態網站架構，所有資料儲存在瀏覽器本地端，支援離線使用，可部署至 GitHub Pages。功能包括照片上傳（含行動裝置相機支援）、單元分類（單層級多選）、標籤系統（自由形式）、照片瀏覽和刪除。介面使用繁體中文，遵循簡潔設計原則。

## Technical Context

**Language/Version**: HTML5, CSS3, JavaScript (ES6+)  
**Primary Dependencies**: idb (1.5KB), Compressor.js (20KB), Iodine.js (5KB), Day.js (7KB)  
**Storage**: IndexedDB (瀏覽器本地端儲存，支援大型二進制資料)  
**Testing**: Vitest + jsdom + Testing Library (開發環境)  
**Target Platform**: 現代瀏覽器（Chrome 90+, Safari 14+, Firefox 88+），支援行動裝置和桌面裝置
**Project Type**: 前端靜態網站（Single Page Application）  
**Performance Goals**: 照片上傳後 <2 秒顯示、大圖載入 <1 秒、支援 100+ 張照片無效能衰退  
**Constraints**: 離線可用、無後端伺服器、檔案大小限制 10MB/張、瀏覽器儲存空間限制  
**Scale/Scope**: 單一使用者、預期儲存 100-300 張照片、5-10 個核心功能頁面

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

驗證以下原則符合性（參考 `.specify/memory/constitution.md`）：

- [x] **功能獨立性**：使用者故事已按優先級排序（P1-P5），每個故事可獨立測試和交付（P1 上傳照片、P2 瀏覽、P3 刪除、P4 單元分類、P5 標籤）
- [x] **規格優先**：已完成 spec.md 並包含明確的 Given-When-Then 驗收條件，無模糊需求
- [x] **簡潔至上**：遵循 YAGNI 原則，採用單層級分類、前端靜態網站、本地儲存，無過度設計
- [x] **使用者視角**：規格以 5 個使用者故事為核心，每個故事說明使用者價值和使用場景
- [x] **漸進交付**：規劃 Setup → Foundational（檔案上傳、IndexedDB）→ P1（上傳）→ P2（瀏覽）→ P3-P5 的漸進路徑
- [x] **專案類型約束**：符合「前端靜態網站」約束，可部署至 GitHub Pages

**✅ 符合憲章，可進入 Phase 0 研究**

**如有違反項目**：必須在下方 Complexity Tracking 記錄理由

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# 單一專案：前端靜態網站
frontend/
├── src/
│   ├── index.html           # 主頁面入口
│   ├── styles/
│   │   ├── main.css         # 全域樣式
│   │   └── components.css   # 元件樣式
│   ├── scripts/
│   │   ├── app.js           # 應用程式入口
│   │   ├── storage.js       # IndexedDB 封裝
│   │   ├── photo-upload.js  # 照片上傳邏輯
│   │   ├── photo-list.js    # 照片列表顯示
│   │   └── filters.js       # 單元/標籤篩選
│   ├── components/
│   │   ├── upload-button.js # 上傳按鈕元件
│   │   ├── photo-card.js    # 照片卡片元件
│   │   └── filter-panel.js  # 篩選面板元件
│   └── assets/
│       └── icons/           # 圖示資源

tests/
├── unit/                    # 單元測試
│   ├── storage.test.js
│   └── filters.test.js
└── integration/             # 整合測試
    ├── upload-flow.test.js
    └── browse-flow.test.js

docs/
└── user-guide.md            # 使用說明
```

**Structure Decision**: 採用單一專案結構，因為是純前端靜態網站無需後端。使用模組化 JavaScript 組織程式碼，按功能領域（上傳、列表、篩選）分離邏輯。元件採用輕量級實作，避免引入大型框架。

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

無違反項目。本專案完全符合憲章所有原則。

---

## Planning Status

### Phase 0: Research ✅ Complete

**Generated Artifacts**:
- ✅ `research.md` - 技術選型研究與決策（7 個研究任務完成）

**Key Decisions**:
- 使用原生 JavaScript（無框架）
- IndexedDB + idb 封裝
- Vitest 測試框架
- 客戶端照片壓縮（Compressor.js）
- Service Worker 離線支援
- GitHub Pages 部署

### Phase 1: Design & Contracts ✅ Complete

**Generated Artifacts**:
- ✅ `data-model.md` - 資料模型設計（3 個實體：MistakePhoto, Unit, AppSettings）
- ✅ `contracts/storage-api.md` - Storage API 規格（PhotoStorage, UnitStorage, SettingsStorage）
- ✅ `quickstart.md` - 開發者快速上手指南
- ✅ `.github/agents/copilot-instructions.md` - GitHub Copilot 上下文更新

**Constitution Re-Check**: ✅ 符合所有原則

### Phase 2: Tasks Generation (Next Step)

使用 `/speckit.tasks` 命令生成任務清單（tasks.md），將使用者故事拆解為可執行的開發任務。

---

## Next Steps

1. **Run `/speckit.tasks`** 生成 tasks.md
2. **Run `/speckit.implement`** 開始實作
3. **Run `/speckit.analyze`** 驗證規格與實作一致性

---

## Summary

本實作計劃已完成 Phase 0（研究）和 Phase 1（設計與契約）：

- ✅ 所有 NEEDS CLARIFICATION 已解決
- ✅ 技術棧已確定（原生 JS + IndexedDB）
- ✅ 資料模型已設計（3 個實體）
- ✅ API 契約已定義（Storage API）
- ✅ 開發指南已建立（quickstart.md）
- ✅ 符合專案憲章所有原則

**Total Runtime Size**: ~35KB (libraries) + ~50KB (app code) = **<100KB**  
**Deployment Target**: GitHub Pages  
**Development Approach**: 漸進式交付（P1→P2→P3→P4→P5）
