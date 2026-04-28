import { useTheme } from '@/core/theme/ThemeContext';
import { ComplianceDocumentRepositoryImpl } from '@/data/repositories/compliance-document-repository-impl';
import { ComplianceDocument } from '@/domain/entities/compliance-document';
import { UpdateComplianceDocumentUseCase } from '@/domain/usecases/update-compliance-document-usecase';
import { UploadComplianceDocumentUseCase } from '@/domain/usecases/upload-compliance-document-usecase';
import { ThemedButton } from '@/presentation/components/ThemedButton';
import { ThemedCard } from '@/presentation/components/ThemedCard';
import { ThemedText } from '@/presentation/components/ThemedText';
import { ThemedTextInput } from '@/presentation/components/ThemedTextInput';
import { ThemedView } from '@/presentation/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState, createElement } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const DOC_TYPES = [
  'Insurance',
  'Pollution Certificate',
  'Fitness Certificate',
  'ID Card',
  'License',
  'Tax Document',
  'Vehicle Document',
  'Others'
];

const repository = new ComplianceDocumentRepositoryImpl();
const uploadUseCase = new UploadComplianceDocumentUseCase(repository);
const updateUseCase = new UpdateComplianceDocumentUseCase(repository);

export default function AddEditComplianceDocumentScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { theme } = useTheme();

  const isEditMode = !!id;

  const [formData, setFormData] = useState<Partial<ComplianceDocument>>({
    vehicleName: '',
    type: 'Insurance',
    documentNumber: '',
    issuedDate: '',
    expiryDate: '',
  });

  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(isEditMode);
  const [errors, setErrors] = useState<any>({});
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (isEditMode) {
      // Fetch the document to edit
      // For now, we fetch all and find the one. Ideally, we would have a getById method.
      repository.getComplianceDocuments().then(docs => {
        const doc = docs.find(d => d.id === Number(id));
        if (doc) {
          setFormData({
            vehicleName: doc.vehicleName === 'N/A' ? '' : doc.vehicleName,
            type: doc.type,
            documentNumber: doc.documentNumber === 'N/A' ? '' : doc.documentNumber,
            issuedDate: doc.issuedDate ? doc.issuedDate.substring(0, 10) : '',
            expiryDate: doc.expiryDate ? doc.expiryDate.substring(0, 10) : '',
            fileUrl: doc.fileUrl,
          });
        }
        setLoadingInitial(false);
      }).catch(err => {
        console.error(err);
        setLoadingInitial(false);
        Alert.alert('Error', 'Failed to load document details');
      });
    }
  }, [id, isEditMode]);

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedFile(result.assets[0]);
      }
    } catch (err) {
      console.error('Error picking document', err);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const validateForm = () => {
    const newErrors: any = {};
    if (!formData.vehicleName?.trim()) newErrors.vehicleName = 'Vehicle Name is required';
    if (!formData.type?.trim()) newErrors.type = 'Document Type is required';
    if (!formData.expiryDate?.trim()) newErrors.expiryDate = 'Expiry Date is required';
    else if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.expiryDate)) {
      newErrors.expiryDate = 'Format: YYYY-MM-DD';
    }

    if (formData.issuedDate && formData.issuedDate.trim() !== '' && !/^\d{4}-\d{2}-\d{2}$/.test(formData.issuedDate)) {
      newErrors.issuedDate = 'Format: YYYY-MM-DD';
    }

    if (formData.issuedDate && formData.expiryDate && !newErrors.issuedDate && !newErrors.expiryDate) {
      if (new Date(formData.expiryDate) < new Date(formData.issuedDate)) {
        newErrors.expiryDate = 'Expiry date must be after issue date';
      }
    }

    if (!isEditMode && !selectedFile && !formData.fileUrl) {
      newErrors.file = 'Please upload a document file/image';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill in all required fields correctly.');
      return;
    }

    setSubmitting(true);
    try {
      let fileToUpload = null;
      if (selectedFile) {
        fileToUpload = Platform.OS === 'web' && selectedFile.file
          ? selectedFile.file
          : {
              uri: selectedFile.uri,
              name: selectedFile.name,
              type: selectedFile.mimeType || 'application/octet-stream',
            };
      }

      if (isEditMode) {
        await updateUseCase.execute(Number(id), formData, fileToUpload);
        setSuccessMessage('UPLOADED SUCCESSFULLY');
        setTimeout(() => router.back(), 1500);
      } else {
        await uploadUseCase.execute(formData, fileToUpload);
        setSuccessMessage('UPLOADED SUCCESSFULLY');
        setTimeout(() => router.back(), 1500);
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to save document. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/'); // In case of direct navigation without history
    }
  };

  if (loadingInitial) {
    return (
      <ThemedView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ThemedText>Loading document details...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={[styles.banner, { backgroundColor: theme.colors.primary }]}>
          <SafeAreaView edges={['top']}>
              <View style={styles.header}>
                  <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
                      <Ionicons name="arrow-back" size={24} color="#fff" />
                  </TouchableOpacity>
                  <View style={styles.headerTitleContainer}>
                      <ThemedText style={styles.headerTitle} lightColor="#fff" darkColor="#fff" type="title">
                        {isEditMode ? 'Edit Document' : 'Upload Document'}
                      </ThemedText>
                  </View>
              </View>
          </SafeAreaView>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <ThemedCard style={styles.card}>
            <View style={{ marginBottom: 16 }}>
              <ThemedText style={styles.sectionTitle} type="defaultSemiBold">Document Details</ThemedText>
            </View>

            <ThemedTextInput
              label="Vehicle Name *"
              placeholder="e.g., BUS-012 or Rajesh Kumar"
              value={formData.vehicleName}
              onChangeText={(value) => setFormData({ ...formData, vehicleName: value })}
              error={errors.vehicleName}
              editable={!submitting}
            />

            <View style={[styles.row, { zIndex: showTypeDropdown ? 2 : 1, elevation: showTypeDropdown ? 2 : 1 }]}>
              <View style={[styles.fieldContainer, styles.flex1, { zIndex: showTypeDropdown ? 1000 : 1, elevation: showTypeDropdown ? 10 : 0 }]}>
                <ThemedText style={styles.fieldLabel} type="defaultSemiBold">
                  Document Type <ThemedText style={styles.required}>*</ThemedText>
                </ThemedText>
                <TouchableOpacity
                  style={[
                    styles.dropdown,
                    { borderColor: errors.type ? theme.colors.destructive : theme.colors.border, backgroundColor: theme.colors.input },
                  ]}
                  onPress={() => setShowTypeDropdown(!showTypeDropdown)}
                  disabled={submitting}
                >
                  <ThemedText>{formData.type}</ThemedText>
                  <Ionicons name={showTypeDropdown ? 'chevron-up' : 'chevron-down'} size={20} color={theme.colors.foreground} />
                </TouchableOpacity>

                {showTypeDropdown && (
                  <View style={[styles.dropdownMenu, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                    <ScrollView nestedScrollEnabled={true} style={{ maxHeight: 220 }}>
                      {DOC_TYPES.map((type) => (
                        <TouchableOpacity
                          key={type}
                          style={[styles.dropdownItem, { backgroundColor: formData.type === type ? theme.colors.primary + '20' : 'transparent' }]}
                          onPress={() => {
                            setFormData({ ...formData, type });
                            setShowTypeDropdown(false);
                          }}
                        >
                          <ThemedText>{type}</ThemedText>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
                {errors.type && <ThemedText style={{ color: theme.colors.destructive, fontSize: 12, marginTop: 4 }}>{errors.type}</ThemedText>}
              </View>

              <View style={[styles.fieldContainer, styles.flex1]}>
                <ThemedText style={styles.fieldLabel} type="defaultSemiBold">Document Number</ThemedText>
                <View>
                  <ThemedTextInput
                    placeholder="Document #"
                    value={formData.documentNumber}
                    onChangeText={(value) => setFormData({ ...formData, documentNumber: value })}
                    error={errors.documentNumber}
                    editable={!submitting}
                  />
                </View>
              </View>
            </View>

            <View style={[styles.row, { zIndex: 0, elevation: 0 }]}>
              <View style={[styles.fieldContainer, styles.flex1]}>
                <ThemedText style={styles.fieldLabel} type="defaultSemiBold">Issue Date</ThemedText>
                <View style={{ position: 'relative' }}>
                  {Platform.OS === 'web' ? (
                    createElement('input', {
                      type: 'date',
                      value: formData.issuedDate,
                      onChange: (e: any) => setFormData({ ...formData, issuedDate: e.target.value }),
                      onClick: (e: any) => {
                        try { if (e.target && e.target.showPicker) e.target.showPicker(); } catch (err) {}
                      },
                      style: {
                        height: 48,
                        borderWidth: 1,
                        borderStyle: 'solid',
                        borderColor: errors.issuedDate ? theme.colors.destructive : theme.colors.border,
                        borderRadius: 8,
                        paddingLeft: 16,
                        paddingRight: 40,
                        fontSize: 16,
                        color: theme.colors.foreground,
                        backgroundColor: theme.colors.input,
                        width: '100%',
                        fontFamily: 'inherit',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }
                    })
                  ) : (
                    <ThemedTextInput
                      placeholder="YYYY-MM-DD"
                      value={formData.issuedDate}
                      onChangeText={(value) => setFormData({ ...formData, issuedDate: value })}
                      error={errors.issuedDate}
                      editable={!submitting}
                      {...({ type: 'date' } as any)}
                    />
                  )}
                  {Platform.OS !== 'web' && (
                    <Ionicons 
                      name="calendar-outline" 
                      size={20} 
                      color={theme.colors.foreground + '80'} 
                      style={{ position: 'absolute', right: 14, top: 14 }} 
                      pointerEvents="none" 
                    />
                  )}
                </View>
              </View>

              <View style={[styles.fieldContainer, styles.flex1]}>
                <ThemedText style={styles.fieldLabel} type="defaultSemiBold">
                  Expiry Date <ThemedText style={styles.required}>*</ThemedText>
                </ThemedText>
                <View style={{ position: 'relative' }}>
                  {Platform.OS === 'web' ? (
                    createElement('input', {
                      type: 'date',
                      value: formData.expiryDate,
                      onChange: (e: any) => setFormData({ ...formData, expiryDate: e.target.value }),
                      onClick: (e: any) => {
                        try { if (e.target && e.target.showPicker) e.target.showPicker(); } catch (err) {}
                      },
                      style: {
                        height: 48,
                        borderWidth: 1,
                        borderStyle: 'solid',
                        borderColor: errors.expiryDate ? theme.colors.destructive : theme.colors.border,
                        borderRadius: 8,
                        paddingLeft: 16,
                        paddingRight: 40,
                        fontSize: 16,
                        color: theme.colors.foreground,
                        backgroundColor: theme.colors.input,
                        width: '100%',
                        fontFamily: 'inherit',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }
                    })
                  ) : (
                    <ThemedTextInput
                      placeholder="YYYY-MM-DD"
                      value={formData.expiryDate}
                      onChangeText={(value) => setFormData({ ...formData, expiryDate: value })}
                      error={errors.expiryDate}
                      editable={!submitting}
                      {...({ type: 'date' } as any)}
                    />
                  )}
                  {Platform.OS !== 'web' && (
                    <Ionicons 
                      name="calendar-outline" 
                      size={20} 
                      color={theme.colors.foreground + '80'} 
                      style={{ position: 'absolute', right: 14, top: 14 }} 
                      pointerEvents="none" 
                    />
                  )}
                </View>
              </View>
            </View>

            <View style={styles.fieldContainer}>
              <ThemedText style={styles.fieldLabel} type="defaultSemiBold">
                Upload File / Image {!isEditMode && <ThemedText style={styles.required}>*</ThemedText>}
              </ThemedText>
              <TouchableOpacity
                style={[styles.uploadBox, { borderColor: errors.file ? theme.colors.destructive : theme.colors.border, borderStyle: 'dashed' }]}
                onPress={handlePickDocument}
                disabled={submitting}
              >
                {selectedFile ? (
                   <View style={{ alignItems: 'center' }}>
                     <Ionicons name={selectedFile.mimeType?.includes('pdf') ? "document-text" : "image"} size={32} color={theme.colors.primary} />
                     <ThemedText style={{ marginTop: 8, textAlign: 'center' }}>{selectedFile.name}</ThemedText>
                   </View>
                ) : formData.fileUrl ? (
                   <View style={{ alignItems: 'center' }}>
                     <Ionicons name="document-attach" size={32} color={theme.colors.primary} />
                     <ThemedText style={{ marginTop: 8, textAlign: 'center' }}>Existing File Uploaded</ThemedText>
                     <ThemedText style={{ marginTop: 4, color: theme.colors.foreground + '80', fontSize: 12 }}>Click to replace</ThemedText>
                   </View>
                ) : (
                  <View style={{ alignItems: 'center' }}>
                    <Ionicons name="cloud-upload-outline" size={32} color={errors.file ? theme.colors.destructive : theme.colors.foreground + '80'} />
                    <ThemedText style={{ marginTop: 8, color: errors.file ? theme.colors.destructive : theme.colors.foreground + '80', textAlign: 'center' }}>
                      Drag & drop or click to upload{'\n'}PNG, JPG, PDF (max 10MB)
                    </ThemedText>
                  </View>
                )}
              </TouchableOpacity>
              {errors.file && <ThemedText style={{ color: theme.colors.destructive, fontSize: 12, marginTop: 4 }}>{errors.file}</ThemedText>}
            </View>
          </ThemedCard>
          
          {successMessage ? (
            <View style={{ backgroundColor: '#10b981', padding: 12, borderRadius: 8, marginBottom: 16, alignItems: 'center' }}>
              <ThemedText style={{ color: 'white', fontWeight: 'bold' }}>{successMessage}</ThemedText>
            </View>
          ) : null}

          <View style={styles.buttonContainer}>
            <ThemedButton
              title="Cancel"
              onPress={handleGoBack}
              disabled={submitting}
              type="outline"
              style={styles.cancelButton}
            />
            <ThemedButton
              title={submitting ? (isEditMode ? "Saving..." : "Uploading...") : (isEditMode ? "Save Changes" : "Upload")}
              onPress={handleSubmit}
              disabled={submitting}
              type="primary"
              style={styles.submitButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  banner: {
    paddingBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    marginBottom: 20,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  fieldContainer: {
    marginBottom: 18,
  },
  fieldLabel: {
    marginBottom: 10,
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  required: {
    color: '#ef4444',
    fontWeight: '600',
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderRadius: 10,
    minHeight: 50,
  },
  dropdownMenu: {
    borderWidth: 1.5,
    borderRadius: 10,
    marginTop: 6,
    overflow: 'hidden',
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 4,
  },
  dropdownItem: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    minHeight: 48,
    justifyContent: 'center',
  },
  uploadBox: {
    borderWidth: 1.5,
    borderRadius: 10,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    borderRadius: 10,
    minHeight: 52,
  },
  submitButton: {
    flex: 1,
    borderRadius: 10,
    minHeight: 52,
  },
  flex1: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
    zIndex: 1,
  },
});
