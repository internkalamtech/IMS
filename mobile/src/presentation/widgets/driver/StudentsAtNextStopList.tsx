import { ColorPalettes } from '@/core/theme/tokens';
import { StudentInfo } from '@/domain/entities/driver-workflow';
import { ThemedText } from '@/presentation/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { Linking, Pressable, StyleSheet, View } from 'react-native';

type StudentsAtNextStopListProps = {
    students: StudentInfo[];
};

type StudentCardProps = {
    student: StudentInfo;
};

function StudentCard({ student }: StudentCardProps) {
    const handleCall = async () => {
        await Linking.openURL(`tel:${student.parentPhone}`);
    };

    return (
        <View style={styles.card}>
            <View style={styles.leftContent}>
                <View style={styles.avatar}>
                    <ThemedText lightColor="#fff" darkColor="#fff" style={styles.avatarText}>
                        {student.name.slice(0, 1).toUpperCase()}
                    </ThemedText>
                </View>

                <View>
                    <ThemedText style={styles.name}>{student.name}</ThemedText>
                    <ThemedText style={styles.meta} lightColor="#475569" darkColor="#94a3b8">
                        {student.className} • Roll: {student.rollNumber}
                    </ThemedText>
                    <ThemedText style={styles.parent} lightColor="#64748b" darkColor="#94a3b8">
                        Parent: {student.parentName}
                    </ThemedText>
                </View>
            </View>

            <Pressable style={({ pressed }) => [styles.callButton, { opacity: pressed ? 0.85 : 1 }]} onPress={handleCall}>
                <Ionicons name="call-outline" size={16} color="#fff" />
                <ThemedText lightColor="#fff" darkColor="#fff" style={styles.callText}>
                    Call
                </ThemedText>
            </Pressable>
        </View>
    );
}

export function StudentsAtNextStopList({ students }: StudentsAtNextStopListProps) {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Ionicons name="people-outline" size={19} color="#111827" />
                <ThemedText style={styles.headerText}>Students at Next Stop</ThemedText>
            </View>

            <View style={styles.listContainer}>
                {students.map((student) => (
                    <StudentCard key={student.studentId} student={student} />
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    headerText: {
        fontSize: 19,
        lineHeight: 24,
        fontWeight: '500',
    },
    listContainer: {
        gap: 10,
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(15, 23, 42, 0.08)',
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    leftContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        flex: 1,
    },
    avatar: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: ColorPalettes.blue[500],
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontWeight: '700',
        fontSize: 16,
    },
    name: {
        fontSize: 20,
        lineHeight: 22,
        fontWeight: '500',
    },
    meta: {
        fontSize: 14,
        lineHeight: 18,
    },
    parent: {
        fontSize: 13,
        lineHeight: 17,
    },
    callButton: {
        backgroundColor: ColorPalettes.green[600],
        borderRadius: 20,
        minWidth: 66,
        height: 34,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    callText: {
        fontSize: 14,
        lineHeight: 18,
        fontWeight: '500',
    },
});
