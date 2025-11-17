// Filters Logic
// Handles filtering of photos by units and tags

export function applyFilters(photos, filters) {
    let filtered = [...photos];
    
    // Filter by units (OR logic)
    if (filters.units && filters.units.length > 0) {
        filtered = filtered.filter(photo =>
            photo.units && photo.units.some(unit => filters.units.includes(unit))
        );
    }
    
    // Filter by tags (AND logic)
    if (filters.tags && filters.tags.length > 0) {
        filtered = filtered.filter(photo =>
            photo.tags && filters.tags.every(tag => photo.tags.includes(tag))
        );
    }
    
    return filtered;
}

export default { applyFilters };
