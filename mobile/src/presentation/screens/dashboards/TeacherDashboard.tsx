import { DASHBOARD_CONFIG } from '@/core/config/dashboard';
import { useTheme } from '@/core/theme/ThemeContext';
import { QuickActionGrid } from '@/presentation/components/dashboard/QuickActionGrid';
import { ThemedCard } from '@/presentation/components/ThemedCard';
import { ThemedText } from '@/presentation/components/ThemedText';
import { ThemedView } from '@/presentation/components/ThemedView';
import { useAuth } from '@/presentation/hooks/useAuth';
import { useDashboard } from '@/presentation/hooks/useDashboard';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import {
  Dimensions,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


const styles = StyleSheet.create({
  container: { flex: 1 },

  banner: {
    padding: 20,
    
  },

  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  userName: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  subtitle: {
    fontSize: 14,
  },

  bannerStats: {
    flexDirection: 'row',
    gap: 10,
  },

  statCard: {
    backgroundColor: '#ffffff30',
    padding: 10,
    borderRadius: 8,
  },

  mainContent: {
    padding: 16,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 10,
  },

  updateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },

  classColorBar: {
    width: 5,
    height: 40,
    marginRight: 10,
  },

  updateContent: {
    flex: 1,
  },
});