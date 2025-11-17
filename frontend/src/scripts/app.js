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
        
        // Load settings
        appSettings = await SettingsStorage.getSettings();
        console.log('Settings loaded:', appSettings);
        
        // Check storage quota
        await checkStorageQuota();
        
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
