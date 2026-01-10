/**
 * Ingredient Analyzer Service
 * Performs fuzzy matching of ingredients against the user's blacklist
 */

import { AnalysisResult, BlacklistItem, OpenFoodFactsProduct } from '@/types';
import { extractIngredients } from './api';

/**
 * Normalize a string for comparison
 * - Converts to lowercase
 * - Removes extra whitespace
 * - Removes common punctuation
 */
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .replace(/[(),\[\]{}:;'"]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Check if a blacklisted item appears in the ingredients text
 * Uses case-insensitive fuzzy matching
 * 
 * This performs a substring match, so:
 * - "Milk" matches "Skimmed Milk Powder"
 * - "Red 40" matches "FD&C Red 40"
 * - "Gluten" matches "Contains Gluten"
 */
function findMatch(
  blacklistItem: string,
  ingredientsText: string
): boolean {
  const normalizedBlacklist = normalizeString(blacklistItem);
  const normalizedIngredients = normalizeString(ingredientsText);
  
  // Perform substring match (fuzzy)
  return normalizedIngredients.includes(normalizedBlacklist);
}

/**
 * Analyze a product's ingredients against the user's blacklist
 * 
 * @param product - The product data from OpenFoodFacts
 * @param blacklist - The user's list of ingredients to avoid
 * @returns Analysis result with safety status and matched ingredients
 */
export function analyzeProduct(
  product: OpenFoodFactsProduct,
  blacklist: BlacklistItem[]
): AnalysisResult {
  const ingredientsText = extractIngredients(product);
  
  // Find all matching blacklisted ingredients
  const matchedIngredients: string[] = [];
  
  for (const item of blacklist) {
    if (findMatch(item.name, ingredientsText)) {
      matchedIngredients.push(item.name);
    }
  }
  
  return {
    isSafe: matchedIngredients.length === 0,
    matchedIngredients,
    fullIngredientsList: ingredientsText || 'No ingredients listed',
    productName: product.product_name || 'Unknown Product',
    barcode: product.code || '',
  };
}

/**
 * Perform a quick safety check without full analysis
 * Useful for quick validation
 */
export function quickSafetyCheck(
  ingredientsText: string,
  blacklist: BlacklistItem[]
): boolean {
  for (const item of blacklist) {
    if (findMatch(item.name, ingredientsText)) {
      return false; // Not safe
    }
  }
  return true; // Safe
}
