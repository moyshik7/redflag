/**
 * Tab Layout for "Is It Safe?" App
 * Two tabs: Scan (Home) and Blacklist (Settings)
 */

import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: colorScheme === 'dark' ? '#151718' : '#fff',
          borderTopColor: colorScheme === 'dark' ? '#333' : '#e0e0e0',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Scan',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="barcode.viewfinder" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="blacklist"
        options={{
          title: 'Blacklist',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="list.bullet.clipboard" color={color} />
          ),
        }}
      />
      {/* Hide the explore tab from navigation */}
      <Tabs.Screen
        name="explore"
        options={{
          href: null, // This hides the tab
        }}
      />
    </Tabs>
  );
}
