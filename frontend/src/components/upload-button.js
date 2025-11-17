// Upload Button Component

import { PhotoStorage, InvalidFileTypeError, FileSizeExceededError, StorageQuotaExceededError } from '../scripts/storage.js';
import { showError, showSuccess } from '../scripts/app.js';

class UploadButton {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`Container ${containerId} not found`);
            return;
        }
        
        this.render();
        this.attachListeners();
    }
    
    render() {
        this.container.innerHTML = `
            <label class="upload-btn" for="photo-upload">
                <span>📷 上傳錯題</span>
            </label>
            <input type="file" id="photo-upload" accept="image/*" capture="environment" hidden>
            <div id="upload-progress" class="upload-progress hidden"></div>
        `;
    }
    
    attachListeners() {
        const fileInput = document.getElementById('photo-upload');
        if (!fileInput) return;
        
        fileInput.addEventListener('change', (e) => {
            this.handleFileSelect(e.target.files[0]);
        });
    }
    
    async handleFileSelect(file) {
        if (!file) return;
        
        try {
            // Show progress indicator
            this.showProgress('正在處理照片...');
            
            // Upload photo
            const photo = await PhotoStorage.createPhoto({}, file);
            
            // Hide progress
            this.hideProgress();
            
            // Show success message
            showSuccess('照片上傳成功！');
            
            // Dispatch event to notify photo list
            window.dispatchEvent(new CustomEvent('photo-uploaded', { 
                detail: { photo }
            }));
            
            // Reset file input
            document.getElementById('photo-upload').value = '';
            
        } catch (error) {
            this.hideProgress();
            
            if (error instanceof InvalidFileTypeError) {
                showError('不支援的檔案類型，請選擇圖片檔案');
            } else if (error instanceof FileSizeExceededError) {
                showError(error.message);
            } else if (error instanceof StorageQuotaExceededError) {
                showError(error.message);
            } else {
                console.error('Upload error:', error);
                showError('照片上傳失敗，請稍後再試');
            }
            
            // Reset file input
            document.getElementById('photo-upload').value = '';
        }
    }
    
    showProgress(message) {
        const progress = document.getElementById('upload-progress');
        if (progress) {
            progress.textContent = message;
            progress.classList.remove('hidden');
        }
    }
    
    hideProgress() {
        const progress = document.getElementById('upload-progress');
        if (progress) {
            progress.classList.add('hidden');
        }
    }
}

// Initialize on load
function init() {
    new UploadButton('upload-container');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

export default UploadButton;
