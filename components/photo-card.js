// Photo Card Component
// Provides unit and tag assignment functionality for photos

import { UnitStorage, PhotoStorage } from '../scripts/storage.js';

export class PhotoCardEditor {
    constructor() {
        this.currentPhoto = null;
        this.availableUnits = [];
    }

    async loadUnits() {
        try {
            this.availableUnits = await UnitStorage.getAllUnits();
        } catch (error) {
            console.error('Error loading units:', error);
            this.availableUnits = [];
        }
    }

    async openEditor(photoId) {
        try {
            // Load photo data
            this.currentPhoto = await PhotoStorage.getPhoto(photoId);
            if (!this.currentPhoto) {
                console.error('Photo not found:', photoId);
                return;
            }

            // Load units
            await this.loadUnits();

            // Show modal
            this.showEditorModal();
        } catch (error) {
            console.error('Error opening photo editor:', error);
        }
    }

    showEditorModal() {
        // Create modal
        const modal = document.createElement('div');
        modal.id = 'photo-editor-modal';
        modal.className = 'modal';
        modal.innerHTML = this.renderEditorContent();

        // Add to body
        document.body.appendChild(modal);

        // Attach event listeners
        this.attachEditorListeners(modal);
    }

    renderEditorContent() {
        const groupedUnits = this.groupUnitsByCategory();
        const selectedUnits = this.currentPhoto.units || [];
        const tags = this.currentPhoto.tags || [];

        return `
            <div class="modal-overlay"></div>
            <div class="modal-content photo-editor-content">
                <button class="modal-close" aria-label="關閉">&times;</button>
                <h2>編輯照片資訊</h2>
                
                <div class="editor-section">
                    <h3>📂 分配單元</h3>
                    <div class="unit-selector-modal">
                        ${Object.entries(groupedUnits).map(([category, units]) => `
                            <div class="unit-category-modal">
                                <h4>${category}</h4>
                                <div class="unit-options">
                                    ${units.map(unit => `
                                        <label class="unit-checkbox-modal">
                                            <input type="checkbox" 
                                                   name="photo-unit" 
                                                   value="${unit.id}"
                                                   ${selectedUnits.includes(unit.id) ? 'checked' : ''}>
                                            <span>${unit.name}</span>
                                            ${unit.isCustom ? '<span class="custom-badge">自訂</span>' : ''}
                                        </label>
                                    `).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="editor-section">
                    <h3>🏷️ 標籤</h3>
                    <div class="tag-editor">
                        <div class="tag-chips" id="editor-tag-chips">
                            ${tags.map(tag => `
                                <span class="tag-chip" data-tag="${tag}">
                                    ${tag}
                                    <button class="tag-chip-remove" data-tag="${tag}" aria-label="移除標籤">&times;</button>
                                </span>
                            `).join('')}
                        </div>
                        <div class="tag-add-section">
                            <input type="text" 
                                   id="editor-tag-input" 
                                   placeholder="新增標籤（最多 50 字元）"
                                   maxlength="50"
                                   autocomplete="off">
                            <button class="btn-add-tag" id="editor-add-tag">+ 新增</button>
                        </div>
                    </div>
                </div>

                <div class="editor-actions">
                    <button class="btn btn-secondary" id="editor-cancel">取消</button>
                    <button class="btn btn-primary" id="editor-save">儲存</button>
                </div>
            </div>
        `;
    }

    groupUnitsByCategory() {
        const grouped = {};
        
        this.availableUnits.forEach(unit => {
            if (!grouped[unit.category]) {
                grouped[unit.category] = [];
            }
            grouped[unit.category].push(unit);
        });

        return grouped;
    }

    attachEditorListeners(modal) {
        const closeBtn = modal.querySelector('.modal-close');
        const overlay = modal.querySelector('.modal-overlay');
        const cancelBtn = modal.querySelector('#editor-cancel');
        const saveBtn = modal.querySelector('#editor-save');

        const closeModal = () => {
            modal.remove();
        };

        closeBtn.addEventListener('click', closeModal);
        overlay.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);
        saveBtn.addEventListener('click', () => this.handleSave(modal));

        // ESC key to close
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', handleEsc);
            }
        };
        document.addEventListener('keydown', handleEsc);

        // Tag input - add tag on Enter key
        const tagInput = modal.querySelector('#editor-tag-input');
        if (tagInput) {
            tagInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.handleAddTag(modal);
                }
            });
        }

        // Add tag button
        const addTagBtn = modal.querySelector('#editor-add-tag');
        if (addTagBtn) {
            addTagBtn.addEventListener('click', () => {
                this.handleAddTag(modal);
            });
        }

        // Remove tag chips
        modal.querySelectorAll('.tag-chip-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const tag = btn.dataset.tag;
                this.handleRemoveTag(modal, tag);
            });
        });
    }

    async handleAddTag(modal) {
        const tagInput = modal.querySelector('#editor-tag-input');
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
        
        // Get current tags
        const currentTags = Array.from(modal.querySelectorAll('.tag-chip')).map(
            chip => chip.dataset.tag
        );
        
        if (currentTags.includes(tag)) {
            const { showError } = await import('../scripts/app.js');
            showError('此標籤已存在');
            return;
        }
        
        // Add tag chip
        const tagChipsContainer = modal.querySelector('#editor-tag-chips');
        const tagChip = document.createElement('span');
        tagChip.className = 'tag-chip';
        tagChip.dataset.tag = tag;
        tagChip.innerHTML = `
            ${tag}
            <button class="tag-chip-remove" data-tag="${tag}" aria-label="移除標籤">&times;</button>
        `;
        
        tagChipsContainer.appendChild(tagChip);
        
        // Attach remove listener
        tagChip.querySelector('.tag-chip-remove').addEventListener('click', (e) => {
            e.stopPropagation();
            this.handleRemoveTag(modal, tag);
        });
        
        // Clear input
        tagInput.value = '';
    }

    handleRemoveTag(modal, tag) {
        const tagChip = modal.querySelector(`.tag-chip[data-tag="${tag}"]`);
        if (tagChip) {
            tagChip.remove();
        }
    }

    async handleSave(modal) {
        try {
            // Get selected units
            const selectedUnits = Array.from(
                modal.querySelectorAll('input[name="photo-unit"]:checked')
            ).map(checkbox => checkbox.value);

            // Get tags
            const tags = Array.from(
                modal.querySelectorAll('.tag-chip')
            ).map(chip => chip.dataset.tag);

            // Update photo with units and tags
            await PhotoStorage.updatePhoto(this.currentPhoto.id, {
                units: selectedUnits,
                tags: tags
            });

            // Show success message
            const { showSuccess } = await import('../scripts/app.js');
            showSuccess('照片資訊已更新');

            // Close modal
            modal.remove();

            // Refresh photo list
            const { renderPhotoList } = await import('../scripts/photo-list.js');
            await renderPhotoList();

        } catch (error) {
            console.error('Error saving photo:', error);
            const { showError } = await import('../scripts/app.js');
            showError('儲存失敗，請稍後再試');
        }
    }
}

// Global instance
const photoCardEditor = new PhotoCardEditor();

export function openPhotoEditor(photoId) {
    photoCardEditor.openEditor(photoId);
}

export default { PhotoCardEditor, openPhotoEditor };
