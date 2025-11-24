// Filter Panel Component
// Provides filtering by units and tags

import { UnitStorage } from '../scripts/storage.js';
import { renderPhotoList } from '../scripts/photo-list.js';

class FilterPanel {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.selectedUnits = [];
        this.selectedTags = [];
        this.units = [];
        
        if (this.container) {
            this.init();
        }
    }

    async init() {
        // Load units
        await this.loadUnits();
        
        // Render filter panel
        this.render();
        
        // Attach event listeners
        this.attachEventListeners();
    }

    async loadUnits() {
        try {
            this.units = await UnitStorage.getAllUnits();
            console.log('Units loaded:', this.units.length);
        } catch (error) {
            console.error('Error loading units:', error);
            this.units = [];
        }
    }

    render() {
        // Group units by category
        const unitsByCategory = this.groupUnitsByCategory();
        
        const html = `
            <div class="filter-panel-content">
                <div class="filter-section">
                    <div class="filter-header">
                        <h3>📂 依單元篩選</h3>
                        <button class="filter-clear" id="clear-unit-filters">清除</button>
                    </div>
                    
                    <div class="unit-selector" id="unit-selector">
                        ${Object.entries(unitsByCategory).map(([category, units]) => `
                            <div class="unit-category" data-category="${category}">
                                <button class="category-toggle" data-category="${category}">
                                    <span class="toggle-icon">▼</span>
                                    <span class="category-name">${category}</span>
                                    <span class="category-count">(${units.length})</span>
                                </button>
                                <div class="unit-list" data-category="${category}">
                                    ${units.map(unit => `
                                        <label class="unit-checkbox">
                                            <input type="checkbox" 
                                                   name="unit" 
                                                   value="${unit.id}"
                                                   ${this.selectedUnits.includes(unit.id) ? 'checked' : ''}>
                                            <span class="unit-name">${unit.name}</span>
                                            ${unit.isCustom ? '<span class="custom-badge">自訂</span>' : ''}
                                        </label>
                                    `).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="custom-unit-section">
                        <button class="btn-add-unit" id="toggle-unit-form">+ 新增自訂單元</button>
                        <div class="custom-unit-form hidden" id="custom-unit-form">
                            <input type="text" 
                                   id="custom-unit-name" 
                                   placeholder="單元名稱（例：英文文法）"
                                   maxlength="50">
                            <input type="text" 
                                   id="custom-unit-category" 
                                   placeholder="分類（例：英文）"
                                   maxlength="30">
                            <div class="form-actions">
                                <button class="btn btn-secondary" id="cancel-unit">取消</button>
                                <button class="btn btn-primary" id="save-unit">儲存</button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="filter-section">
                    <div class="filter-header">
                        <h3>🏷️ 依標籤篩選</h3>
                        <button class="filter-clear" id="clear-tag-filters">清除</button>
                    </div>
                    
                    <div class="tag-filter-input">
                        <div class="tag-chips" id="selected-tag-chips">
                            ${this.selectedTags.map(tag => `
                                <span class="tag-chip" data-tag="${tag}">
                                    ${tag}
                                    <button class="tag-chip-remove" data-tag="${tag}" aria-label="移除標籤">&times;</button>
                                </span>
                            `).join('')}
                        </div>
                        <div class="tag-add-section">
                            <input type="text" 
                                   id="tag-filter-input" 
                                   placeholder="輸入標籤篩選..."
                                   maxlength="50"
                                   autocomplete="off">
                            <button class="btn-add-tag" id="add-tag-filter">+ 新增</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.container.innerHTML = html;
    }

    groupUnitsByCategory() {
        const grouped = {};
        
        this.units.forEach(unit => {
            if (!grouped[unit.category]) {
                grouped[unit.category] = [];
            }
            grouped[unit.category].push(unit);
        });
        
        // Sort units within each category
        Object.keys(grouped).forEach(category => {
            grouped[category].sort((a, b) => {
                // Default units first, then custom units
                if (a.isCustom !== b.isCustom) {
                    return a.isCustom ? 1 : -1;
                }
                return a.name.localeCompare(b.name, 'zh-TW');
            });
        });
        
        return grouped;
    }

    attachEventListeners() {
        // Category toggle
        this.container.querySelectorAll('.category-toggle').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = btn.dataset.category;
                const categoryDiv = btn.closest('.unit-category');
                const isExpanded = categoryDiv.classList.contains('expanded');
                
                if (isExpanded) {
                    categoryDiv.classList.remove('expanded');
                    btn.querySelector('.toggle-icon').textContent = '▶';
                } else {
                    categoryDiv.classList.add('expanded');
                    btn.querySelector('.toggle-icon').textContent = '▼';
                }
            });
        });

        // Expand all categories by default
        this.container.querySelectorAll('.unit-category').forEach(cat => {
            cat.classList.add('expanded');
        });

        // Unit checkbox change
        this.container.querySelectorAll('input[name="unit"]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                this.handleUnitSelectionChange(e.target);
            });
        });

        // Clear filters
        const clearBtn = this.container.querySelector('#clear-unit-filters');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearUnitFilters();
            });
        }

        // Toggle custom unit form
        const toggleFormBtn = this.container.querySelector('#toggle-unit-form');
        if (toggleFormBtn) {
            toggleFormBtn.addEventListener('click', () => {
                this.toggleCustomUnitForm();
            });
        }

        // Cancel custom unit
        const cancelBtn = this.container.querySelector('#cancel-unit');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.hideCustomUnitForm();
            });
        }

        // Save custom unit
        const saveBtn = this.container.querySelector('#save-unit');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.handleCreateCustomUnit();
            });
        }

        // Tag filter input - add tag on Enter key
        const tagInput = this.container.querySelector('#tag-filter-input');
        if (tagInput) {
            tagInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.handleAddTagFilter();
                }
            });
        }

        // Add tag button
        const addTagBtn = this.container.querySelector('#add-tag-filter');
        if (addTagBtn) {
            addTagBtn.addEventListener('click', () => {
                this.handleAddTagFilter();
            });
        }

        // Remove tag chips
        this.container.querySelectorAll('.tag-chip-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const tag = btn.dataset.tag;
                this.handleRemoveTagFilter(tag);
            });
        });

        // Clear tag filters
        const clearTagBtn = this.container.querySelector('#clear-tag-filters');
        if (clearTagBtn) {
            clearTagBtn.addEventListener('click', () => {
                this.clearTagFilters();
            });
        }
    }

    handleUnitSelectionChange(checkbox) {
        const unitId = checkbox.value;
        
        if (checkbox.checked) {
            if (!this.selectedUnits.includes(unitId)) {
                this.selectedUnits.push(unitId);
            }
        } else {
            this.selectedUnits = this.selectedUnits.filter(id => id !== unitId);
        }
        
        console.log('Selected units:', this.selectedUnits);
        
        // Dispatch filter change event
        this.dispatchFilterChange();
    }

    clearUnitFilters() {
        this.selectedUnits = [];
        this.container.querySelectorAll('input[name="unit"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        this.dispatchFilterChange();
    }

    async handleAddTagFilter() {
        const tagInput = this.container.querySelector('#tag-filter-input');
        const tag = tagInput.value.trim();
        
        // Validate tag
        if (!tag) {
            return;
        }
        
        if (tag.length > 50) {
            const { showError } = await import('../scripts/app.js');
            showError('標籤最多 50 個字元');
            return;
        }
        
        if (this.selectedTags.includes(tag)) {
            const { showError } = await import('../scripts/app.js');
            showError('此標籤已存在');
            return;
        }
        
        // Add tag
        this.selectedTags.push(tag);
        tagInput.value = '';
        
        // Re-render to show new tag chip
        this.render();
        this.attachEventListeners();
        
        // Dispatch filter change
        this.dispatchFilterChange();
    }

    handleRemoveTagFilter(tag) {
        this.selectedTags = this.selectedTags.filter(t => t !== tag);
        
        // Re-render
        this.render();
        this.attachEventListeners();
        
        // Dispatch filter change
        this.dispatchFilterChange();
    }

    clearTagFilters() {
        this.selectedTags = [];
        
        // Re-render
        this.render();
        this.attachEventListeners();
        
        // Dispatch filter change
        this.dispatchFilterChange();
    }

    toggleCustomUnitForm() {
        const form = this.container.querySelector('#custom-unit-form');
        if (form) {
            form.classList.toggle('hidden');
            
            if (!form.classList.contains('hidden')) {
                // Focus on name input
                const nameInput = form.querySelector('#custom-unit-name');
                if (nameInput) {
                    nameInput.focus();
                }
            }
        }
    }

    hideCustomUnitForm() {
        const form = this.container.querySelector('#custom-unit-form');
        if (form) {
            form.classList.add('hidden');
            // Clear inputs
            form.querySelector('#custom-unit-name').value = '';
            form.querySelector('#custom-unit-category').value = '';
        }
    }

    async handleCreateCustomUnit() {
        const nameInput = this.container.querySelector('#custom-unit-name');
        const categoryInput = this.container.querySelector('#custom-unit-category');
        
        const name = nameInput.value.trim();
        const category = categoryInput.value.trim();
        
        if (!name || !category) {
            const { showError } = await import('../scripts/app.js');
            showError('請輸入單元名稱和分類');
            return;
        }
        
        try {
            const newUnit = await UnitStorage.createUnit({ name, category });
            console.log('Custom unit created:', newUnit);
            
            const { showSuccess } = await import('../scripts/app.js');
            showSuccess(`已新增「${category} - ${name}」`);
            
            // Reload units and re-render
            await this.loadUnits();
            this.render();
            this.attachEventListeners();
            
        } catch (error) {
            console.error('Error creating custom unit:', error);
            const { showError } = await import('../scripts/app.js');
            showError(error.message || '新增單元失敗');
        }
    }

    dispatchFilterChange() {
        window.dispatchEvent(new CustomEvent('filter-change', {
            detail: {
                units: this.selectedUnits,
                tags: this.selectedTags
            }
        }));
    }

    getSelectedFilters() {
        return {
            units: this.selectedUnits,
            tags: this.selectedTags
        };
    }
}

// Initialize filter panel
let filterPanelInstance = null;

export function initFilterPanel() {
    filterPanelInstance = new FilterPanel('filter-panel');
    return filterPanelInstance;
}

export function getFilterPanel() {
    return filterPanelInstance;
}

// Auto-initialize when app is ready
window.addEventListener('app-initialized', () => {
    initFilterPanel();
});

export default FilterPanel;
