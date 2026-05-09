import { api } from '@/core/api-client';
import { useTheme } from '@/core/theme/ThemeContext';
import { ThemedButton } from '@/presentation/components/ThemedButton';
import { ThemedCard } from '@/presentation/components/ThemedCard';
import { ThemedText } from '@/presentation/components/ThemedText';
import { ThemedTextInput } from '@/presentation/components/ThemedTextInput';
import { ThemedView } from '@/presentation/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type RouteStatus = 'on_time' | 'delayed' | 'cancelled' | 'completed';

interface TransportRoute {
    id: string;
    name: string;
    status: RouteStatus;
    total_stops: number;
    total_students: number;
    assigned_bus: string;
    driver: string;
    next_stop?: string;
    next_time?: string;
    delay_minutes?: number;
}

interface RouteManifestStudent {
    student_id: number;
    student_name: string;
    stop_id: number;
    pickup_time?: string | null;
    dropoff_time?: string | null;
}

interface RouteManifestResponse {
    route_id: string;
    total_students: number;
    students: RouteManifestStudent[];
}

interface StudentRecord {
    id: number;
    name: string;
    roll_number: string;
    class_name: string;
}

interface ClassRecord {
    id: number;
    name: string;
}

interface AllocationRow {
    student_id: number;
    student_name: string;
    roll_number: string;
    class_name: string;
    route_id: string;
    route_name: string;
    stop_id: number;
    pickup_time?: string | null;
    dropoff_time?: string | null;
}

type EnrollmentFormState = {
    studentId: string;
    routeId: string;
    stopId: string;
    pickupTime: string;
    dropoffTime: string;
};

const EMPTY_FORM: EnrollmentFormState = {
    studentId: '',
    routeId: '',
    stopId: '',
    pickupTime: '',
    dropoffTime: '',
};

const toTitleCase = (value: string) =>
    value
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (character) => character.toUpperCase());

const formatStopLabel = (stopId: number) => `Stop ${stopId}`;

