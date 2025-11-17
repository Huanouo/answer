// Storage API for錯題收集網站
// IndexedDB wrapper using idb library

// Error Classes
export class StorageError extends Error {
    constructor(message, code) {
        super(message);
        this.code = code;
        this.name = 'StorageError';
    }
}

export class InvalidFileTypeError extends StorageError {
    constructor(message = '不支援的檔案類型') {
        super(message, 'INVALID_FILE_TYPE');
        this.name = 'InvalidFileTypeError';
    }
}

export class FileSizeExceededError extends StorageError {
    constructor(message = '檔案大小超過限制') {
        super(message, 'FILE_SIZE_EXCEEDED');
        this.name = 'FileSizeExceededError';
    }
}

export class StorageQuotaExceededError extends StorageError {
    constructor(message = '儲存空間不足') {
        super(message, 'STORAGE_QUOTA_EXCEEDED');
        this.name = 'StorageQuotaExceededError';
    }
}

export class CompressionError extends StorageError {
    constructor(message = '照片壓縮失敗') {
        super(message, 'COMPRESSION_ERROR');
        this.name = 'CompressionError';
    }
}

export class DuplicateUnitNameError extends StorageError {
    constructor(message = '單元名稱已存在') {
        super(message, 'DUPLICATE_UNIT_NAME');
        this.name = 'DuplicateUnitNameError';
    }
}

export class UnitInUseError extends StorageError {
    constructor(message, photoCount) {
        super(message, 'UNIT_IN_USE');
        this.photoCount = photoCount;
        this.name = 'UnitInUseError';
    }
}

// Database initialization
const DB_NAME = 'MistakeCollectionDB';
const DB_VERSION = 1;

let dbInstance = null;

async function initDB() {
    if (dbInstance) return dbInstance;

    dbInstance = await idb.openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            // Photos store
            if (!db.objectStoreNames.contains('photos')) {
                const photoStore = db.createObjectStore('photos', { keyPath: 'id' });
                photoStore.createIndex('uploadedAt', 'uploadedAt', { unique: false });
            }

            // Units store
            if (!db.objectStoreNames.contains('units')) {
                const unitStore = db.createObjectStore('units', { keyPath: 'id' });
                unitStore.createIndex('category', 'category', { unique: false });
            }

            // Settings store
            if (!db.objectStoreNames.contains('settings')) {
                db.createObjectStore('settings', { keyPath: 'id' });
            }
        }
    });

    return dbInstance;
}

// UUID v4 generator
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Image compression utility
async function compressImage(file, quality, maxWidth) {
    return new Promise((resolve, reject) => {
        new Compressor(file, {
            quality: quality,
            maxWidth: maxWidth,
            mimeType: 'image/jpeg',
            success(result) {
                resolve(result);
            },
            error(err) {
                reject(new CompressionError(err.message));
            }
        });
    });
}

// Thumbnail generation utility
async function generateThumbnail(file) {
    return new Promise((resolve, reject) => {
        new Compressor(file, {
            quality: 0.7,
            width: 300,
            height: 300,
            resize: 'cover',
            mimeType: 'image/jpeg',
            success(result) {
                resolve(result);
            },
            error(err) {
                reject(new CompressionError(err.message));
            }
        });
    });
}

// File validation utility
async function validateFile(file, maxFileSize) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
    
    if (!allowedTypes.includes(file.type)) {
        throw new InvalidFileTypeError('僅接受 JPEG、PNG、WebP、HEIC 格式的圖片');
    }
    
    const maxSizeBytes = maxFileSize * 1024 * 1024; // Convert MB to bytes
    if (file.size > maxSizeBytes) {
        throw new FileSizeExceededError(`檔案大小不可超過 ${maxFileSize}MB`);
    }
}

// PhotoStorage API
export const PhotoStorage = {
    async createPhoto(photoData, file) {
        try {
            const db = await initDB();
            const settings = await SettingsStorage.getSettings();
            
            // Validate file
            await validateFile(file, settings.maxFileSize);
            
            // Compress original image
            const compressedImage = await compressImage(file, settings.compressionQuality, 2000);
            
            // Generate thumbnail
            const thumbnail = await generateThumbnail(file);
            
            // Create photo object
            const photo = {
                id: generateUUID(),
                originalImage: compressedImage,
                thumbnail: thumbnail,
                uploadedAt: new Date(),
                fileName: file.name,
                fileSize: file.size,
                units: photoData.units || [],
                tags: photoData.tags || []
            };
            
            // Save to IndexedDB
            await db.add('photos', photo);
            
            return photo;
        } catch (error) {
            if (error.name === 'QuotaExceededError') {
                throw new StorageQuotaExceededError('瀏覽器儲存空間不足，請刪除部分照片或清理瀏覽器資料');
            }
            throw error;
        }
    },

    async getPhoto(id) {
        const db = await initDB();
        return await db.get('photos', id);
    },

    async getAllPhotos(options = {}) {
        const db = await initDB();
        let photos = await db.getAll('photos');
        
        // Apply filters
        if (options.filterByUnits && options.filterByUnits.length > 0) {
            photos = photos.filter(photo => 
                photo.units && photo.units.some(unit => options.filterByUnits.includes(unit))
            );
        }
        
        if (options.filterByTags && options.filterByTags.length > 0) {
            photos = photos.filter(photo => 
                photo.tags && options.filterByTags.every(tag => photo.tags.includes(tag))
            );
        }
        
        // Apply sorting
        const sortBy = options.sortBy || 'uploadedAt';
        const sortOrder = options.sortOrder || 'desc';
        
        photos.sort((a, b) => {
            let aVal = a[sortBy];
            let bVal = b[sortBy];
            
            if (sortBy === 'uploadedAt') {
                aVal = new Date(aVal).getTime();
                bVal = new Date(bVal).getTime();
            }
            
            if (sortOrder === 'desc') {
                return bVal - aVal || String(bVal).localeCompare(String(aVal));
            } else {
                return aVal - bVal || String(aVal).localeCompare(String(bVal));
            }
        });
        
        // Apply pagination
        if (options.offset) {
            photos = photos.slice(options.offset);
        }
        if (options.limit) {
            photos = photos.slice(0, options.limit);
        }
        
        return photos;
    },

    async updatePhoto(id, updates) {
        const db = await initDB();
        const photo = await db.get('photos', id);
        
        if (!photo) {
            throw new Error('找不到照片');
        }
        
        const updatedPhoto = {
            ...photo,
            ...updates,
            id: photo.id, // Ensure ID doesn't change
            originalImage: photo.originalImage, // Ensure images don't change
            thumbnail: photo.thumbnail,
            uploadedAt: photo.uploadedAt,
            fileName: photo.fileName,
            fileSize: photo.fileSize
        };
        
        await db.put('photos', updatedPhoto);
        return updatedPhoto;
    },

    async deletePhoto(id) {
        const db = await initDB();
        await db.delete('photos', id);
    },

    async getPhotoCount() {
        const db = await initDB();
        const photos = await db.getAll('photos');
        return photos.length;
    }
};

