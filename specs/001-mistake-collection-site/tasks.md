# Tasks: 錯題收集網站

**Feature**: 001-mistake-collection-site  
**Generated**: 2025-11-17  
**Input**: Design documents from `/specs/001-mistake-collection-site/`

**Tests**: Tests are NOT requested in this specification - focusing on implementation tasks only.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1=上傳照片, US2=瀏覽錯題, US3=刪除錯題, US4=單元分類, US5=標籤系統)
- All paths are relative to repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create frontend project structure per plan.md: frontend/src/, frontend/src/styles/, frontend/src/scripts/, frontend/src/components/, frontend/src/assets/icons/
- [X] T002 Create HTML entry point with basic structure in frontend/src/index.html
- [X] T003 [P] Add idb library (1.5KB) via CDN or npm in frontend/src/index.html
- [X] T004 [P] Add Compressor.js library (20KB) via CDN in frontend/src/index.html
- [X] T005 [P] Add Iodine.js library (5KB) for validation via CDN in frontend/src/index.html
- [X] T006 [P] Add Day.js library (7KB) for time formatting via CDN in frontend/src/index.html
- [X] T007 [P] Create global CSS variables and reset styles in frontend/src/styles/main.css
- [X] T008 [P] Create component styles structure in frontend/src/styles/components.css
- [X] T009 Create responsive breakpoints (mobile <640px, tablet 640-1024px, desktop >1024px) in frontend/src/styles/main.css

**Checkpoint**: Project structure created, all dependencies loaded

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T010 Define IndexedDB schema (MistakeCollectionDB v1) with photos, units, settings stores in frontend/src/scripts/storage.js
- [X] T011 Implement database initialization function with upgrade handler in frontend/src/scripts/storage.js
- [X] T012 Implement MistakePhoto entity structure per data-model.md in frontend/src/scripts/storage.js
- [X] T013 Implement Unit entity structure per data-model.md in frontend/src/scripts/storage.js
- [X] T014 Implement AppSettings entity structure per data-model.md in frontend/src/scripts/storage.js
- [X] T015 Create PhotoStorage API module skeleton in frontend/src/scripts/storage.js
- [X] T016 Create UnitStorage API module skeleton in frontend/src/scripts/storage.js
- [X] T017 Create SettingsStorage API module skeleton in frontend/src/scripts/storage.js
- [X] T018 Implement error classes (InvalidFileTypeError, FileSizeExceededError, StorageQuotaExceededError, etc.) in frontend/src/scripts/storage.js
- [X] T019 Implement UnitStorage.initializeDefaultUnits() per data-model.md (7 default units) in frontend/src/scripts/storage.js
- [X] T020 Implement SettingsStorage.getSettings() with default settings initialization in frontend/src/scripts/storage.js
- [X] T021 Implement image compression utility using Compressor.js (quality 0.8, maxWidth 2000) in frontend/src/scripts/storage.js
- [X] T022 Implement thumbnail generation utility (300x300, quality 0.7) in frontend/src/scripts/storage.js
- [X] T023 Implement file validation utility (file type, size check per AppSettings.maxFileSize) in frontend/src/scripts/storage.js
- [X] T024 Create app initialization function that opens DB and initializes defaults in frontend/src/scripts/app.js
- [X] T025 Implement error display utility for user-friendly error messages in frontend/src/scripts/app.js
- [X] T026 Implement success notification utility in frontend/src/scripts/app.js

**Checkpoint**: Foundation ready - IndexedDB initialized, Storage API skeleton ready, utilities available

---

## Phase 3: User Story 1 - 上傳錯題照片 (Priority: P1) 🎯 MVP

**Goal**: 學生可以上傳題目照片（從裝置選擇或相機拍照），系統接受照片並顯示成功確認

**Independent Test**: 開啟網站 → 點擊上傳按鈕 → 選擇照片 → 確認照片被成功接收並顯示上傳成功訊息

### Implementation for User Story 1

