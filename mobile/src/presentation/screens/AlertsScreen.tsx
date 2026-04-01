import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function AlertsScreen() {
  const router = useRouter();
  const [category, setCategory] = useState('All');
  const [activeTopTab, setActiveTopTab] = useState('All');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [teacherName, setTeacherName] = useState('');
  const [searchText, setSearchText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    setSearchQuery(searchText.trim());
  };

  const categories = ['All', 'Homework', 'Results', 'Fees', 'Announcements'];
  const categoryIcons: Record<string, React.ComponentProps<typeof MaterialCommunityIcons>['name']> = {
    All: 'bell-outline',
    Homework: 'book-outline',
    Results: 'clipboard-text-outline',
    Fees: 'cash-multiple',
    Announcements: 'bullhorn-outline',
  };
  const categoryColors: Record<string, string> = {
    All: '#0B5FFF',
    Homework: '#8B5CF6',
    Results: '#16A34A',
    Fees: '#DC2626',
    Announcements: '#F59E0B',
  };

  const typeIcons: Record<string, React.ComponentProps<typeof MaterialCommunityIcons>['name']> = {
    All: 'bell-outline',
    Homework: 'book-open-outline',
    Results: 'trending-up',
    Fees: 'currency-usd',
    Announcements: 'bullhorn-outline',
    Attendance: 'calendar-check-outline',
    Default: 'bell-outline',
  };

  const typeIconColors: Record<string, string> = {
    All: '#0B5FFF',
    Homework: '#8B5CF6',
    Results: '#16A34A',
    Fees: '#DC2626',
    Announcements: '#F59E0B',
    Attendance: '#2563EB',
    Default: '#2563EB',
  };

  const normalizeType = (type: string, title: string = '') => {
    const lowerType = (type || '').toLowerCase();
    const lowerTitle = title.toLowerCase();

    if (lowerType.includes('homework') || lowerTitle.includes('homework')) return 'Homework';
    if (lowerType.includes('result') || lowerTitle.includes('result')) return 'Results';
    if (lowerType.includes('fee') || lowerTitle.includes('fee')) return 'Fees';
    if (lowerType.includes('announce') || lowerTitle.includes('announcement') || lowerTitle.includes('notification')) return 'Announcements';
    if (lowerType.includes('attendance') || lowerTitle.includes('attendance')) return 'Attendance';
    if (lowerType.includes('meeting') || lowerTitle.includes('meeting')) return 'Announcements';
    return type ? type.charAt(0).toUpperCase() + type.slice(1) : 'All';
  };

  useEffect(() => {
    fetch('http://10.0.2.2:8000/teacher/dashboard')
      .then((res) => res.json())
      .then((res) => {
        setTeacherName(res?.name || '');

        const updates = res?.updates || [];
        const mapped = updates.map((item: any) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          time: item.time || '',
          createdAt: item.created_at || item.createdAt || item.time || '',
          type: normalizeType(item.type || '', item.title || ''),
          read: false,
        }));

        setNotifications(mapped);
      })
      .catch((err) => console.log('Alerts fetch error:', err));
  }, []);

  const normalizeDateGroup = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return 'Earlier';
    }

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const formatted = (d: Date) => d.toDateString();
    if (formatted(date) === formatted(today)) return 'Today';
    if (formatted(date) === formatted(yesterday)) return 'Yesterday';

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const filteredData = notifications
    .filter((item) => {
      if (category !== 'All' && item.type !== category) return false;
      if (activeTopTab === 'Unread' && item.read) return false;
      if (activeTopTab === 'Read' && !item.read) return false;
      if (!searchQuery) return true;

      const query = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      const aDate = new Date(a.createdAt || a.time).getTime();
      const bDate = new Date(b.createdAt || b.time).getTime();
      return bDate - aDate;
    });

  const groupedNotifications = filteredData.reduce<Record<string, typeof filteredData>>((groups, item) => {
    const section = normalizeDateGroup(item.createdAt || item.time);
    groups[section] = groups[section] || [];
    groups[section].push(item);
    return groups;
  }, {});

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  const deleteNotification = (id: number) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  };

  const allCount = notifications.length;
  const unreadCount = notifications.filter((item) => !item.read).length;
  const readCount = notifications.filter((item) => item.read).length;
  const hasData = allCount > 0;

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerIconButton}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Ionicons name="notifications-outline" size={22} color="#fff" style={styles.headerBellIcon} />
        <View>
          <Text style={styles.headerTitle}>Notifications</Text>
          {teacherName ? <Text style={styles.headerSubtitle}>Hi, {teacherName}</Text> : null}
        </View>
      </View>

        <View style={styles.headerRight}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount} new</Text>
          </View>
          <TouchableOpacity onPress={() => {}} style={styles.headerIconButton}>
            <Ionicons name="settings-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

      {/* SEARCH */}
      <View style={styles.searchBox}>
        <TouchableOpacity onPress={handleSearch} style={styles.searchIconButton}>
          <Ionicons name="search-outline" size={18} color="#999" />
        </TouchableOpacity>
        <TextInput
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          placeholder="Search notifications..."
          style={{ marginLeft: 8, flex: 1 }}
        />
      </View>

      {/* TOP TABS */}
      <View style={styles.topTabsContainer}>
        {[
          { label: 'All', count: allCount },
          { label: 'Unread', count: unreadCount },
          { label: 'Read', count: readCount },
        ].map((tab) => {
          const active = activeTopTab === tab.label;
          return (
            <TouchableOpacity
              key={tab.label}
              onPress={() => setActiveTopTab(tab.label)}
              style={[styles.topTabItem, active && styles.topTabItemActive]}
            >
              <Text style={[styles.topTab, active && styles.topTabActive]}>
                {tab.label} ({tab.count})
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* CATEGORY */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryRow}
      >
        {categories.map((item) => {
          const active = category === item;

          return (
            <TouchableOpacity
              key={item}
              onPress={() => setCategory(item)}
              style={[
                styles.categoryBtn,
                active ? styles.categoryActive : styles.categoryInactive,
              ]}
            >
              <MaterialCommunityIcons
                name={categoryIcons[item]}
                size={16}
                color={active ? '#fff' : categoryColors[item]}
                style={{ marginRight: 8 }}
              />
              <Text
                style={[
                  styles.categoryText,
                  active ? styles.categoryActiveText : { color: categoryColors[item] },
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* TOP BANNER */}
      <View style={styles.topBanner}>
        <Text style={styles.topBannerText}>{unreadCount} unread notifications</Text>
        <TouchableOpacity style={styles.markAllButton} onPress={markAllAsRead}>
          <Ionicons name="checkmark-done-outline" size={16} color="#0B5FFF" />
          <Text style={styles.markAllText}>Mark all as read</Text>
        </TouchableOpacity>
      </View>

      {/* NOTIFICATIONS */}
      {Object.entries(groupedNotifications).map(([section, items]) => (
        <View key={section} style={styles.groupSection}>
          <Text style={styles.groupTitle}>{section}</Text>
          {items.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardRow}>
                <View style={[styles.iconBox, { backgroundColor: `${typeIconColors[item.type] || typeIconColors.Default}22` }]}> 
                  <MaterialCommunityIcons
                    name={typeIcons[item.type] || typeIcons.Default}
                    size={20}
                    color={typeIconColors[item.type] || typeIconColors.Default}
                  />
                </View>

                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <View style={styles.cardHeaderRow}>
                      <Text style={styles.title}>{item.title}</Text>
                      {!item.read && <Text style={styles.unreadDot}> ●</Text>}
                      <View style={styles.typeBadge}>
                        <Text style={styles.typeBadgeText}>{item.type}</Text>
                      </View>
                    </View>
                    <TouchableOpacity onPress={() => deleteNotification(item.id)} style={styles.deleteButton}>
                      <Ionicons name="trash-outline" size={18} color="#6B7280" />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.desc}>{item.description}</Text>
                  <View style={styles.cardFooterRow}>
                    <Text style={styles.time}>{item.time}</Text>
                    <TouchableOpacity style={styles.viewButton}>
                      <Text style={styles.view}>View →</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
      ))}

      {!hasData && (
        <View style={styles.empty}>
          <MaterialCommunityIcons name="bell-off-outline" size={50} color="#ccc" />
          <Text style={styles.emptyTitle}>No Notifications Yet</Text>
          <Text style={styles.emptySub}>
            Notifications will appear here when available
          </Text>
        </View>
      )}

    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6FA' },

  headerTitle: {
    color: '#fff',
    fontSize: 18,
    marginLeft: 10,
    fontWeight: '600',
  },

  headerSubtitle: {
    color: '#E5E7EB',
    fontSize: 13,
    marginLeft: 10,
    marginTop: 4,
  },

  badge: {
    marginLeft: 10,
    backgroundColor: '#FF4D4F',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },

  badgeText: {
    color: '#fff',
    fontSize: 12,
  },

  header: {
    backgroundColor: '#1E5CC3',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerIconButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerBellIcon: {
    marginLeft: 10,
    marginRight: 10,
  },

  searchBox: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginTop: 16,
    borderRadius: 14,
    paddingHorizontal: 14,
    alignItems: 'center',
    height: 50,
  },

  content: {
    flex: 1,
  },

  topBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#E7F2FF',
    paddingVertical: 14,
    paddingHorizontal: 16,
    margin: 15,
    borderRadius: 16,
  },

  topBannerText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0B5FFF',
  },

  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  markAllText: {
    color: '#0B5FFF',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
  },

  searchIconButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },

  topTabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#2C6BE0',
    borderRadius: 16,
    padding: 8,
    marginHorizontal: 15,
    marginTop: 10,
  },

  topTabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 12,
  },

  topTabItemActive: {
    backgroundColor: '#1B4FDB',
  },

  topTab: {
    color: '#E0E7FF',
    fontSize: 13,
    fontWeight: '600',
  },

  topTabActive: {
    color: '#fff',
  },

  categoryScroll: {
    width: '100%',
  },

  categoryRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 6,
    width: '100%',
  },

  categoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
    height: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 10,
  },

  categoryInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },

  categoryActive: {
    backgroundColor: '#E3F2FF',
    borderColor: '#1E5CC3',
  },

  categoryText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
  },

  categoryActiveText: {
    color: '#1E5CC3',
  },

  groupSection: {
    marginTop: 18,
    paddingHorizontal: 15,
  },

  groupTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 2,
  },

  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  cardBody: {
    flex: 1,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#E7F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 4,
  },

  cardContent: {
    flex: 1,
  },

  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  typeBadge: {
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 8,
  },

  typeBadgeText: {
    color: '#DC2626',
    fontSize: 11,
    fontWeight: '700',
  },

  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },

  deleteButton: {
    padding: 6,
    marginLeft: 12,
  },


  title: {
    fontWeight: '700',
    fontSize: 15,
    color: '#111827',
  },

  unreadDot: {
    color: '#2563EB',
    marginLeft: 6,
    fontSize: 16,
  },

  desc: {
    fontSize: 13,
    color: '#4B5563',
    marginTop: 8,
    lineHeight: 19,
  },

  time: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
  },

  viewButton: {
    justifyContent: 'center',
    marginLeft: 12,
  },

  view: {
    color: '#2563EB',
    fontWeight: '700',
  },

  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyTitle: {
    fontSize: 16,
    marginTop: 10,
    fontWeight: '600',
  },

  emptySub: {
    color: '#888',
    marginTop: 5,
    textAlign: 'center',
  },
});