// UnitStorage API
export const UnitStorage = {
    async getAllUnits() {
        const db = await initDB();
        return await db.getAll('units');
    },

    async createUnit(unitData) {
        const db = await initDB();
        const allUnits = await db.getAll('units');
        
        // Check for duplicate name in same category
        const duplicate = allUnits.find(u => 
            u.category === unitData.category && 
            u.name.toLowerCase() === unitData.name.toLowerCase()
        );
        
        if (duplicate) {
            throw new DuplicateUnitNameError(`「${unitData.category}」中已有「${unitData.name}」單元`);
        }
        
        // Generate ID (kebab-case)
        const nameSlug = unitData.name.toLowerCase().replace(/\s+/g, '-');
        const categorySlug = unitData.category.toLowerCase().replace(/\s+/g, '-');
        const id = `unit-${categorySlug}-${nameSlug}`;
        
        const unit = {
            id,
            name: unitData.name,
            category: unitData.category,
            isCustom: true,
            createdAt: new Date()
        };
        
        await db.add('units', unit);
        return unit;
    },

    async deleteUnit(id) {
        const db = await initDB();
        
        // Check if any photos use this unit
        const photos = await db.getAll('photos');
        const photosUsingUnit = photos.filter(p => p.units && p.units.includes(id));
        
        if (photosUsingUnit.length > 0) {
            throw new UnitInUseError(
                `無法刪除，有 ${photosUsingUnit.length} 張照片使用此單元`,
                photosUsingUnit.length
            );
        }
        
        await db.delete('units', id);
    },

    async initializeDefaultUnits() {
        const db = await initDB();
        const existingUnits = await db.getAll('units');
        
        if (existingUnits.length > 0) {
            return; // Already initialized
        }
        
        const defaultUnits = [
            { id: 'unit-math-algebra', name: '數學代數', category: '數學', isCustom: false, createdAt: new Date() },
            { id: 'unit-math-geometry', name: '數學幾何', category: '數學', isCustom: false, createdAt: new Date() },
            { id: 'unit-math-calculus', name: '數學微積分', category: '數學', isCustom: false, createdAt: new Date() },
            { id: 'unit-physics-mechanics', name: '物理力學', category: '物理', isCustom: false, createdAt: new Date() },
            { id: 'unit-physics-electromagnetism', name: '物理電磁學', category: '物理', isCustom: false, createdAt: new Date() },
            { id: 'unit-chemistry-organic', name: '化學有機化學', category: '化學', isCustom: false, createdAt: new Date() },
            { id: 'unit-chemistry-inorganic', name: '化學無機化學', category: '化學', isCustom: false, createdAt: new Date() }
        ];
        
        const tx = db.transaction('units', 'readwrite');
        for (const unit of defaultUnits) {
            await tx.store.add(unit);
        }
        await tx.done;
    }
};

// SettingsStorage API
export const SettingsStorage = {
    async getSettings() {
        const db = await initDB();
        let settings = await db.get('settings', 'app-settings');
        
        if (!settings) {
            // Initialize default settings
            settings = {
                id: 'app-settings',
                language: 'zh-TW',
                displayMode: 'grid',
                gridColumns: { mobile: 1, tablet: 2, desktop: 4 },
                showFileSize: true,
                confirmBeforeDelete: true,
                maxFileSize: 10,
                compressionQuality: 0.8,
                lastBackupDate: null
            };
            await db.add('settings', settings);
        }
        
        return settings;
    },

    async updateSettings(updates) {
        const db = await initDB();
        const settings = await this.getSettings();
        
        const updatedSettings = {
            ...settings,
            ...updates,
            id: 'app-settings' // Ensure ID doesn't change
        };
        
        await db.put('settings', updatedSettings);
        return updatedSettings;
    },

    async resetSettings() {
        const db = await initDB();
        await db.delete('settings', 'app-settings');
        return await this.getSettings(); // Will recreate with defaults
    }
};

// Initialize database on module load
initDB().then(() => {
    console.log('Database initialized');
    // Initialize default units
    return UnitStorage.initializeDefaultUnits();
}).then(() => {
    console.log('Default units initialized');
}).catch(err => {
    console.error('Database initialization failed:', err);
});