- [X] T027 [P] [US1] Implement PhotoStorage.createPhoto(photoData, file) per storage-api.md contract in frontend/src/scripts/storage.js
- [X] T028 [P] [US1] Implement PhotoStorage.getPhotoCount() for empty state check in frontend/src/scripts/storage.js
- [X] T029 [US1] Create upload button component HTML structure with file input (accept="image/*" capture="environment") in frontend/src/components/upload-button.js
- [X] T030 [US1] Style upload button component (mobile-first, prominent CTA) in frontend/src/styles/components.css
- [X] T031 [US1] Implement upload button file selection handler in frontend/src/components/upload-button.js
- [X] T032 [US1] Add file validation before upload (call validation utility from T023) in frontend/src/components/upload-button.js
- [X] T033 [US1] Implement upload progress indicator UI in frontend/src/components/upload-button.js
- [X] T034 [US1] Integrate PhotoStorage.createPhoto() call on file selection in frontend/src/components/upload-button.js
- [X] T035 [US1] Handle upload success - show success message and dispatch 'photo-uploaded' event in frontend/src/components/upload-button.js
- [X] T036 [US1] Handle upload errors - display user-friendly error messages per error type in frontend/src/components/upload-button.js
- [X] T037 [US1] Add upload button to main page layout in frontend/src/index.html
- [X] T038 [US1] Initialize upload button component on app load in frontend/src/scripts/app.js

**Checkpoint**: User Story 1 complete - Users can upload photos, see success/error feedback

---

## Phase 4: User Story 2 - 瀏覽錯題集 (Priority: P2)

**Goal**: 學生可以查看所有已上傳的錯題照片，最新的顯示在最前面，可點擊查看大圖

**Independent Test**: 上傳幾張照片 → 確認能在主頁面看到所有照片以時間倒序排列 → 點擊照片查看大圖

### Implementation for User Story 2

- [X] T039 [P] [US2] Implement PhotoStorage.getAllPhotos(options) per storage-api.md contract in frontend/src/scripts/storage.js
- [X] T040 [P] [US2] Implement PhotoStorage.getPhoto(id) for full image retrieval in frontend/src/scripts/storage.js
- [X] T041 [US2] Create photo grid container HTML structure in frontend/src/index.html
- [X] T042 [US2] Implement CSS Grid layout (mobile 1 col, tablet 2-3 cols, desktop 4 cols) in frontend/src/styles/main.css
- [X] T043 [US2] Create photo card component HTML template (thumbnail, upload time) in frontend/src/components/photo-card.js
- [X] T044 [US2] Style photo card component (card shadow, hover effects, responsive) in frontend/src/styles/components.css
- [X] T045 [US2] Implement photo list rendering function that calls getAllPhotos({sortBy: 'uploadedAt', sortOrder: 'desc'}) in frontend/src/scripts/photo-list.js
- [X] T046 [US2] Implement photo card generation from MistakePhoto data (use URL.createObjectURL for thumbnail) in frontend/src/scripts/photo-list.js
- [X] T047 [US2] Implement time formatting using Day.js (相對時間如「2 小時前」) in frontend/src/scripts/photo-list.js
- [X] T048 [US2] Create empty state component (friendly message encouraging first upload) in frontend/src/components/photo-card.js
- [X] T049 [US2] Add empty state check and display in photo list rendering in frontend/src/scripts/photo-list.js
- [X] T050 [US2] Create modal component for full-size image display in frontend/src/components/photo-card.js
- [X] T051 [US2] Style modal component (fullscreen overlay, close button, touch-friendly) in frontend/src/styles/components.css
- [X] T052 [US2] Implement photo click handler to open modal with full image in frontend/src/scripts/photo-list.js
- [X] T053 [US2] Implement modal close functionality (click overlay, ESC key, close button) in frontend/src/scripts/photo-list.js
- [X] T054 [US2] Listen to 'photo-uploaded' event from US1 and refresh photo list in frontend/src/scripts/photo-list.js
- [X] T055 [US2] Initialize photo list component on app load in frontend/src/scripts/app.js

**Checkpoint**: User Story 2 complete - Users can browse photos in grid, view large images in modal, see empty state

---

## Phase 5: User Story 3 - 刪除錯題 (Priority: P3)

**Goal**: 學生可以刪除特定錯題照片，系統詢問確認後將照片從列表中移除

**Independent Test**: 上傳一張照片 → 確認出現在列表 → 點擊刪除按鈕 → 確認刪除 → 照片從列表消失

### Implementation for User Story 3

