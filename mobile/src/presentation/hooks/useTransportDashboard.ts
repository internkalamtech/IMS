import { api } from '@/core/api-client';
import { useCallback, useEffect, useState } from 'react';
import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';

type IconName = ComponentProps<typeof Ionicons>['name'];

interface Route {
    id: string;
    name: string;
    status: 'on_time' | 'delayed';
    total_stops: number;
    total_students: number;
    assigned_bus: string;
    driver: string;
    next_stop?: string;
    next_time?: string;
    current_location?: { lat: number; lng: number };
    delay_minutes: number;
}

interface ComplianceStatus {
    valid_documents: number;
    expiring_soon: number;
    expired: number;
}

type TransportAlertType = 'danger' | 'warning' | 'maintenance' | 'alert';

interface TransportAlert {
    id: string;
    bus_id: string;
    type: TransportAlertType;
    message: string;
    timestamp: string;
    location: string;
    resolved: boolean;
    icon?: IconName;
}

interface ExpiringDocument {
    id: string;
    bus_id: string;
    type: string;
    document_number: string;
    expiry_date: string;
    status: string;
    days_left: number;
}

export function useTransportDashboard() {
    const [routes, setRoutes] = useState<Route[]>([]);
    const [complianceStatus, setComplianceStatus] = useState<ComplianceStatus | null>(null);
    const [transportAlerts, setTransportAlerts] = useState<TransportAlert[]>([]);
    const [expiringDocuments, setExpiringDocuments] = useState<ExpiringDocument[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const fetchTransportData = useCallback(async () => {
        try {
            const [routesRes, complianceRes, alertsRes, documentsRes] = await Promise.all([
                api.get('/transport/routes'),
                api.get('/transport/compliance/status'),
                api.get('/transport/alerts?limit=4'),
                api.get('/transport/documents/expiring?days=30'),
            ]);

            setRoutes(routesRes.data.routes || []);
            setComplianceStatus(complianceRes.data);
            setTransportAlerts(alertsRes.data.alerts || []);
            setExpiringDocuments(documentsRes.data.documents || []);
        } catch (error) {
            console.error('Failed to fetch transport data:', error);
        }
    }, []);

    useEffect(() => {
        fetchTransportData();
    }, [fetchTransportData]);

    const refreshTransportData = useCallback(async () => {
        setRefreshing(true);
        try {
            await fetchTransportData();
        } finally {
            setRefreshing(false);
        }
    }, [fetchTransportData]);

    return {
        routes,
        complianceStatus,
        transportAlerts,
        expiringDocuments,
        transportRefreshing: refreshing,
        refreshTransportData,
    };
}
