/**
 * OpenFoodFacts API Service
 * Fetches product data from the OpenFoodFacts public API
 */

import { OpenFoodFactsProduct, OpenFoodFactsResponse } from '@/types';
import axios, { isAxiosError } from 'axios';

const BASE_URL = 'https://world.openfoodfacts.org/api/v0/product';

// Configure axios with timeout
const apiClient = axios.create({
  timeout: 10000, // 10 second timeout
});

/**
 * Fetch product information by barcode
 * @param barcode - The product barcode (UPC, EAN, etc.)
 * @returns Product data or null if not found
 */
export async function fetchProductByBarcode(
  barcode: string
): Promise<OpenFoodFactsProduct | null> {
  try {
    const response = await apiClient.get<OpenFoodFactsResponse>(
      `${BASE_URL}/${barcode}.json`
    );

    // Check if product was found
    if (response.data.status === 0 || !response.data.product) {
      console.log('Product not found in OpenFoodFacts database');
      return null;
    }

    return response.data.product;
  } catch (error) {
    if (isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timed out. Please check your connection.');
      }
      if (error.response?.status === 404) {
        return null;
      }
      throw new Error(`API Error: ${error.message}`);
    }
    throw new Error('Failed to fetch product data');
  }
}

/**
 * Extract ingredients text from product data
 * Tries multiple fields as fallback
 */
export function extractIngredients(product: OpenFoodFactsProduct): string {
  // Try primary field first, then English-specific, then fallback
  return (
    product.ingredients_text ||
    product.ingredients_text_en ||
    ''
  ).trim();
}