- [X] T056 [US3] Implement PhotoStorage.deletePhoto(id) per storage-api.md contract in frontend/src/scripts/storage.js
- [X] T057 [US3] Add delete button to photo card component HTML template in frontend/src/components/photo-card.js
- [X] T058 [US3] Style delete button (corner position, danger color, icon) in frontend/src/styles/components.css
- [X] T059 [US3] Create confirmation dialog component (modal with confirm/cancel buttons) in frontend/src/components/photo-card.js
- [X] T060 [US3] Style confirmation dialog (centered, accessible, clear messaging) in frontend/src/styles/components.css
- [X] T061 [US3] Implement delete button click handler to show confirmation dialog in frontend/src/scripts/photo-list.js
- [X] T062 [US3] Implement confirmation handler that calls PhotoStorage.deletePhoto(id) in frontend/src/scripts/photo-list.js
- [X] T063 [US3] Implement cancellation handler to close dialog without deleting in frontend/src/scripts/photo-list.js
- [X] T064 [US3] Update photo list UI after successful deletion (remove card, show success message) in frontend/src/scripts/photo-list.js
- [X] T065 [US3] Handle delete errors and display error message in frontend/src/scripts/photo-list.js
- [X] T066 [US3] Check if list becomes empty after deletion and show empty state in frontend/src/scripts/photo-list.js

**Checkpoint**: User Story 3 complete - Users can delete photos with confirmation, UI updates correctly

---

## Phase 6: User Story 4 - 為錯題分配單元 (Priority: P4)

**Goal**: 學生可以為每張錯題選擇一個或多個所屬單元，可以篩選特定單元的錯題

**Independent Test**: 上傳照片 → 為其分配一個或多個單元 → 確認單元被保存並顯示 → 使用單元篩選功能查看結果

### Implementation for User Story 4

- [ ] T067 [P] [US4] Implement PhotoStorage.updatePhoto(id, updates) per storage-api.md contract in frontend/src/scripts/storage.js
- [ ] T068 [P] [US4] Implement UnitStorage.getAllUnits() per storage-api.md contract in frontend/src/scripts/storage.js
- [ ] T069 [P] [US4] Implement UnitStorage.createUnit(unitData) per storage-api.md contract in frontend/src/scripts/storage.js
- [ ] T070 [P] [US4] Implement UnitStorage.deleteUnit(id) with usage check per storage-api.md in frontend/src/scripts/storage.js
- [ ] T071 [US4] Create unit selector component (multi-select checkbox list grouped by category) in frontend/src/components/filter-panel.js
- [ ] T072 [US4] Style unit selector component (collapsible groups, clear visual states) in frontend/src/styles/components.css
- [ ] T073 [US4] Load and display all units (default + custom) using UnitStorage.getAllUnits() in frontend/src/components/filter-panel.js
- [ ] T074 [US4] Implement unit selection/deselection handler (multi-select logic) in frontend/src/components/filter-panel.js
- [ ] T075 [US4] Add unit selector to photo card edit mode or modal in frontend/src/components/photo-card.js
- [ ] T076 [US4] Implement save units handler that calls PhotoStorage.updatePhoto() in frontend/src/scripts/photo-list.js
- [ ] T077 [US4] Display assigned units on photo card (tags/badges below image) in frontend/src/components/photo-card.js
- [ ] T078 [US4] Style unit badges (colored tags, compact display) in frontend/src/styles/components.css
- [ ] T079 [US4] Create custom unit creation form in frontend/src/components/filter-panel.js
- [ ] T080 [US4] Implement custom unit creation handler calling UnitStorage.createUnit() in frontend/src/components/filter-panel.js
- [ ] T081 [US4] Add custom unit to unit selector after creation in frontend/src/components/filter-panel.js
- [ ] T082 [US4] Create filter panel component with unit filter UI in frontend/src/components/filter-panel.js
- [ ] T083 [US4] Style filter panel (sidebar or top panel, mobile-responsive) in frontend/src/styles/components.css
- [ ] T084 [US4] Implement unit filter logic using PhotoStorage.getAllPhotos({filterByUnits}) in frontend/src/scripts/filters.js
- [ ] T085 [US4] Connect filter panel to photo list (update list when filter changes) in frontend/src/scripts/app.js
- [ ] T086 [US4] Add filter panel to main page layout in frontend/src/index.html

**Checkpoint**: User Story 4 complete - Users can assign units to photos, create custom units, filter by units

---

## Phase 7: User Story 5 - 為錯題添加標籤 (Priority: P5)

**Goal**: 學生可以為錯題添加自由形式的標籤，可以按標籤篩選錯題

**Independent Test**: 上傳照片 → 添加多個標籤 → 確認標籤被保存並顯示 → 使用標籤篩選功能查看結果

### Implementation for User Story 5

