/**
 * Type definitions for the "Is It Safe?" app
 */

// OpenFoodFacts API response types
export interface OpenFoodFactsProduct {
  product_name?: string;
  ingredients_text?: string;
  ingredients_text_en?: string;
  brands?: string;
  image_url?: string;
  code?: string;
}

export interface OpenFoodFactsResponse {
  status: number;
  status_verbose: string;
  product?: OpenFoodFactsProduct;
  code?: string;
}

// Analysis result types
export interface AnalysisResult {
  isSafe: boolean;
  matchedIngredients: string[];
  fullIngredientsList: string;
  productName: string;
  barcode: string;
}

// Blacklist item type
export interface BlacklistItem {
  id: string;
  name: string;
  createdAt: number;
}

// Scanner event type
export interface BarcodeScanningResult {
  type: string;
  data: string;
}
