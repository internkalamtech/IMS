import { ComplianceDocumentRepositoryImpl } from '@/data/repositories/compliance-document-repository-impl';
import { ComplianceDocument } from '@/domain/entities/compliance-document';
import { GetComplianceDocumentsUseCase } from '@/domain/usecases/get-compliance-documents-usecase';
import { useCallback, useEffect, useState } from 'react';

const repository = new ComplianceDocumentRepositoryImpl();
const getComplianceDocumentsUseCase = new GetComplianceDocumentsUseCase(repository);

export function useComplianceDocuments() {
    const [documents, setDocuments] = useState<ComplianceDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchDocuments = useCallback(async () => {
        setError(null);
        try {
            const data = await getComplianceDocumentsUseCase.execute();
            setDocuments(data);
        } catch (e: any) {
            setError(e.message || 'Failed to fetch compliance documents');
            console.error(e);
        }
    }, []);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            await fetchDocuments();
            setLoading(false);
        };
        load();
    }, [fetchDocuments]);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchDocuments();
        setRefreshing(false);
    };

    return {
        documents,
        loading,
        refreshing,
        error,
        onRefresh,
    };
}