- [ ] T087 [US5] Create tag input component (chip input with add/remove) in frontend/src/components/filter-panel.js
- [ ] T088 [US5] Style tag input component (inline chips, add button, delete icons) in frontend/src/styles/components.css
- [ ] T089 [US5] Implement tag addition handler (validate max 50 chars per tag) in frontend/src/components/filter-panel.js
- [ ] T090 [US5] Implement tag removal handler in frontend/src/components/filter-panel.js
- [ ] T091 [US5] Add tag input to photo card edit mode or modal (reuse US4 edit interface) in frontend/src/components/photo-card.js
- [ ] T092 [US5] Implement save tags handler that calls PhotoStorage.updatePhoto({tags}) in frontend/src/scripts/photo-list.js
- [ ] T093 [US5] Display assigned tags on photo card (inline badges below units) in frontend/src/components/photo-card.js
- [ ] T094 [US5] Style tag badges (different visual style from unit badges) in frontend/src/styles/components.css
- [ ] T095 [US5] Add tag filter UI to filter panel in frontend/src/components/filter-panel.js
- [ ] T096 [US5] Implement tag filter logic using PhotoStorage.getAllPhotos({filterByTags}) in frontend/src/scripts/filters.js
- [ ] T097 [US5] Connect tag filter to photo list (AND logic for multiple tags) in frontend/src/scripts/app.js
- [ ] T098 [US5] Implement combined unit + tag filtering in frontend/src/scripts/filters.js

**Checkpoint**: User Story 5 complete - Users can add tags, filter by tags, use combined unit+tag filters

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T099 [P] Implement Service Worker registration for offline support in frontend/src/scripts/service-worker.js
- [ ] T100 [P] Define Service Worker cache strategy (cache-first for static assets) in frontend/src/scripts/service-worker.js
- [ ] T101 [P] Add Service Worker install and activate event handlers in frontend/src/scripts/service-worker.js
- [ ] T102 [P] Register Service Worker in app initialization in frontend/src/scripts/app.js
- [ ] T103 [P] Add storage quota check and warning when approaching limit (>200 photos) in frontend/src/scripts/app.js
- [ ] T104 [P] Add first-time user guide/tooltip overlay in frontend/src/scripts/app.js
- [ ] T105 [P] Implement keyboard shortcuts (ESC to close modal, Enter to confirm) in frontend/src/scripts/app.js
- [ ] T106 [P] Add loading states for all async operations in frontend/src/scripts/app.js
- [ ] T107 [P] Add ARIA labels and semantic HTML for accessibility in all components
- [ ] T108 [P] Optimize image loading (lazy loading for thumbnails) in frontend/src/scripts/photo-list.js
- [ ] T109 [P] Add meta tags for mobile (viewport, theme-color, apple-touch-icon) in frontend/src/index.html
- [ ] T110 [P] Create README.md with deployment instructions per quickstart.md
- [ ] T111 Test complete user flow: upload → browse → assign units/tags → filter → delete
- [ ] T112 Test offline functionality: disable network, refresh page, verify photos visible
- [ ] T113 Test mobile camera upload on actual mobile device
- [ ] T114 Test browser storage limits with 100+ photos
- [ ] T115 Validate against all acceptance criteria in spec.md

**Checkpoint**: Application fully polished, offline-ready, tested on all target platforms

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup (T001-T009) - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational (T010-T026) completion
  - US1 (Phase 3): Can start after Foundational - No dependencies on other stories
  - US2 (Phase 4): Can start after Foundational - Depends on US1 for upload functionality to test with
  - US3 (Phase 5): Can start after Foundational - Depends on US2 for photo list UI
  - US4 (Phase 6): Can start after Foundational - Depends on US2 for photo card UI
  - US5 (Phase 7): Can start after Foundational - Depends on US4 for edit interface
- **Polish (Phase 8)**: Depends on desired user stories being complete

### User Story Dependencies

```
Foundational (T010-T026)
    ↓
US1 上傳照片 (T027-T038) ← MVP核心
    ↓
US2 瀏覽錯題 (T039-T055) ← 需要 US1 提供照片
    ↓
US3 刪除錯題 (T056-T066) ← 需要 US2 的列表 UI
    ↓
US4 單元分類 (T067-T086) ← 需要 US2 的照片卡片 UI
    ↓
US5 標籤系統 (T087-T098) ← 需要 US4 的編輯介面
```

### Within Each Phase

**Phase 1 (Setup)**: T003-T008 可並行執行

**Phase 2 (Foundational)**:
- T010-T014 可並行 (定義結構)
- T015-T017 可並行 (API skeleton)
- T021-T023 可並行 (utilities)

**Phase 3 (US1)**: T027-T028 可並行

**Phase 4 (US2)**: T039-T040 可並行，T043-T044 可並行

