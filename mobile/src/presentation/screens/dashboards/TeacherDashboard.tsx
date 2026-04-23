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
  container: {
    flex: 1,
  },

  banner: {
    padding: 20,
    
  },

  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  userName: {
    fontSize: 20,
    fontWeight: 'bold',
  },

  subtitle: {
    marginTop: 6,
    fontSize: 14,
  },

  sectionHeader: {
    marginTop: 24,
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  updatesCard: {
    marginTop: 8,
  },

  updateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
  },

  classColorBar: {
    width: 6,
    height: 42,
    borderRadius: 10,
    marginRight: 12,
  },

  updateContent: {
    flex: 1,
  },

  updateTitle: {
    fontSize: 15,
  },

  updateSubtitle: {
    fontSize: 13,
    marginTop: 4,
  },

  timeTag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
});