/**
 * Result Screen (Modal)
 * Displays the analysis result showing if product is safe or unsafe
 */

import { ThemedText } from '@/components/themed-text';
import { AnalysisResult } from '@/types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ResultScreen() {
  const { result } = useLocalSearchParams<{ result: string }>();
  const router = useRouter();

  // Parse the result from params
  const analysisResult: AnalysisResult = result
    ? JSON.parse(result)
    : {
        isSafe: true,
        matchedIngredients: [],
        fullIngredientsList: '',
        productName: 'Unknown',
        barcode: '',
      };

  const { isSafe, matchedIngredients, fullIngredientsList, productName } = analysisResult;

  const handleScanAgain = () => {
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: isSafe ? '#1B4332' : '#7F1D1D' }]}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Result Icon */}
          <View style={styles.iconContainer}>
            {isSafe ? (
              <View style={styles.safeIcon}>
                <ThemedText style={styles.iconText}>✓</ThemedText>
              </View>
            ) : (
              <View style={styles.unsafeIcon}>
                <ThemedText style={styles.iconText}>✕</ThemedText>
              </View>
            )}
          </View>

          {/* Result Status */}
          <ThemedText style={styles.statusText}>
            {isSafe ? 'SAFE TO EAT' : 'NOT SAFE'}
          </ThemedText>

          {/* Product Name */}
          <ThemedText style={styles.productName}>{productName}</ThemedText>

          {/* Matched Ingredients (if unsafe) */}
          {!isSafe && matchedIngredients.length > 0 && (
            <View style={styles.matchedContainer}>
              <ThemedText style={styles.matchedTitle}>
                ⚠️ Found Blacklisted Ingredients:
              </ThemedText>
              {matchedIngredients.map((ingredient, index) => (
                <View key={index} style={styles.matchedItem}>
                  <ThemedText style={styles.matchedText}>• {ingredient}</ThemedText>
                </View>
              ))}
            </View>
          )}

          {/* Safe Message */}
          {isSafe && (
            <View style={styles.safeMessageContainer}>
              <ThemedText style={styles.safeMessage}>
                No blacklisted ingredients found in this product.
              </ThemedText>
            </View>
          )}

          {/* Full Ingredients List */}
          <View style={styles.ingredientsContainer}>
            <ThemedText style={styles.ingredientsTitle}>
              Full Ingredients List:
            </ThemedText>
            <View style={styles.ingredientsBox}>
              <ThemedText style={styles.ingredientsText}>
                {fullIngredientsList || 'No ingredients information available'}
              </ThemedText>
            </View>
          </View>

          {/* Scan Again Button */}
          <TouchableOpacity
            style={styles.scanButton}
            onPress={handleScanAgain}
            accessibilityLabel="Scan another product"
            accessibilityRole="button"
          >
            <ThemedText style={styles.scanButtonText}>
              Scan Another Product
            </ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 24,
  },
  safeIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#2D6A4F',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 6,
    borderColor: '#40916C',
  },
  unsafeIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#991B1B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 6,
    borderColor: '#DC2626',
  },
  iconText: {
    fontSize: 60,
    fontWeight: 'bold',
    color: '#fff',
  },
  statusText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  productName: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 32,
  },
  matchedContainer: {
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  matchedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FCA5A5',
    marginBottom: 12,
  },
  matchedItem: {
    paddingVertical: 4,
  },
  matchedText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '500',
  },
  safeMessageContainer: {
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  safeMessage: {
    fontSize: 16,
    color: '#A7F3D0',
    textAlign: 'center',
    lineHeight: 24,
  },
  ingredientsContainer: {
    width: '100%',
    marginBottom: 32,
  },
  ingredientsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  ingredientsBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 12,
    padding: 16,
  },
  ingredientsText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 22,
  },
  scanButton: {
    width: '100%',
    backgroundColor: '#fff',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  scanButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
});