**Phase 5 (US3)**: T059-T060 可並行

**Phase 6 (US4)**: T067-T070 可並行

**Phase 8 (Polish)**: T099-T110 大部分可並行

### Parallel Opportunities

```bash
# Setup phase - libraries can be added in parallel
T003 [P] + T004 [P] + T005 [P] + T006 [P]

# Foundational phase - API modules in parallel
T015 PhotoStorage skeleton + T016 UnitStorage skeleton + T017 SettingsStorage skeleton

# US1 phase - Storage API methods in parallel
T027 createPhoto() + T028 getPhotoCount()

# US2 phase - Storage API methods in parallel
T039 getAllPhotos() + T040 getPhoto()

# US4 phase - Storage API methods in parallel
T067 updatePhoto() + T068 getAllUnits() + T069 createUnit() + T070 deleteUnit()

# Polish phase - most tasks can run in parallel
T099-T110 (Service Worker, accessibility, optimization, etc.)
```

---

## Implementation Strategy

### MVP First (Recommended - US1 + US2 Only)

**Week 1**: Foundation
1. Complete Phase 1: Setup (T001-T009) - 1 day
2. Complete Phase 2: Foundational (T010-T026) - 3 days
3. **VALIDATE**: Open DevTools Console, test Storage API methods manually

**Week 2**: Core Features
4. Complete Phase 3: US1 上傳照片 (T027-T038) - 2 days
5. **VALIDATE**: Upload test photo, check IndexedDB in DevTools
6. Complete Phase 4: US2 瀏覽錯題 (T039-T055) - 2 days
7. **VALIDATE**: Upload multiple photos, browse grid, view full images

**MVP Deliverable**: Students can upload and browse mistake photos (core value delivered!)

### Full Feature Delivery

**Week 3**: Management Features
8. Complete Phase 5: US3 刪除錯題 (T056-T066) - 1 day
9. Complete Phase 6: US4 單元分類 (T067-T086) - 3 days
10. **VALIDATE**: Assign units, test filtering

**Week 4**: Advanced Features + Polish
11. Complete Phase 7: US5 標籤系統 (T087-T098) - 2 days
12. Complete Phase 8: Polish (T099-T115) - 2 days
13. **VALIDATE**: Run all quickstart.md test scenarios

### Parallel Team Strategy (If 3 developers available)

**After Foundational phase completes:**
- Developer A: US1 + US2 (核心流程)
- Developer B: US3 + US4 (管理功能)
- Developer C: US5 + Polish (進階功能)

**Integration**: US2 provides UI structure that US3/US4 can build upon

---

## Task Summary

**Total Tasks**: 115
- Phase 1 Setup: 9 tasks
- Phase 2 Foundational: 17 tasks (BLOCKING)
- Phase 3 US1 上傳照片: 12 tasks
- Phase 4 US2 瀏覽錯題: 17 tasks
- Phase 5 US3 刪除錯題: 11 tasks
- Phase 6 US4 單元分類: 20 tasks
- Phase 7 US5 標籤系統: 12 tasks
- Phase 8 Polish: 17 tasks

**Parallel Opportunities**: 25+ tasks marked [P]

**Independent Test Points**: 5 user stories (each independently testable)

**MVP Scope**: Phase 1 + Phase 2 + Phase 3 (US1) + Phase 4 (US2) = 55 tasks

---

## Success Metrics (from spec.md)

Validate these after implementation:

- [ ] SC-001: 上傳照片需 ≤3 次點擊
- [ ] SC-002: 照片上傳後 <2 秒顯示在列表
- [ ] SC-003: 支援 100+ 張照片無效能衰退
- [ ] SC-004: 響應式設計在手機/平板/桌面正常運作
- [ ] SC-005: 離線狀態可瀏覽已上傳照片
- [ ] SC-006: 首次使用者 1 分鐘內理解如何上傳
- [ ] SC-007: 全繁體中文介面
- [ ] SC-008: 可部署至 GitHub Pages
- [ ] SC-009: 大圖載入 <1 秒
- [ ] SC-010: 90% 使用者完成完整流程

---

## Notes

- **No tests**: This specification does not require automated tests - focus on functional implementation
- **Mobile-first**: Design for mobile devices first, then expand to larger screens
- **Offline-first**: All data local, network only for initial load and Service Worker
- **Incremental value**: Each user story delivers independent value
- **Files referenced**: All tasks include specific file paths per plan.md structure
- **Checkboxes ready**: All tasks use `- [ ]` format for tracking in implementation phase
