<!--
Sync Impact Report - Constitution v1.0.0
========================================
Version Change: NEW → 1.0.0
Created: 2025-11-17

Principles Established:
- I. 功能獨立性 (Feature Independence)
- II. 規格優先 (Specification First)
- III. 簡潔至上 (Simplicity First)
- IV. 使用者視角 (User-Centric Focus)
- V. 漸進交付 (Incremental Delivery)

Sections Added:
- Core Principles
- Development Constraints
- Quality Gates
- Governance

Templates Status:
✅ plan-template.md - Constitution Check section aligned
✅ spec-template.md - User Stories and Requirements aligned
✅ tasks-template.md - User Story organization aligned
✅ All templates reviewed for consistency

Follow-up TODOs:
- None

Rationale for v1.0.0:
- Initial constitution establishment
- Defines foundational governance structure
- Sets baseline principles for project development
-->

# Answer 專案憲章

## 核心原則

### I. 功能獨立性

每個功能必須能夠獨立測試、獨立部署、獨立展示價值：

- 使用者故事（User Story）必須按優先級排序（P1, P2, P3...）
- 每個故事都是可獨立驗證的最小有價值增量（MVP increment）
- 實作時可以只完成 P1 就發布，其餘功能視需求逐步增加
- 避免創建僅為組織結構而存在的模組或抽象層

**理由**：獨立性確保每個開發階段都能交付可用價值，降低風險，提升靈活性。

### II. 規格優先

程式碼實作前必須完成規格文件：

- 使用 `/speckit.specify` 建立功能規格（spec.md）
- 使用 `/speckit.plan` 完成技術規劃和架構設計
- 使用 `/speckit.tasks` 生成任務清單
- 規格文件必須包含明確的驗收條件（Given-When-Then）
- 不明確的需求必須標記為 `[NEEDS CLARIFICATION]`

**理由**：規格先行確保團隊對需求有共識，避免返工，提升開發效率。

### III. 簡潔至上

不要過度設計，遵循 YAGNI（You Aren't Gonna Need It）原則：

- 只實作當前明確需要的功能
- 避免預測性抽象（speculative abstraction）
- 優先選擇簡單直接的解決方案
- 複雜性必須有明確理由，並記錄在 plan.md 的 Complexity Tracking 區段

**理由**：簡潔的程式碼更容易理解、維護和除錯，避免不必要的技術債。

### IV. 使用者視角

所有功能從使用者角度定義和驗證：

- 規格文件以使用者故事（User Scenarios）為核心
- 每個故事包含明確的使用者價值說明
- 驗收條件使用自然語言描述（Given-When-Then）
- 技術細節僅在必要時記錄在 plan.md

**理由**：使用者視角確保開發聚焦於實際價值，避免技術導向的過度工程。

### V. 漸進交付

採用增量開發，每個階段都可驗證：

- Phase 1: Setup（專案初始化）
- Phase 2: Foundational（核心基礎設施，阻塞所有使用者故事）
- Phase 3+: 按優先級逐一實作使用者故事
- 每完成一個故事就進行獨立測試和驗證
- 支援並行開發：不同故事可由不同開發者同時進行

**理由**：漸進交付降低風險，提早發現問題，確保每個階段都有可用成果。

## 開發約束

### 專案類型優先順序

1. **前端靜態網站**（預設）：可部署至 GitHub Pages
2. 其他類型需明確說明理由

### 文件建立規範

- 除非使用者明確要求，**不要建立**額外的 Markdown 文件記錄變更或總結
- 使用既有模板系統（spec.md, plan.md, tasks.md）記錄資訊
- 避免建立臨時文件或筆記

### 語言要求

- 所有規格文件、文件、對話使用**繁體中文**
- 程式碼註解和變數名稱可使用英文（依專案慣例）

### Git 操作規範

- 每個任務或邏輯群組完成後提交
- 確保 Git 操作正確執行
- 在 implement 階段確認 tasks.md 已正常打勾
- 套用框架模板時，確保不會刪除或覆蓋既有的規格文件

## 品質關卡

### Constitution Check

在 Phase 0（研究階段）前和 Phase 1（設計階段）後必須檢查：

- 功能是否可拆分為獨立的使用者故事？
- 每個故事是否有明確的優先級？
- 是否遵循簡潔至上原則（無過度設計）？
- 專案類型是否符合約束（優先靜態網站）？
- 所有複雜性是否已記錄並有充分理由？

### 規格完整性檢查

使用 `/speckit.clarify` 識別並解決規格中的模糊區域。

### 一致性檢查

使用 `/speckit.analyze` 執行：

- 規格與實作的一致性驗證
- 任務清單與使用者故事的對應檢查
- 文件間的交叉引用驗證

## 治理規範

### 憲章效力

- 本憲章優先於所有其他開發慣例和指引
- 所有拉取請求（PR）和程式碼審查必須驗證符合憲章
- 違反憲章的變更必須提供明確理由並記錄

### 修訂程序

- 使用 `/speckit.constitution` 命令更新憲章
- 修訂必須包含：
  - 版本號更新（遵循語義化版本）
  - 修訂理由說明
  - 影響範圍分析（Sync Impact Report）
  - 相關模板和文件的同步更新
- 重大修訂（MAJOR 版本）需要團隊共識

### 版本控制規則

- **MAJOR**：移除或重新定義核心原則、破壞性變更
- **MINOR**：新增原則或區段、實質性擴充指引
- **PATCH**：澄清說明、措辭修正、非語義性改進

### 合規性審查

- 每個功能規劃階段都必須執行 Constitution Check
- 專案負責人定期審查憲章遵循情況
- 發現不符合憲章的實作必須重構或提出修訂案

### 運行指引

專案開發時請遵循以下 Speckit 工作流程：

1. `/speckit.specify` - 建立功能規格
2. `/speckit.clarify` - 澄清模糊需求
3. `/speckit.plan` - 執行技術規劃
4. `/speckit.tasks` - 生成任務清單
5. `/speckit.implement` - 執行實作
6. `/speckit.analyze` - 驗證一致性

**版本**: 1.0.0 | **批准日期**: 2025-11-17 | **最後修訂**: 2025-11-17
