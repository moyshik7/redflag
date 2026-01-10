/**
 * Blacklist Screen (Settings Tab)
 * Allows users to manage their list of ingredients to avoid
 */

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import {
    addToBlacklist,
    clearBlacklist,
    loadBlacklist,
    removeFromBlacklist,
} from '@/services/storage';
import { BlacklistItem } from '@/types';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BlacklistScreen() {
  const [blacklist, setBlacklist] = useState<BlacklistItem[]>([]);
  const [newItem, setNewItem] = useState('');

  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  // Load blacklist on mount
  useEffect(() => {
    loadBlacklistData();
  }, []);

  const loadBlacklistData = async () => {
    try {
      const items = await loadBlacklist();
      setBlacklist(items);
    } catch {
      Alert.alert('Error', 'Failed to load your blacklist');
    }
  };

  const handleAddItem = async () => {
    const trimmedItem = newItem.trim();
    if (!trimmedItem) {
      Alert.alert('Error', 'Please enter an ingredient name');
      return;
    }

    try {
      const updatedList = await addToBlacklist(trimmedItem);
      setBlacklist(updatedList);
      setNewItem('');
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    }
  };

  const handleRemoveItem = useCallback(async (id: string, name: string) => {
    Alert.alert(
      'Remove Item',
      `Are you sure you want to remove "${name}" from your blacklist?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedList = await removeFromBlacklist(id);
              setBlacklist(updatedList);
            } catch {
              Alert.alert('Error', 'Failed to remove item');
            }
          },
        },
      ]
    );
  }, []);

  const handleClearAll = () => {
    if (blacklist.length === 0) return;

    Alert.alert(
      'Clear All',
      'Are you sure you want to remove all items from your blacklist?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearBlacklist();
              setBlacklist([]);
            } catch {
              Alert.alert('Error', 'Failed to clear blacklist');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: BlacklistItem }) => (
    <View style={styles.listItem}>
      <ThemedText style={styles.itemText}>{item.name}</ThemedText>
      <TouchableOpacity
        onPress={() => handleRemoveItem(item.id, item.name)}
        style={styles.deleteButton}
        accessibilityLabel={`Remove ${item.name}`}
        accessibilityRole="button"
      >
        <ThemedText style={styles.deleteButtonText}>✕</ThemedText>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <ThemedText style={styles.emptyText}>
        No ingredients in your blacklist yet.
      </ThemedText>
      <ThemedText style={styles.emptySubtext}>
        Add ingredients you want to avoid above.
      </ThemedText>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          {/* Header */}
          <View style={styles.header}>
            <ThemedText type="title" style={styles.title}>
              My Blacklist
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              Add ingredients you want to avoid
            </ThemedText>
          </View>

          {/* Input Section */}
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: backgroundColor, color: textColor, borderColor: tintColor },
              ]}
              placeholder="e.g., Red 40, Gluten, Peanuts..."
              placeholderTextColor="#888"
              value={newItem}
              onChangeText={setNewItem}
              onSubmitEditing={handleAddItem}
              returnKeyType="done"
              autoCapitalize="words"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: tintColor }]}
              onPress={handleAddItem}
              accessibilityLabel="Add ingredient"
              accessibilityRole="button"
            >
              <ThemedText style={styles.addButtonText}>Add</ThemedText>
            </TouchableOpacity>
          </View>

          {/* List Header */}
          <View style={styles.listHeader}>
            <ThemedText type="subtitle">
              Blacklisted Items ({blacklist.length})
            </ThemedText>
            {blacklist.length > 0 && (
              <TouchableOpacity onPress={handleClearAll}>
                <ThemedText style={[styles.clearButton, { color: '#E63946' }]}>
                  Clear All
                </ThemedText>
              </TouchableOpacity>
            )}
          </View>

          {/* Blacklist */}
          <FlatList
            data={blacklist}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            ListEmptyComponent={renderEmptyList}
            contentContainerStyle={
              blacklist.length === 0 ? styles.emptyList : styles.list
            }
            showsVerticalScrollIndicator={false}
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    marginTop: 20,
    marginBottom: 24,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    opacity: 0.7,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  input: {
    flex: 1,
    height: 50,
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  addButton: {
    height: 50,
    paddingHorizontal: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  clearButton: {
    fontWeight: '600',
  },
  list: {
    paddingBottom: 20,
  },
  emptyList: {
    flexGrow: 1,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
  },
  itemText: {
    fontSize: 16,
    flex: 1,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(230, 57, 70, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#E63946',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 8,
  },
  emptySubtext: {
    opacity: 0.6,
    textAlign: 'center',
  },
});
