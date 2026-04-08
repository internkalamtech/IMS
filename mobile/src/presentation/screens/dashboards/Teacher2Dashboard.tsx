import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function Teacher2Dashboard() {
  const [data, setData] = useState<any>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    fetch('http://192.168.43.131:8000/teacher/dashboard')
      .then(res => res.json())
      .then(res => setData(res))
      .catch(err => console.log(err));
  }, []);

  const quickActions = [
    { title: 'Timetable', icon: 'calendar-outline', color: '#6D28D9', bg: '#EEE7FF' },
    { title: 'Attendance', icon: 'account-check-outline', color: '#2563EB', bg: '#E7F0FF' },
    { title: 'Students', icon: 'account-group-outline', color: '#16A34A', bg: '#E6F7EC' },
    { title: 'Assessments', icon: 'medal-outline', color: '#EA580C', bg: '#FFF2E5' },
    { title: 'Academics', icon: 'book-open-outline', color: '#9333EA', bg: '#F3E8FF' },
    { title: 'Leave Requests', icon: 'clipboard-check-outline', color: '#CA8A04', bg: '#FEF9C3' },
  ];

  // Map update types to icons/colors/backgrounds
  const typeIcons: any = {
    Homework: 'book-outline',
    Attendance: 'checkmark-done-outline',
    Assessments: 'medal-outline',
    Academics: 'book-open-outline',
    'Leave Requests': 'clipboard-check-outline',
    Announcement: 'bullhorn-outline',
    Result: 'clipboard-text-outline',
    Fees: 'cash-multiple',
    Default: 'help-circle-outline', // fallback icon
  };

  const typeColors: any = {
    Homework: '#8B5CF6',
    Attendance: '#2563EB',
    Assessments: '#EA580C',
    Academics: '#9333EA',
    'Leave Requests': '#092f0b',
    Announcement: '#F59E0B',
    Result: '#16A34A',
    Fees: '#DC2626',
    Default: '#0B5FFF',
  };

  const typeBGs: any = {
    Homework: '#F3E8FF',
    Attendance: '#E7F0FF',
    Assessments: '#FFF2E5',
    'Academics': '#F3E8FF',
    'Leave Requests': '#FEF9C3',
    Announcement: '#FEF3C7',
    Result: '#ECFDF5',
    Fees: '#FEE2E2',
    Default: '#E0E7FF',
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E5CC3" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.teacherName}>{data?.name}</Text>
          <Text style={styles.subject}>{data?.role}</Text>

          <View style={styles.classWrapper}>
            <View style={styles.classCard}>
              <Text style={styles.smallText}>Current Class</Text>
              <Text style={styles.classTitle}>{data?.class}</Text>
              <Text style={styles.subjectText}>{data?.subject}</Text>

              <View style={styles.statsRow}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{data?.students} Students</Text>
                </View>
                <Text style={styles.presentText}>✓ {data?.present} Present</Text>
              </View>

              <View style={styles.sliderDot} />
            </View>
          </View>
        </View>
        {/* QUICK ACTIONS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.grid}>
            {quickActions.map((item, index) => (
              <TouchableOpacity key={index} style={styles.gridItem}>
                <View style={[styles.iconCard, { backgroundColor: item.bg }]}>
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={26}
                    color={item.color}
                  />
                </View>
                <Text style={styles.gridText}>{item.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* RECENT UPDATES */}
        <View style={styles.section}>
          <View style={styles.updateHeader}>
            <Text style={styles.sectionTitle}>Recent Updates</Text>
            <View style={styles.badgeCount}>
              <Text style={styles.badgeCountText}>
                {data?.updates?.length || 0} new
              </Text>
            </View>
          </View>

          {(data?.updates || []).slice(0, 5).map((item: any) => {
            const isExpanded = expandedId === item.id;
            // Normalize type to match keys in mapping
            const type = item.type || 'Default';

            return (
              <View
                key={item.id}
                style={[
                  styles.updateCard,
                  {
                    backgroundColor: typeBGs[type] || typeBGs.Default,
                    shadowColor: '#2563EB', // lightning blue shadow
                    shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 5,
                  },
                ]}
              >
                <View style={styles.updateRow}>
                  {/* ICON */}
                  <View
                    style={[
                      styles.updateIcon,
                      { backgroundColor: typeBGs[type] || typeBGs.Default },
                    ]}
                  >
                    <Ionicons
                      name={typeIcons[type] || typeIcons.Default}
                      size={20}
                      color={typeColors[type] || typeColors.Default}
                    />
                  </View>

                  {/* TEXT */}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.updateTitle}>{item.title}</Text>
                    {isExpanded && <Text style={styles.updateSub}>{item.description}</Text>}
                  </View>

                  {/* RIGHT SIDE */}
                  <View style={styles.rightSection}>
                    <Text style={styles.time}>{item.time}</Text>
                    <TouchableOpacity onPress={() => setExpandedId(isExpanded ? null : item.id)}>
                      <Text style={styles.review}>{isExpanded ? 'Hide ↑' : 'Preview →'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6FA' },

  header: {
    backgroundColor: '#1E5CC3',
    paddingTop: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingHorizontal: 20,
  },
  teacherName: { color: '#fff', fontSize: 22, fontWeight: '700' },
  subject: { color: '#D6E4FF', fontSize: 14, marginTop: 4 },

  classWrapper: { alignItems: 'center', marginTop: 18 },
  classCard: {
    width: width * 0.9,
    backgroundColor: '#2C6BE0',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  smallText: { color: '#CFE0FF', fontSize: 12 },
  classTitle: { color: '#fff', fontSize: 26, fontWeight: '700', marginTop: 6 },
  subjectText: { color: '#E0EBFF', fontSize: 15, marginTop: 4 },
  statsRow: { flexDirection: 'row', marginTop: 14, alignItems: 'center' },
  badge: { backgroundColor: '#4A7BEF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginRight: 12 },
  badgeText: { color: '#fff', fontSize: 12 },
  presentText: { color: '#DFFFE0', fontSize: 13 },
  sliderDot: { marginTop: 14, width: 30, height: 5, backgroundColor: '#fff', borderRadius: 10 },

  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 14, justifyContent: 'space-between' },
  gridItem: { width: '30%', alignItems: 'center', marginBottom: 22 },
  iconCard: { padding: 16, borderRadius: 18 },
  gridText: { marginTop: 8, fontSize: 13, textAlign: 'center' },

  updateHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badgeCount: { backgroundColor: '#1E5CC3', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 16 },
  badgeCountText: { color: '#fff', fontSize: 12 },

  updateCard: { padding: 14, borderRadius: 16, marginTop: 12 },
  updateRow: { flexDirection: 'row', alignItems: 'center' },
  updateIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  updateTitle: { fontWeight: '600', fontSize: 15 },
  updateSub: { fontSize: 12, color: '#777', marginTop: 2 },
  rightSection: { alignItems: 'flex-end' },
  time: { fontSize: 11, color: '#999' },
  review: { color: '#2563EB', fontWeight: '500', marginTop: 4 },
});