export default function TransportAllocationsScreen() {
    const { theme } = useTheme();
    const [routes, setRoutes] = useState<TransportRoute[]>([]);
    const [classes, setClasses] = useState<ClassRecord[]>([]);
    const [students, setStudents] = useState<StudentRecord[]>([]);
    const [routeManifests, setRouteManifests] = useState<Record<string, RouteManifestResponse>>({});
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedRouteId, setSelectedRouteId] = useState('');
    const [selectedClass, setSelectedClass] = useState('All');
    const [searchText, setSearchText] = useState('');
    const [selectedStopId, setSelectedStopId] = useState('');
    const [capacityByRoute, setCapacityByRoute] = useState<Record<string, string>>({});
    const [formState, setFormState] = useState<EnrollmentFormState>(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    const fetchStudentsForClass = async (className: string) => {
        const response = await api.get('/students', {
            params: { class_id: className },
        });

        return (response.data || []).map((student: StudentRecord) => ({
            id: Number(student.id),
            name: student.name,
            roll_number: student.roll_number,
            class_name: student.class_name,
        }));
    };

    const fetchData = async () => {
        const [routesResult, classesResult] = await Promise.allSettled([
            api.get('/transport/routes'),
            api.get('/classes'),
        ]);

        const loadedRoutes =
            routesResult.status === 'fulfilled'
                ? ((routesResult.value.data?.routes || []) as TransportRoute[])
                : [];

        const loadedClasses =
            classesResult.status === 'fulfilled'
                ? ((classesResult.value.data || []) as ClassRecord[])
                : [];

        setRoutes(loadedRoutes);
        setClasses(loadedClasses);

        const defaultRouteId = loadedRoutes[0]?.id || '';
        setSelectedRouteId((currentRouteId) => currentRouteId || defaultRouteId);

        if (loadedRoutes.length > 0) {
            setCapacityByRoute((current) => {
                const next = { ...current };
                loadedRoutes.forEach((route) => {
                    if (!next[route.id]) {
                        next[route.id] = '';
                    }
                });
                return next;
            });
        }

        if (loadedClasses.length > 0) {
            const studentResults = await Promise.allSettled(
                loadedClasses.map((classRecord) => fetchStudentsForClass(classRecord.name))
            );

            const flattenedStudents = studentResults.flatMap((result) =>
                result.status === 'fulfilled' ? result.value : []
            );

            setStudents(flattenedStudents);
        } else {
            setStudents([]);
        }

        if (loadedRoutes.length > 0) {
            const manifestResults = await Promise.allSettled(
                loadedRoutes.map(async (route) => {
                    const response = await api.get(`/transport/routes/${route.id}/students`);
                    const manifest = response.data as RouteManifestResponse;
                    return {
                        routeId: route.id,
                        manifest,
                    };
                })
            );

            const nextManifests: Record<string, RouteManifestResponse> = {};
            manifestResults.forEach((result) => {
                if (result.status === 'fulfilled') {
                    nextManifests[result.value.routeId] = result.value.manifest;
                }
            });

            setRouteManifests(nextManifests);
        } else {
            setRouteManifests({});
        }
    };

    useEffect(() => {
        const initialize = async () => {
            try {
                await fetchData();
            } catch (error) {
                console.error('Failed to load transport allocations:', error);
                Alert.alert('Transport allocations', 'Unable to load route and student data right now.');
            } finally {
                setLoading(false);
            }
        };

        initialize();
    }, []);

    useEffect(() => {
        if (!selectedRouteId && routes.length > 0) {
            setSelectedRouteId(routes[0].id);
        }
    }, [routes, selectedRouteId]);

    useEffect(() => {
        setSelectedStopId('');
        setFormState((current) => ({
            ...current,
            routeId: selectedRouteId,
        }));
    }, [selectedRouteId]);

    const selectedRoute = routes.find((route) => route.id === selectedRouteId) || null;
    const selectedManifest = selectedRoute ? routeManifests[selectedRoute.id] : undefined;
    const assignedStudents = selectedManifest?.students || [];

    const studentIndex = useMemo(() => {
        return students.reduce<Record<number, StudentRecord>>((accumulator, student) => {
            accumulator[student.id] = student;
            return accumulator;
        }, {});
    }, [students]);

    const allocationRows: AllocationRow[] = useMemo(() => {
        if (!selectedRoute) {
            return [];
        }

        return assignedStudents.map((student) => {
            const details = studentIndex[student.student_id];

            return {
                student_id: student.student_id,
                student_name: details?.name || student.student_name,
                roll_number: details?.roll_number || 'N/A',
                class_name: details?.class_name || 'Unknown',
                route_id: selectedRoute.id,
                route_name: selectedRoute.name,
                stop_id: student.stop_id,
                pickup_time: student.pickup_time,
                dropoff_time: student.dropoff_time,
            };
        });
    }, [assignedStudents, selectedRoute, studentIndex]);

    const stopOptions = useMemo(() => {
        const uniqueStops = Array.from(new Set(allocationRows.map((row) => row.stop_id)));
        return uniqueStops.sort((left, right) => left - right);
    }, [allocationRows]);

    const selectedRouteCapacity = Number(capacityByRoute[selectedRouteId] || 0);
    const selectedRouteLoad = selectedRoute?.total_students || allocationRows.length;
    const loadPercent = selectedRouteCapacity > 0 ? Math.round((selectedRouteLoad / selectedRouteCapacity) * 100) : null;

    const filteredAllocationRows = useMemo(() => {
        const query = searchText.trim().toLowerCase();

        return allocationRows.filter((row) => {
            const matchesClass = selectedClass === 'All' || row.class_name.toLowerCase() === selectedClass.toLowerCase();
            const matchesStop = !selectedStopId || String(row.stop_id) === selectedStopId;
            const matchesSearch =
                query.length === 0 ||
                row.student_name.toLowerCase().includes(query) ||
                row.roll_number.toLowerCase().includes(query) ||
                row.class_name.toLowerCase().includes(query) ||
                formatStopLabel(row.stop_id).toLowerCase().includes(query);

            return matchesClass && matchesStop && matchesSearch;
        });
    }, [allocationRows, searchText, selectedClass, selectedStopId]);

    const availableStudents = useMemo(() => {
        const assignedIds = new Set(allocationRows.map((row) => row.student_id));
        const query = searchText.trim().toLowerCase();

        return students.filter((student) => {
            const matchesClass = selectedClass === 'All' || student.class_name.toLowerCase() === selectedClass.toLowerCase();
            const alreadyAssigned = assignedIds.has(student.id);
            const matchesSearch =
                query.length === 0 ||
                student.name.toLowerCase().includes(query) ||
                student.roll_number.toLowerCase().includes(query) ||
                student.class_name.toLowerCase().includes(query);

            return matchesClass && matchesSearch && !alreadyAssigned;
        });
    }, [allocationRows, searchText, selectedClass, students]);

    const classFilterOptions = useMemo(() => {
        const names = new Set<string>();
        students.forEach((student) => names.add(student.class_name));
        classes.forEach((classRecord) => names.add(classRecord.name));
        return ['All', ...Array.from(names).sort()];
    }, [classes, students]);

    const refresh = async () => {
        setRefreshing(true);
        try {
            await fetchData();
        } catch (error) {
            console.error('Failed to refresh transport allocations:', error);
            Alert.alert('Transport allocations', 'Refresh failed. Please try again.');
        } finally {
            setRefreshing(false);
        }
    };

    const startAssignment = (student: StudentRecord) => {
        setFormState({
            studentId: String(student.id),
            routeId: selectedRouteId,
            stopId: selectedStopId || String(stopOptions[0] || ''),
            pickupTime: '',
            dropoffTime: '',
        });
    };

    const editAllocation = (row: AllocationRow) => {
        setSelectedRouteId(row.route_id);
        setSelectedStopId(String(row.stop_id));
        setFormState({
            studentId: String(row.student_id),
            routeId: row.route_id,
            stopId: String(row.stop_id),
            pickupTime: row.pickup_time || '',
            dropoffTime: row.dropoff_time || '',
        });
    };

    const saveAllocation = async () => {
        if (!formState.studentId || !formState.routeId || !formState.stopId) {
            Alert.alert('Transport allocations', 'Select a student, route, and stop before saving.');
            return;
        }

        const payload: Record<string, unknown> = {
            enrollments: [
                {
                    studentId: Number(formState.studentId),
                    routeId: formState.routeId,
                    stopId: Number(formState.stopId),
                },
            ],
        };

        if (formState.pickupTime.trim()) {
            (payload.enrollments as Record<string, unknown>[])[0].pickupTime = formState.pickupTime.trim();
        }

        if (formState.dropoffTime.trim()) {
            (payload.enrollments as Record<string, unknown>[])[0].dropoffTime = formState.dropoffTime.trim();
        }

        try {
            setSaving(true);
            await api.post('/transport/enrollments', payload);
            Alert.alert('Transport allocations', 'Student allocation saved successfully.');
            await refresh();
        } catch (error) {
            console.error('Failed to save transport allocation:', error);
            Alert.alert('Transport allocations', 'Unable to save the allocation. Please check the data and try again.');
        } finally {
            setSaving(false);
        }
    };

    const clearForm = () => {
        setFormState((current) => ({
            ...EMPTY_FORM,
            routeId: current.routeId || selectedRouteId,
            stopId: current.stopId || selectedStopId,
        }));
    };

    const renderRouteCard = (route: TransportRoute) => {
        const isActive = route.id === selectedRouteId;
        const capacity = Number(capacityByRoute[route.id] || 0);
        const routeLoad = route.total_students;
        const fillPercent = capacity > 0 ? Math.min(100, Math.round((routeLoad / capacity) * 100)) : 0;

        return (
            <TouchableOpacity
                key={route.id}
                activeOpacity={0.9}
                onPress={() => setSelectedRouteId(route.id)}
                style={[
                    styles.routeCard,
                    {
                        borderColor: isActive ? theme.colors.primary : theme.colors.border,
                        backgroundColor: isActive ? theme.colors.primary + '12' : theme.colors.card,
                    },
                ]}
            >
                <View style={styles.routeCardHeader}>
                    <View style={styles.routeCardTitleRow}>
                        <Ionicons name="bus-outline" size={18} color={theme.colors.primary} />
                        <ThemedText style={styles.routeCardTitle} type="defaultSemiBold">
                            {route.name}
                        </ThemedText>
                    </View>
                    <View style={[styles.statusPill, { backgroundColor: route.status === 'delayed' ? '#fee2e2' : '#dcfce7' }]}>
                        <ThemedText style={[styles.statusPillText, { color: route.status === 'delayed' ? '#b91c1c' : '#166534' }]}>
                            {route.status === 'delayed' ? 'Delayed' : toTitleCase(route.status)}
                        </ThemedText>
                    </View>
                </View>
                <ThemedText style={styles.routeCardMeta} lightColor="#6b7280" darkColor="#9ca3af">
                    {route.assigned_bus} • {route.driver}
                </ThemedText>
                <View style={styles.routeCardStats}>
                    <View>
                        <ThemedText style={styles.routeCardMetric}>{routeLoad}</ThemedText>
                        <ThemedText style={styles.routeCardMetricLabel}>Students</ThemedText>
                    </View>
                    <View>
                        <ThemedText style={styles.routeCardMetric}>{route.total_stops}</ThemedText>
                        <ThemedText style={styles.routeCardMetricLabel}>Stops</ThemedText>
                    </View>
                    <View>
                        <ThemedText style={styles.routeCardMetric}>{capacity > 0 ? `${fillPercent}%` : 'Set'}</ThemedText>
                        <ThemedText style={styles.routeCardMetricLabel}>Load</ThemedText>
                    </View>
                </View>
                <View style={styles.capacityRow}>
                    <ThemedText style={styles.capacityLabel}>Vehicle capacity</ThemedText>
                    <ThemedTextInput
                        value={capacityByRoute[route.id] || ''}
                        onChangeText={(value) => {
                            setCapacityByRoute((current) => ({
                                ...current,
                                [route.id]: value.replace(/[^0-9]/g, ''),
                            }));
                        }}
                        placeholder="Set capacity"
                        keyboardType="numeric"
                        style={styles.capacityInput}
                    />
                </View>
            </TouchableOpacity>
        );
    };

    const renderAllocationItem = ({ item }: { item: AllocationRow }) => (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => editAllocation(item)}
            style={[styles.allocationCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
        >
            <View style={styles.allocationHeader}>
                <View style={styles.studentBadge}>
                    <Ionicons name="person-outline" size={16} color={theme.colors.primary} />
                </View>
                <View style={styles.allocationIdentity}>
                    <ThemedText style={styles.allocationName} type="defaultSemiBold">
                        {item.student_name}
                    </ThemedText>
                    <ThemedText style={styles.allocationMeta} lightColor="#6b7280" darkColor="#9ca3af">
                        {item.roll_number} • {item.class_name}
                    </ThemedText>
                </View>
                <View style={styles.allocationStopPill}>
                    <ThemedText style={styles.allocationStopText}>{formatStopLabel(item.stop_id)}</ThemedText>
                </View>
            </View>
            <View style={styles.allocationFooter}>
                <ThemedText style={styles.allocationMeta} lightColor="#6b7280" darkColor="#9ca3af">
                    Route: {item.route_name}
                </ThemedText>
                <ThemedText style={styles.allocationMeta} lightColor="#6b7280" darkColor="#9ca3af">
                    Pickup {item.pickup_time || '--:--'} • Drop-off {item.dropoff_time || '--:--'}
                </ThemedText>
            </View>
        </TouchableOpacity>
    );

    const renderAvailableStudent = ({ item }: { item: StudentRecord }) => (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => startAssignment(item)}
            style={[styles.availableCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
        >
            <View>
                <ThemedText style={styles.availableName} type="defaultSemiBold">
                    {item.name}
                </ThemedText>
                <ThemedText style={styles.availableMeta} lightColor="#6b7280" darkColor="#9ca3af">
                    {item.roll_number} • {item.class_name}
                </ThemedText>
            </View>
            <Ionicons name="add-circle-outline" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <ThemedView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <ThemedText style={styles.loadingText}>Loading transport allocations...</ThemedText>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <KeyboardAvoidingView
                    style={styles.flex}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    <ScrollView
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={theme.colors.primary} />}
                        contentContainerStyle={styles.scrollContent}
                    >
                        <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
                            <ThemedText style={styles.headerTitle} type="title" lightColor={theme.colors.primaryForeground} darkColor={theme.colors.primaryForeground}>
                                Student Allocations
                            </ThemedText>
                            <ThemedText style={styles.headerSubtitle} lightColor={theme.colors.primaryForeground} darkColor={theme.colors.primaryForeground}>
                                Search, assign, and compare route loads from one place.
                            </ThemedText>
                        </View>

                        <View style={styles.sectionSpacing}>
                            <ThemedText style={styles.sectionTitle} type="subtitle">
                                Routes
                            </ThemedText>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.routeList}>
                                {routes.map(renderRouteCard)}
                            </ScrollView>
                        </View>

                        <ThemedCard style={styles.summaryCard} padding={18}>
                            <View style={styles.summaryHeader}>
                                <View>
                                    <ThemedText style={styles.sectionTitle} type="subtitle">
                                        Route Summary
                                    </ThemedText>
                                    <ThemedText lightColor="#6b7280" darkColor="#9ca3af">
                                        Compare total students to the configured vehicle capacity.
                                    </ThemedText>
                                </View>
                                <View style={styles.summaryCountBubble}>
                                    <ThemedText style={styles.summaryCountText}>{selectedRouteLoad}</ThemedText>
                                </View>
                            </View>
                            <View style={styles.summaryStats}>
                                <View style={styles.summaryStatItem}>
                                    <ThemedText style={styles.summaryStatValue}>{selectedRoute?.total_stops || 0}</ThemedText>
                                    <ThemedText style={styles.summaryStatLabel}>Stops</ThemedText>
                                </View>
                                <View style={styles.summaryStatItem}>
                                    <ThemedText style={styles.summaryStatValue}>{selectedRouteCapacity > 0 ? selectedRouteCapacity : '--'}</ThemedText>
                                    <ThemedText style={styles.summaryStatLabel}>Capacity</ThemedText>
                                </View>
                                <View style={styles.summaryStatItem}>
                                    <ThemedText style={styles.summaryStatValue}>
                                        {loadPercent !== null ? `${loadPercent}%` : '--'}
                                    </ThemedText>
                                    <ThemedText style={styles.summaryStatLabel}>Filled</ThemedText>
                                </View>
                            </View>
                            <View style={styles.summaryBarTrack}>
                                <View
                                    style={[
                                        styles.summaryBarFill,
                                        {
                                            width: `${Math.min(loadPercent ?? 0, 100)}%`,
                                            backgroundColor: loadPercent !== null && loadPercent > 100 ? theme.colors.destructive : theme.colors.primary,
                                        },
                                    ]}
                                />
                            </View>
                        </ThemedCard>

                        <ThemedCard style={styles.filtersCard} padding={18}>
                            <ThemedText style={styles.sectionTitle} type="subtitle">
                                Search and Filter
                            </ThemedText>
                            <ThemedTextInput
                                label="Search"
                                value={searchText}
                                onChangeText={setSearchText}
                                placeholder="Search by name, roll number, or stop"
                            />
                            <ThemedText style={styles.filterLabel}>Class</ThemedText>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                                {classFilterOptions.map((option) => {
                                    const active = option === selectedClass;
                                    return (
                                        <TouchableOpacity
                                            key={option}
                                            onPress={() => setSelectedClass(option)}
                                            style={[
                                                styles.chip,
                                                {
                                                    backgroundColor: active ? theme.colors.primary : theme.colors.card,
                                                    borderColor: active ? theme.colors.primary : theme.colors.border,
                                                },
                                            ]}
                                        >
                                            <ThemedText
                                                style={[
                                                    styles.chipText,
                                                    {
                                                        color: active ? theme.colors.primaryForeground : theme.colors.foreground,
                                                    },
                                                ]}
                                            >
                                                {option}
                                            </ThemedText>
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>

                            <ThemedText style={styles.filterLabel}>Route stop</ThemedText>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                                <TouchableOpacity
                                    onPress={() => setSelectedStopId('')}
                                    style={[
                                        styles.chip,
                                        {
                                            backgroundColor: selectedStopId === '' ? theme.colors.primary : theme.colors.card,
                                            borderColor: selectedStopId === '' ? theme.colors.primary : theme.colors.border,
                                        },
                                    ]}
                                >
                                    <ThemedText
                                        style={[
                                            styles.chipText,
                                            {
                                                color: selectedStopId === '' ? theme.colors.primaryForeground : theme.colors.foreground,
                                            },
                                        ]}
                                    >
                                        All
                                    </ThemedText>
                                </TouchableOpacity>
                                {stopOptions.map((stopId) => {
                                    const active = String(stopId) === selectedStopId;
                                    return (
                                        <TouchableOpacity
                                            key={stopId}
                                            onPress={() => setSelectedStopId(String(stopId))}
                                            style={[
                                                styles.chip,
                                                {
                                                    backgroundColor: active ? theme.colors.primary : theme.colors.card,
                                                    borderColor: active ? theme.colors.primary : theme.colors.border,
                                                },
                                            ]}
                                        >
                                            <ThemedText
                                                style={[
                                                    styles.chipText,
                                                    {
                                                        color: active ? theme.colors.primaryForeground : theme.colors.foreground,
                                                    },
                                                ]}
                                            >
                                                {formatStopLabel(stopId)}
                                            </ThemedText>
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                        </ThemedCard>

                        <ThemedCard style={styles.formCard} padding={18}>
                            <View style={styles.formHeader}>
                                <ThemedText style={styles.sectionTitle} type="subtitle">
                                    Assign or Change Stop
                                </ThemedText>
                                <TouchableOpacity onPress={clearForm}>
                                    <ThemedText style={styles.clearText} type="link">
                                        Clear
                                    </ThemedText>
                                </TouchableOpacity>
                            </View>

                            <ThemedTextInput
                                label="Student ID"
                                value={formState.studentId}
                                onChangeText={(value) => setFormState((current) => ({ ...current, studentId: value.replace(/[^0-9]/g, '') }))}
                                placeholder="Select from list below or enter ID"
                                keyboardType="numeric"
                            />

                            <View style={styles.formRow}>
                                <View style={styles.formColumn}>
                                    <ThemedTextInput
                                        label="Route ID"
                                        value={formState.routeId || selectedRouteId}
                                        onChangeText={(value) => setFormState((current) => ({ ...current, routeId: value }))}
                                        placeholder="Route ID"
                                    />
                                </View>
                                <View style={styles.formColumn}>
                                    <ThemedTextInput
                                        label="Stop ID"
                                        value={formState.stopId}
                                        onChangeText={(value) => setFormState((current) => ({ ...current, stopId: value.replace(/[^0-9]/g, '') }))}
                                        placeholder="Stop ID"
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>

                            <View style={styles.formRow}>
                                <View style={styles.formColumn}>
                                    <ThemedTextInput
                                        label="Pickup time"
                                        value={formState.pickupTime}
                                        onChangeText={(value) => setFormState((current) => ({ ...current, pickupTime: value }))}
                                        placeholder="07:30"
                                    />
                                </View>
                                <View style={styles.formColumn}>
                                    <ThemedTextInput
                                        label="Drop-off time"
                                        value={formState.dropoffTime}
                                        onChangeText={(value) => setFormState((current) => ({ ...current, dropoffTime: value }))}
                                        placeholder="15:30"
                                    />
                                </View>
                            </View>

                            <ThemedButton title={saving ? 'Saving...' : 'Save Allocation'} onPress={saveAllocation} disabled={saving} />
                        </ThemedCard>

                        <View style={styles.sectionSpacing}>
                            <View style={styles.sectionHeaderRow}>
                                <ThemedText style={styles.sectionTitle} type="subtitle">
                                    Current Allocations
                                </ThemedText>
                                <ThemedText lightColor="#6b7280" darkColor="#9ca3af">
                                    {filteredAllocationRows.length} record{filteredAllocationRows.length === 1 ? '' : 's'}
                                </ThemedText>
                            </View>
                            <FlatList
                                data={filteredAllocationRows}
                                keyExtractor={(item) => `${item.student_id}-${item.route_id}-${item.stop_id}`}
                                renderItem={renderAllocationItem}
                                scrollEnabled={false}
                                ListEmptyComponent={
                                    <ThemedCard style={styles.emptyCard} padding={18}>
                                        <ThemedText type="defaultSemiBold">No allocations match the current filters.</ThemedText>
                                        <ThemedText lightColor="#6b7280" darkColor="#9ca3af">
                                            Try a different route, stop, or class.
                                        </ThemedText>
                                    </ThemedCard>
                                }
                            />
                        </View>

                        <View style={styles.sectionSpacing}>
                            <View style={styles.sectionHeaderRow}>
                                <ThemedText style={styles.sectionTitle} type="subtitle">
                                    Available Students
                                </ThemedText>
                                <ThemedText lightColor="#6b7280" darkColor="#9ca3af">
                                    {availableStudents.length} unassigned
                                </ThemedText>
                            </View>
                            <FlatList
                                data={availableStudents}
                                keyExtractor={(item) => String(item.id)}
                                renderItem={renderAvailableStudent}
                                scrollEnabled={false}
                                ListEmptyComponent={
                                    <ThemedCard style={styles.emptyCard} padding={18}>
                                        <ThemedText type="defaultSemiBold">No available students match the current filters.</ThemedText>
                                    </ThemedCard>
                                }
                            />
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    flex: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    loadingText: {
        fontSize: 15,
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 24,
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: '700',
    },
    headerSubtitle: {
        marginTop: 6,
        fontSize: 14,
        lineHeight: 20,
        opacity: 0.92,
    },
    sectionSpacing: {
        paddingHorizontal: 16,
        paddingTop: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    routeList: {
        gap: 12,
        paddingVertical: 12,
    },
    routeCard: {
        width: 275,
        borderWidth: 1,
        borderRadius: 20,
        padding: 16,
    },
    routeCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    routeCardTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
        paddingRight: 10,
    },
    routeCardTitle: {
        fontSize: 15,
        flex: 1,
    },
    statusPill: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
    },
    statusPillText: {
        fontSize: 11,
        fontWeight: '700',
    },
    routeCardMeta: {
        marginTop: 10,
        fontSize: 12,
    },
    routeCardStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 14,
        marginBottom: 10,
    },
    routeCardMetric: {
        fontSize: 18,
        fontWeight: '700',
    },
    routeCardMetricLabel: {
        fontSize: 11,
        opacity: 0.72,
        marginTop: 3,
    },
    capacityRow: {
        gap: 8,
    },
    capacityLabel: {
        fontSize: 12,
        fontWeight: '600',
    },
    capacityInput: {
        marginBottom: 0,
    },
    summaryCard: {
        marginHorizontal: 16,
        marginTop: 4,
        borderRadius: 20,
    },
    summaryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 12,
    },
    summaryCountBubble: {
        width: 52,
        height: 52,
        borderRadius: 26,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#dbeafe',
    },
    summaryCountText: {
        color: '#1d4ed8',
        fontSize: 18,
        fontWeight: '700',
    },
    summaryStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 18,
    },
    summaryStatItem: {
        flex: 1,
    },
    summaryStatValue: {
        fontSize: 20,
        fontWeight: '700',
    },
    summaryStatLabel: {
        fontSize: 12,
        opacity: 0.72,
        marginTop: 4,
    },
    summaryBarTrack: {
        marginTop: 16,
        height: 10,
        borderRadius: 999,
        backgroundColor: '#e5e7eb',
        overflow: 'hidden',
    },
    summaryBarFill: {
        height: '100%',
        borderRadius: 999,
    },
    filtersCard: {
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 20,
    },
    filterLabel: {
        marginBottom: 10,
        fontWeight: '600',
    },
    chipRow: {
        gap: 10,
        paddingBottom: 12,
    },
    chip: {
        borderWidth: 1,
        borderRadius: 999,
        paddingHorizontal: 14,
        paddingVertical: 8,
    },
    chipText: {
        fontSize: 12,
        fontWeight: '600',
    },
    formCard: {
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 20,
    },
    formHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    clearText: {
        fontSize: 14,
    },
    formRow: {
        flexDirection: 'row',
        gap: 12,
    },
    formColumn: {
        flex: 1,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    allocationCard: {
        borderWidth: 1,
        borderRadius: 18,
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 12,
    },
    allocationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    studentBadge: {
        width: 34,
        height: 34,
        borderRadius: 17,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#dbeafe',
    },
    allocationIdentity: {
        flex: 1,
    },
    allocationName: {
        fontSize: 15,
    },
    allocationMeta: {
        fontSize: 12,
        marginTop: 2,
    },
    allocationStopPill: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
        backgroundColor: '#eef2ff',
    },
    allocationStopText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#4338ca',
    },
    allocationFooter: {
        marginTop: 12,
        gap: 4,
    },
    availableCard: {
        borderWidth: 1,
        borderRadius: 18,
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    availableName: {
        fontSize: 15,
    },
    availableMeta: {
        fontSize: 12,
        marginTop: 2,
    },
    emptyCard: {
        marginHorizontal: 16,
        marginBottom: 12,
        borderRadius: 18,
    },
});