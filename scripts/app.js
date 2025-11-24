// App initialization and utility functions

import { PhotoStorage, UnitStorage, SettingsStorage } from './storage.js';

// Configure Day.js
dayjs.extend(dayjs_plugin_relativeTime);
dayjs.locale('zh-tw');

// Global state
let appSettings = null;

// Initialize app
export async function initializeApp() {
    try {
        console.log('Initializing app...');
        
        // Register Service Worker for offline support
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/service-worker.js');
                console.log('Service Worker registered:', registration.scope);
            } catch (error) {
                console.warn('Service Worker registration failed:', error);
            }
        }
        
        // Load settings
        appSettings = await SettingsStorage.getSettings();
        console.log('Settings loaded:', appSettings);
        
        // Check storage quota
        await checkStorageQuota();
        
        // Show first-time user guide
        await showFirstTimeGuide();
        
        // Initialize components (will be imported by components themselves)
        console.log('App initialized successfully');
        
        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('app-initialized'));
        
    } catch (error) {
        console.error('App initialization failed:', error);
        showError('應用程式初始化失敗，請重新整理頁面');
    }
}

// Check storage quota and warn if approaching limit
export async function checkStorageQuota() {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
        try {
            const estimate = await navigator.storage.estimate();
            const usage = estimate.usage || 0;
            const quota = estimate.quota || 0;
            const percentUsed = (usage / quota) * 100;
            
            console.log(`Storage: ${(usage / 1024 / 1024).toFixed(2)}MB / ${(quota / 1024 / 1024).toFixed(2)}MB (${percentUsed.toFixed(1)}%)`);
            
            // Warn if >80% full
            if (percentUsed > 80) {
                showWarning(`儲存空間已使用 ${percentUsed.toFixed(0)}%，建議刪除部分照片或匯出備份`);
            }
            
            // Check photo count
            const photoCount = await PhotoStorage.getPhotoCount();
            if (photoCount > 200) {
                showWarning(`已儲存 ${photoCount} 張照片，建議匯出備份以釋放空間`);
            }
        } catch (error) {
            console.warn('Storage quota check failed:', error);
        }
    }
}

// Show first-time user guide
async function showFirstTimeGuide() {
    try {
        // Check if user has seen the guide
        const photoCount = await PhotoStorage.getPhotoCount();
        const hasSeenGuide = localStorage.getItem('hasSeenGuide') === 'true';
        
        if (photoCount === 0 && !hasSeenGuide) {
            const guide = document.getElementById('user-guide');
            const closeBtn = document.getElementById('close-guide');
            
            if (guide && closeBtn) {
                guide.classList.remove('hidden');
                
                closeBtn.addEventListener('click', () => {
                    guide.classList.add('hidden');
                    localStorage.setItem('hasSeenGuide', 'true');
                }, { once: true });
                
                // Close on overlay click
                const overlay = guide.querySelector('.user-guide-overlay');
                if (overlay) {
                    overlay.addEventListener('click', () => {
                        guide.classList.add('hidden');
                        localStorage.setItem('hasSeenGuide', 'true');
                    }, { once: true });
                }
            }
        }
    } catch (error) {
        console.warn('Failed to show user guide:', error);
    }
}

// Error display utility
export function showError(message) {
    showNotification(message, 'error');
}

// Success notification utility
export function showSuccess(message) {
    showNotification(message, 'success');
}

// Warning notification utility
export function showWarning(message) {
    showNotification(message, 'warning');
}

// Generic notification utility
export function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    const messageEl = document.getElementById('notification-message');
    
    if (!notification || !messageEl) {
        console.error('Notification elements not found');
        return;
    }
    
    messageEl.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.remove('hidden');
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 3000);
}

// Show loading indicator
export function showLoading(message = '處理中...') {
    const loading = document.getElementById('loading-indicator');
    const messageEl = document.getElementById('loading-message');
    
    if (loading && messageEl) {
        messageEl.textContent = message;
        loading.classList.remove('hidden');
    }
}

