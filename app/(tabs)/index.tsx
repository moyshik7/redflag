/**
 * Scanner Screen (Home/Scan Tab)
 * Uses the device camera to scan barcodes and check product safety
 */

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { analyzeProduct } from '@/services/analyzer';
import { fetchProductByBarcode } from '@/services/api';
import { loadBlacklist } from '@/services/storage';
import { BlacklistItem } from '@/types';
import { useFocusEffect } from '@react-navigation/native';
import { BarcodeScanningResult, CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const SCAN_AREA_SIZE = width * 0.7;

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [blacklist, setBlacklist] = useState<BlacklistItem[]>([]);
  const lastScannedRef = useRef<string | null>(null);
  
  const router = useRouter();
  const tintColor = useThemeColor({}, 'tint');

  // Load blacklist when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadBlacklistData();
      // Reset scanning state when returning to screen
      setIsScanning(true);
      lastScannedRef.current = null;
    }, [])
  );

  const loadBlacklistData = async () => {
    try {
      const items = await loadBlacklist();
      setBlacklist(items);
    } catch (error) {
      console.error('Failed to load blacklist:', error);
    }
  };

  const handleBarcodeScanned = useCallback(
    async ({ type, data }: BarcodeScanningResult) => {
      // Prevent duplicate scans
      if (!isScanning || isProcessing || data === lastScannedRef.current) {
        return;
      }

      lastScannedRef.current = data;
      setIsScanning(false);
      setIsProcessing(true);

      try {
        // Fetch product from OpenFoodFacts API
        const product = await fetchProductByBarcode(data);

        if (!product) {
          Alert.alert(
            'Product Not Found',
            `The barcode "${data}" was not found in the OpenFoodFacts database. This product may not have been added yet.`,
            [
              {
                text: 'Scan Again',
                onPress: () => {
                  setIsScanning(true);
                  lastScannedRef.current = null;
                },
              },
            ]
          );
          setIsProcessing(false);
          return;
        }

        // Analyze the product against the blacklist
        const result = analyzeProduct(product, blacklist);

        // Navigate to result screen with the analysis
        router.push({
          pathname: '/result',
          params: {
            result: JSON.stringify(result),
          },
        });
      } catch (error) {
        Alert.alert(
          'Error',
          (error as Error).message || 'Failed to scan product. Please try again.',
          [
            {
              text: 'Try Again',
              onPress: () => {
                setIsScanning(true);
                lastScannedRef.current = null;
              },
            },
          ]
        );
      } finally {
        setIsProcessing(false);
      }
    },
    [isScanning, isProcessing, blacklist, router]
  );

  // Handle permissions
  if (!permission) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color={tintColor} />
      </ThemedView>
    );
  }

  if (!permission.granted) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.permissionContainer}>
          <View style={styles.permissionContent}>
            <ThemedText type="title" style={styles.permissionTitle}>
              Camera Access Required
            </ThemedText>
            <ThemedText style={styles.permissionText}>
              We need camera permission to scan barcodes and check if products are safe for you.
            </ThemedText>
            <TouchableOpacity
              style={[styles.permissionButton, { backgroundColor: tintColor }]}
              onPress={requestPermission}
            >
              <ThemedText style={styles.permissionButtonText}>
                Grant Permission
              </ThemedText>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: [
            'ean13',
            'ean8',
            'upc_a',
            'upc_e',
            'code128',
            'code39',
            'code93',
            'itf14',
            'codabar',
          ],
        }}
        onBarcodeScanned={isScanning && !isProcessing ? handleBarcodeScanned : undefined}
      >
        {/* Overlay */}
        <View style={styles.overlay}>
          {/* Top dark area */}
          <View style={styles.overlayTop} />
          
          {/* Middle section with scan area */}
          <View style={styles.overlayMiddle}>
            <View style={styles.overlaySide} />
            <View style={styles.scanArea}>
              {/* Corner markers */}
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />
            </View>
            <View style={styles.overlaySide} />
          </View>
          
          {/* Bottom dark area */}
          <View style={styles.overlayBottom}>
            <SafeAreaView edges={['bottom']}>
              {isProcessing ? (
                <View style={styles.statusContainer}>
                  <ActivityIndicator size="large" color="#fff" />
                  <ThemedText style={styles.statusText}>
                    Analyzing product...
                  </ThemedText>
                </View>
              ) : (
                <View style={styles.statusContainer}>
                  <ThemedText style={styles.instructionText}>
                    Point camera at a barcode
                  </ThemedText>
                  {blacklist.length === 0 && (
                    <ThemedText style={styles.warningText}>
                      ⚠️ No ingredients blacklisted yet
                    </ThemedText>
                  )}
                  {blacklist.length > 0 && (
                    <ThemedText style={styles.infoText}>
                      Checking against {blacklist.length} blacklisted ingredient{blacklist.length !== 1 ? 's' : ''}
                    </ThemedText>
                  )}
                </View>
              )}
            </SafeAreaView>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
  },
  overlayTop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  overlayMiddle: {
    flexDirection: 'row',
  },
  overlaySide: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  scanArea: {
    width: SCAN_AREA_SIZE,
    height: SCAN_AREA_SIZE * 0.6,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  overlayBottom: {
    flex: 1.5,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-start',
    paddingTop: 40,
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#fff',
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 8,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 8,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 8,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 8,
  },
  statusContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 16,
    fontWeight: '500',
  },
  instructionText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  warningText: {
    color: '#FFB800',
    fontSize: 14,
    textAlign: 'center',
  },
  infoText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    textAlign: 'center',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionContent: {
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  permissionTitle: {
    textAlign: 'center',
    marginBottom: 16,
  },
  permissionText: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 32,
    lineHeight: 24,
  },
  permissionButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
