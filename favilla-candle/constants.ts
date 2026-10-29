import { Product } from './types';
import { Language } from './store';
import { PRODUCTS_EN } from './locales/en';
import { PRODUCTS_TR } from './locales/tr';

// Helper to fetch products directly from i18n resources
export const getProducts = (language: Language): Product[] => {
    // In a real app, this might come from an API. 
    // Here we access the static data we moved into the locale files.
    
    if (language === 'tr') {
        return PRODUCTS_TR;
    }
    
    return PRODUCTS_EN;
};