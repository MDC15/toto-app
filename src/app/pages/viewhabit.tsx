import { getHabits } from '@/db/database';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ViewHabit() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const [habit, setHabit] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadHabit = async () => {
            try {
                const habits = await getHabits();
                const foundHabit = habits.find((h: any) => h.id === parseInt(id as string));
                if (foundHabit) {
                    setHabit(foundHabit);
                }
            } catch (error) {
                console.error('Error loading habit:', error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            loadHabit();
        }
    }, [id]);

    const handleEdit = () => {
        router.push({ pathname: '/pages/edithabit', params: { id: habit.id } });
    };

    const getFrequencyText = () => {
        if (!habit.frequency) return 'Daily';
        const freq = habit.frequency.toLowerCase();
        if (freq.includes('daily')) return 'Daily';
        if (freq.includes('weekly')) return 'Weekly';
        if (freq.includes('monthly')) return 'Monthly';
        return habit.frequency;
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    if (!habit) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Habit not found</Text>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
            {/* Main Habit Info */}
            <View style={[styles.mainCard, { borderLeftColor: habit.color, borderLeftWidth: 4 }]}>
                <View style={styles.headerRow}>
                    <Text style={[styles.title, { color: habit.color }]}>{habit.title}</Text>
                    <View style={[styles.colorIndicator, { backgroundColor: habit.color }]} />
                </View>

                {habit.description && (
                    <Text style={styles.description}>{habit.description}</Text>
                )}

                <View style={styles.dateRow}>
                    <Text style={styles.dateText}>
                        {habit.start_date ? new Date(habit.start_date).toLocaleDateString() : 'No start date'}
                        {habit.end_date && ` - ${new Date(habit.end_date).toLocaleDateString()}`}
                    </Text>
                </View>
            </View>

            {/* Essential Details */}
            <View style={styles.detailsCard}>
                <Text style={styles.sectionTitle}>Details</Text>

                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Frequency</Text>
                    <Text style={styles.detailValue}>{getFrequencyText()}</Text>
                </View>

                {habit.reminder && (
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Reminder</Text>
                        <Text style={styles.detailValue}>{habit.reminder}</Text>
                    </View>
                )}
            </View>

            {/* Action Button */}
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: habit.color }]} onPress={handleEdit}>
                <Ionicons name="create-outline" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Edit Habit</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollContent: {
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        padding: 20,
    },
    errorText: {
        fontSize: 18,
        color: '#666',
        marginBottom: 20,
    },
    backButton: {
        padding: 10,
    },
    backButtonText: {
        color: '#f97316',
        fontSize: 16,
        fontWeight: '600',
    },
    mainCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        flex: 1,
    },
    colorIndicator: {
        width: 16,
        height: 16,
        borderRadius: 8,
    },
    description: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 12,
    },
    dateRow: {
        marginTop: 8,
    },
    dateText: {
        fontSize: 14,
        color: '#888',
        fontWeight: '500',
    },
    detailsCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    detailLabel: {
        fontSize: 15,
        color: '#666',
        fontWeight: '500',
    },
    detailValue: {
        fontSize: 15,
        color: '#333',
        fontWeight: '600',
        textAlign: 'right',
        flex: 1,
        marginLeft: 16,
    },
    actionButton: {
        borderRadius: 12,
        paddingVertical: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
});