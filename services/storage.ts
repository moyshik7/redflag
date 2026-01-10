/**
 * Storage Service
 * Handles persisting the user's blacklist using AsyncStorage
 */

import { BlacklistItem } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BLACKLIST_KEY = '@is_it_safe_blacklist';

/**
 * Save the entire blacklist to AsyncStorage
 */
export async function saveBlacklist(items: BlacklistItem[]): Promise<void> {
  try {
    const jsonValue = JSON.stringify(items);
    await AsyncStorage.setItem(BLACKLIST_KEY, jsonValue);
  } catch (error) {
    console.error('Error saving blacklist:', error);
    throw new Error('Failed to save blacklist');
  }
}

/**
 * Load the blacklist from AsyncStorage
 */
export async function loadBlacklist(): Promise<BlacklistItem[]> {
  try {
    const jsonValue = await AsyncStorage.getItem(BLACKLIST_KEY);
    if (jsonValue === null) {
      return [];
    }
    return JSON.parse(jsonValue) as BlacklistItem[];
  } catch (error) {
    console.error('Error loading blacklist:', error);
    return [];
  }
}

/**
 * Add a single item to the blacklist
 */
export async function addToBlacklist(name: string): Promise<BlacklistItem[]> {
  const currentList = await loadBlacklist();
  
  // Check for duplicates (case-insensitive)
  const isDuplicate = currentList.some(
    item => item.name.toLowerCase() === name.toLowerCase()
  );
  
  if (isDuplicate) {
    throw new Error('This item is already in your blacklist');
  }
  
  const newItem: BlacklistItem = {
    id: Date.now().toString(),
    name: name.trim(),
    createdAt: Date.now(),
  };
  
  const updatedList = [...currentList, newItem];
  await saveBlacklist(updatedList);
  return updatedList;
}

/**
 * Remove an item from the blacklist by ID
 */
export async function removeFromBlacklist(id: string): Promise<BlacklistItem[]> {
  const currentList = await loadBlacklist();
  const updatedList = currentList.filter(item => item.id !== id);
  await saveBlacklist(updatedList);
  return updatedList;
}

/**
 * Clear the entire blacklist
 */
export async function clearBlacklist(): Promise<void> {
  try {
    await AsyncStorage.removeItem(BLACKLIST_KEY);
  } catch (error) {
    console.error('Error clearing blacklist:', error);
    throw new Error('Failed to clear blacklist');
  }
}
