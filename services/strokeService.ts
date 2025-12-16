
const CACHE_KEY_PREFIX = 'hanzi_writer_data_v1_';

export const getStrokeData = async (char: string): Promise<any> => {
    const cacheKey = `${CACHE_KEY_PREFIX}${char}`;
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
        try {
            return JSON.parse(cached);
        } catch (e) {
            localStorage.removeItem(cacheKey);
        }
    }

    const response = await fetch(`/data/${char}.json`);
    if (!response.ok) {
        throw new Error('Failed to load character data');
    }

    const data = await response.json();

    try {
        localStorage.setItem(cacheKey, JSON.stringify(data));
    } catch (e) {
        console.warn('LocalStorage quota exceeded, skipping stroke data cache');
    }

    return data;
};

export const prefetchStrokeData = (char: string) => {
    // Fire and forget - purely for side effect of populating cache
    getStrokeData(char).catch(() => {
        // Ignore errors during prefetch, real error handled in UI
    });
};
