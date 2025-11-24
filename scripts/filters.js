// Filters Logic
// Handles filtering of photos by units and tags

import { PhotoStorage } from './storage.js';

export async function getFilteredPhotos(filters = {}) {
    try {
        // Get all photos
        const allPhotos = await PhotoStorage.getAllPhotos({
            sortBy: 'uploadedAt',
            sortOrder: 'desc'
        });

        // Apply filters
        return applyFilters(allPhotos, filters);
    } catch (error) {
        console.error('Error getting filtered photos:', error);
        return [];
    }
}

export function applyFilters(photos, filters) {
    let filtered = [...photos];
    
    // Filter by units (OR logic - photo matches if it has ANY of the selected units)
    if (filters.units && filters.units.length > 0) {
        filtered = filtered.filter(photo =>
            photo.units && photo.units.some(unit => filters.units.includes(unit))
        );
    }
    
    // Filter by tags (AND logic - photo matches if it has ALL of the selected tags)
    if (filters.tags && filters.tags.length > 0) {
        filtered = filtered.filter(photo =>
            photo.tags && filters.tags.every(tag => photo.tags.includes(tag))
        );
    }
    
    return filtered;
}

export default { applyFilters, getFilteredPhotos };
