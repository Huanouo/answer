// Photo List Display Logic

import { PhotoStorage } from './storage.js';
import { formatRelativeTime, formatFileSize, getSettings } from './app.js';

// Render photo list
export async function renderPhotoList(filterOptions = {}) {
    try {
        const photos = await PhotoStorage.getAllPhotos({
            sortBy: 'uploadedAt',
            sortOrder: 'desc',
            ...filterOptions
        });
        
        const photoGrid = document.getElementById('photo-grid');
        const emptyState = document.getElementById('empty-state');
        
        if (!photoGrid || !emptyState) {
            console.error('Photo grid or empty state element not found');
            return;
        }
        
        if (photos.length === 0) {
            photoGrid.innerHTML = '';
            emptyState.classList.remove('hidden');
            return;
        }
        
        emptyState.classList.add('hidden');
        
        // Render photo cards
        photoGrid.innerHTML = photos.map(photo => createPhotoCardHTML(photo)).join('');
        
        // Attach event listeners
        attachPhotoCardListeners();
        
    } catch (error) {
        console.error('Error rendering photo list:', error);
    }
}

// Create HTML for a photo card
function createPhotoCardHTML(photo) {
    const thumbnailURL = URL.createObjectURL(photo.thumbnail);
    const timeText = formatRelativeTime(photo.uploadedAt);
    const settings = getSettings();
    
    // Render units with unit names instead of IDs
    const unitsHTML = photo.units && photo.units.length > 0
        ? `<div class="photo-card-units">
             ${photo.units.map(unitId => {
                 const unitName = unitId.split('-').slice(2).join('-');
                 return `<span class="unit-badge" data-unit="${unitId}">${unitName}</span>`;
             }).join('')}
           </div>`
        : '';
    
    // Render tags
    const tagsHTML = photo.tags && photo.tags.length > 0
        ? `<div class="photo-card-tags">
             ${photo.tags.map(tag => `<span class="tag-badge">${tag}</span>`).join('')}
           </div>`
        : '';
    
    // File size (if enabled)
    const fileSizeHTML = settings && settings.showFileSize
        ? `<span class="photo-card-size">${formatFileSize(photo.fileSize)}</span>`
        : '';
    
    return `
        <div class="photo-card" data-photo-id="${photo.id}">
            <button class="photo-card-delete" data-photo-id="${photo.id}" aria-label="刪除">
                ×
            </button>
            <button class="photo-card-edit" data-photo-id="${photo.id}" aria-label="編輯">
                ✏️
            </button>
            <img class="photo-card-image" src="${thumbnailURL}" alt="${photo.fileName || '錯題照片'}" loading="lazy">
            <div class="photo-card-meta">
                <span class="photo-card-time">${timeText}</span>
                ${fileSizeHTML}
                ${unitsHTML}
                ${tagsHTML}
            </div>
        </div>
    `;
}

// Attach event listeners to photo cards
function attachPhotoCardListeners() {
    // Click to view full image
    document.querySelectorAll('.photo-card').forEach(card => {
        const deleteBtn = card.querySelector('.photo-card-delete');
        const editBtn = card.querySelector('.photo-card-edit');
        
        // Don't open modal when clicking delete or edit button
        card.addEventListener('click', async (e) => {
            if (e.target.closest('.photo-card-delete') || e.target.closest('.photo-card-edit')) {
                return;
            }
            
            const photoId = card.dataset.photoId;
            await openPhotoModal(photoId);
        });
    });
    
    // Delete button listeners
    document.querySelectorAll('.photo-card-delete').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const photoId = btn.dataset.photoId;
            await handlePhotoDelete(photoId);
        });
    });

    // Edit button listeners
    document.querySelectorAll('.photo-card-edit').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const photoId = btn.dataset.photoId;
            const { openPhotoEditor } = await import('../components/photo-card.js');
            openPhotoEditor(photoId);
        });
    });
}

// Open photo in modal
async function openPhotoModal(photoId) {
    try {
        const photo = await PhotoStorage.getPhoto(photoId);
        if (!photo) {
            console.error('Photo not found:', photoId);
            return;
        }
        
        const modal = document.getElementById('photo-modal');
        const modalImage = document.getElementById('modal-image');
        const closeBtn = modal.querySelector('.modal-close');
        const overlay = modal.querySelector('.modal-overlay');
        
        if (!modal || !modalImage) {
            console.error('Modal elements not found');
            return;
        }
        
        // Set image
        const imageURL = URL.createObjectURL(photo.originalImage);
        modalImage.src = imageURL;
        modalImage.alt = photo.fileName || '錯題照片';
        
        // Show modal
        modal.classList.remove('hidden');
        
        // Close handlers
        const closeModal = () => {
            modal.classList.add('hidden');
            URL.revokeObjectURL(imageURL);
        };
        
        closeBtn.addEventListener('click', closeModal, { once: true });
        overlay.addEventListener('click', closeModal, { once: true });
        
    } catch (error) {
        console.error('Error opening photo modal:', error);
    }
}

// Handle photo deletion
async function handlePhotoDelete(photoId) {
    try {
        const settings = getSettings();
        
        // Confirm deletion
        let confirmed = true;
        if (settings && settings.confirmBeforeDelete) {
            const { showConfirmDialog } = await import('./app.js');
            confirmed = await showConfirmDialog(
                '確認刪除',
                '確定要刪除此照片嗎？刪除後無法復原。'
            );
        }
        
        if (!confirmed) {
            return;
        }
        
        // Delete photo
        await PhotoStorage.deletePhoto(photoId);
        
        // Show success message
        const { showSuccess } = await import('./app.js');
        showSuccess('照片已刪除');
        
        // Refresh list
        await renderPhotoList();
        
    } catch (error) {
        console.error('Error deleting photo:', error);
        const { showError } = await import('./app.js');
        showError('刪除失敗，請稍後再試');
    }
}

// Listen for photo upload events
window.addEventListener('photo-uploaded', () => {
    renderPhotoList();
});

// Listen for filtered photos rendering
window.addEventListener('render-filtered-photos', (e) => {
    const { photos } = e.detail;
    renderFilteredPhotos(photos);
});

// Render filtered photos
function renderFilteredPhotos(photos) {
    const photoGrid = document.getElementById('photo-grid');
    const emptyState = document.getElementById('empty-state');
    
    if (!photoGrid || !emptyState) {
        console.error('Photo grid or empty state element not found');
        return;
    }
    
    emptyState.classList.add('hidden');
    
    // Render photo cards
    photoGrid.innerHTML = photos.map(photo => createPhotoCardHTML(photo)).join('');
    
    // Attach event listeners
    attachPhotoCardListeners();
}

// Initialize on load
function init() {
    renderPhotoList();
}

// Wait for app to initialize before rendering
window.addEventListener('app-initialized', init);

// Also try to render immediately in case app is already initialized
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(init, 100);
    });
} else {
    setTimeout(init, 100);
}
