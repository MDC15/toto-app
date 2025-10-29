import AlertModal from "@/components/common/AlertModal";
import { getHabits, updateHabit } from "@/db/database";
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from 'react';
import { StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';

const colors = [
    '#fed7aa', '#fecaca', '#d1fae5', '#dbeafe', '#e9d5ff',
    '#fef3c7', '#fce7f3', '#cffafe', '#ecfccb',
];

export default function EditHabit() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const [habitName, setHabitName] = useState('');
    const [description, setDescription] = useState('');
    const [frequency, setFrequency] = useState('daily');
    const [targetCount, setTargetCount] = useState(1);
    const [selectedColor, setSelectedColor] = useState('#fed7aa');
    const [reminder, setReminder] = useState(true);

    // Alert modal states
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertType, setAlertType] = useState<'warning' | 'success' | 'error' | 'info'>('warning');
    const [alertTitle, setAlertTitle] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

    useEffect(() => {
        const loadHabit = async () => {
            try {
                const habits = await getHabits();
                const habit = habits.find((h: any) => h.id === parseInt(id as string));
                if (habit) {
                    setHabitName(habit.title);
                    setDescription(habit.description || '');
                    setFrequency(habit.frequency);
                    setTargetCount(habit.target_count);
                    setSelectedColor(habit.color || '#fed7aa');
                }
            } catch (error) {
                console.error('Error loading habit:', error);
                showAlert('error', 'Error', 'Could not load the habit.');
            }
        };

        if (id) {
            loadHabit();
        }
    }, [id]);

    // Helper function to show alert modal
    const showAlert = (type: 'warning' | 'success' | 'error' | 'info', title: string, message: string, action?: () => void) => {
        setAlertType(type);
        setAlertTitle(title);
        setAlertMessage(message);
        setPendingAction(() => action || null);
        setAlertVisible(true);
    };

    // Handle update habit
    const handleUpdateHabit = () => {
        if (!habitName.trim()) {
            showAlert('warning', 'Missing Name', 'Please enter a habit name.');
            return;
        }

        const updateHabitAction = async () => {
            try {
                await updateHabit(parseInt(id as string), habitName, description, frequency, targetCount, 0, selectedColor);
                router.back();
            } catch (error) {
                console.error(error);
                showAlert('error', 'Error', 'Could not update habit.');
            }
        };

        showAlert('success', 'Update Habit', 'Are you sure you want to update this habit?', updateHabitAction);
    };

    return (
        <View style={styles.container}>
            {/* Habit name */}
            <Text style={styles.label}>Habit Name</Text>
            <TextInput
                value={habitName}
                onChangeText={setHabitName}
                placeholder="Enter habit name"
                style={styles.input}
            />

            {/* Description */}
            <Text style={styles.label}>Description (optional)</Text>
            <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Add details about your habit"
                style={[styles.input, styles.descArea]}
                multiline
                textAlignVertical="top"
            />

            {/* Frequency */}
            <Text style={styles.label}>Frequency</Text>
            <View style={styles.frequencyRow}>
                {['daily', 'weekly', 'monthly'].map((freq) => (
                    <TouchableOpacity
                        key={freq}
                        style={[styles.frequencyOption, frequency === freq && styles.frequencySelected]}
                        onPress={() => setFrequency(freq)}
                    >
                        <Text style={[styles.frequencyText, frequency === freq && styles.frequencyTextSelected]}>
                            {freq.charAt(0).toUpperCase() + freq.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Target Count */}
            <Text style={styles.label}>Target Count</Text>
            <View style={styles.counterRow}>
                <TouchableOpacity
                    style={styles.counterButton}
                    onPress={() => setTargetCount(Math.max(1, targetCount - 1))}
                >
                    <Text style={styles.counterButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.counterText}>{targetCount}</Text>
                <TouchableOpacity
                    style={styles.counterButton}
                    onPress={() => setTargetCount(targetCount + 1)}
                >
                    <Text style={styles.counterButtonText}>+</Text>
                </TouchableOpacity>
            </View>

            {/* Color Picker */}
            <Text style={styles.label}>Color</Text>
            <View style={styles.colorRow}>
                {colors.map((c, i) => (
                    <TouchableOpacity
                        key={i}
                        style={[
                            styles.colorDot,
                            { backgroundColor: c },
                            selectedColor === c && styles.selectedDot,
                        ]}
                        onPress={() => setSelectedColor(c)}
                    />
                ))}
            </View>

            {/* Options Card */}
            <View style={styles.optionsCard}>
                <View style={styles.optionRow}>
                    <Ionicons name="notifications-outline" size={20} color="#E16A00" />
                    <Text style={styles.optionText}>Reminder</Text>
                    <Switch
                        trackColor={{ false: '#ccc', true: '#FF8C42' }}
                        thumbColor={'#fff'}
                        value={reminder}
                        onValueChange={setReminder}
                        style={{ marginLeft: 'auto' }}
                    />
                </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity style={styles.button} onPress={handleUpdateHabit}>
                <Text style={styles.buttonText}>Update Habit</Text>
            </TouchableOpacity>

            {/* Alert Modal */}
            <AlertModal
                visible={alertVisible}
                type={alertType}
                title={alertTitle}
                message={alertMessage}
                onConfirm={pendingAction || (() => setAlertVisible(false))}
                onCancel={() => setAlertVisible(false)}
                onClose={() => setAlertVisible(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
    },
    label: {
        fontSize: 15,
        fontWeight: '600',
        color: '#444',
        marginBottom: 6,
        paddingTop: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 10,
        fontSize: 14,
        marginBottom: 20,
    },
    descArea: {
        minHeight: 80,
        maxHeight: 120,
        textAlignVertical: 'top',
    },
    frequencyRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    frequencyOption: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        alignItems: 'center',
        marginHorizontal: 2,
    },
    frequencySelected: {
        backgroundColor: '#f97316',
        borderColor: '#f97316',
    },
    frequencyText: {
        fontSize: 14,
        color: '#666',
    },
    frequencyTextSelected: {
        color: '#fff',
    },
    counterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    counterButton: {
        width: 40,
        height: 40,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    counterButtonText: {
        fontSize: 20,
        color: '#666',
    },
    counterText: {
        fontSize: 18,
        fontWeight: '600',
        marginHorizontal: 20,
        minWidth: 30,
        textAlign: 'center',
    },
    colorRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 25,
    },
    colorDot: {
        width: 28,
        height: 28,
        borderRadius: 14,
    },
    selectedDot: {
        borderWidth: 2,
        borderColor: '#333',
    },
    optionsCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        marginBottom: 40,
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    optionText: {
        fontSize: 15,
        color: '#333',
        marginLeft: 10,
    },
    button: {
        backgroundColor: '#f97316',
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});