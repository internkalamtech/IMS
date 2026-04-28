export interface ComplianceDocument {
    id: number;
    type: string;
    vehicleName: string;
    documentNumber: string;
    issuedDate: string;
    expiryDate: string;
    status: string;
    daysLeft: number;
    fileUrl?: string;
}