// Hide loading indicator
export function hideLoading() {
    const loading = document.getElementById('loading-indicator');
    if (loading) {
        loading.classList.add('hidden');
    }
}

// Show confirmation dialog
export function showConfirmDialog(title, message) {
    return new Promise((resolve) => {
        const dialog = document.getElementById('confirm-dialog');
        const titleEl = document.getElementById('confirm-title');
        const messageEl = document.getElementById('confirm-message');
        const cancelBtn = document.getElementById('confirm-cancel');
        const okBtn = document.getElementById('confirm-ok');
        
        if (!dialog || !titleEl || !messageEl || !cancelBtn || !okBtn) {
            console.error('Confirmation dialog elements not found');
            resolve(false);
            return;
        }
        
        titleEl.textContent = title;
        messageEl.textContent = message;
        dialog.classList.remove('hidden');
        
        const cleanup = () => {
            dialog.classList.add('hidden');
            cancelBtn.removeEventListener('click', handleCancel);
            okBtn.removeEventListener('click', handleOk);
        };
        
        const handleCancel = () => {
            cleanup();
            resolve(false);
        };
        
        const handleOk = () => {
            cleanup();
            resolve(true);
        };
        
        cancelBtn.addEventListener('click', handleCancel);
        okBtn.addEventListener('click', handleOk);
        
        // Close on overlay click
        const overlay = dialog.querySelector('.modal-overlay');
        if (overlay) {
            overlay.addEventListener('click', handleCancel, { once: true });
        }
    });
}

// Format time using Day.js
export function formatRelativeTime(date) {
    return dayjs(date).fromNow();
}

// Format file size
export function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1024 / 1024).toFixed(1) + ' MB';
}

// Get current settings
export function getSettings() {
    return appSettings;
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // ESC to close modal
    if (e.key === 'Escape') {
        const modals = document.querySelectorAll('.modal:not(.hidden)');
        modals.forEach(modal => {
            modal.classList.add('hidden');
        });
    }
});

// Initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// Listen for filter changes
window.addEventListener('filter-change', async (e) => {
    const filters = e.detail;
    console.log('Filters changed:', filters);
    
    // Apply filters to photo list
    const { applyFilters } = await import('./filters.js');
    const { PhotoStorage } = await import('./storage.js');
    
    try {
        // Get all photos
        const allPhotos = await PhotoStorage.getAllPhotos({
            sortBy: 'uploadedAt',
            sortOrder: 'desc'
        });
        
        // Apply filters
        const filteredPhotos = applyFilters(allPhotos, filters);
        
        // Render filtered photos
        const photoGrid = document.getElementById('photo-grid');
        const emptyState = document.getElementById('empty-state');
        
        if (!photoGrid || !emptyState) {
            return;
        }
        
        if (filteredPhotos.length === 0) {
            photoGrid.innerHTML = '';
            emptyState.classList.remove('hidden');
            
            // Update empty state message for filtered view
            const emptyContent = emptyState.querySelector('.empty-state-content');
            if (emptyContent && (filters.units?.length > 0 || filters.tags?.length > 0)) {
                emptyContent.innerHTML = `
                    <span class="empty-icon">🔍</span>
                    <h2>沒有符合條件的照片</h2>
                    <p>試試調整篩選條件</p>
                `;
            } else {
                emptyContent.innerHTML = `
                    <span class="empty-icon">📸</span>
                    <h2>還沒有錯題</h2>
                    <p>點擊上方按鈕開始上傳第一張錯題照片吧！</p>
                `;
            }
        } else {
            emptyState.classList.add('hidden');
            
            // Render photos (reuse logic from photo-list.js)
            const { renderPhotoList } = await import('./photo-list.js');
            
            // We need to pass the filtered photos, but renderPhotoList gets photos itself
            // So we'll trigger a custom event with the filtered photos
            window.dispatchEvent(new CustomEvent('render-filtered-photos', {
                detail: { photos: filteredPhotos }
            }));
        }
    } catch (error) {
        console.error('Error applying filters:', error);
    }
});
