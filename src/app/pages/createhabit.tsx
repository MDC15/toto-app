import AlertModal from '@/components/common/AlertModal';
import ColorPick from '@/components/habits/ColorPick';
import DatePicker from '@/components/common/DatePicker';
import ReminderSelector from '@/components/common/ReminderSelector';
import { addHabit } from '@/db/database';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function CreateHabit() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [habitName, setHabitName] = useState(params.title as string || '');
    const [description, setDescription] = useState(params.description as string || '');
    const [selectedColor, setSelectedColor] = useState('#ea580c');
    const [reminderEnabled, setReminderEnabled] = useState(() => params.reminder === "true");
    const [reminderTime, setReminderTime] = useState('15 minutes before');
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState<Date | null>(null);

    // Diagnostic logging for reminder state
    React.useEffect(() => {
        console.log('CreateHabit: Reminder state - enabled:', reminderEnabled, 'time:', reminderTime);
    }, [reminderEnabled, reminderTime]);

    // Alert modal states
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertType, setAlertType] = useState<'warning' | 'success' | 'error' | 'info'>('warning');
    const [alertTitle, setAlertTitle] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
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

            {/* Color Picker */}
            <ColorPick
                selectedColor={selectedColor}
                onColorSelect={setSelectedColor}
            />

            {/* Options Card */}
            <View style={styles.optionsCard}>
                <View style={styles.optionRow}>
                    <Ionicons name="repeat" size={20} color="#E16A00" />
                    <Text style={styles.optionText}>Repeat</Text>
                </View>

                <View style={styles.dateSection}>
                    <DatePicker
                        label="Start Date"
                        date={startDate}
                        onChange={setStartDate}
                        placeholder="Select start date"
                    />

                    <DatePicker
                        label="End Date"
                        date={endDate}
                        onChange={setEndDate}
                        placeholder="Select end date"
                    />
                </View>

                <ReminderSelector
                    enabled={reminderEnabled}
                    selected={reminderTime}
                    onToggle={setReminderEnabled}
                    onSelect={setReminderTime}
                />
            </View>

            {/* Submit Button */}
            <TouchableOpacity style={styles.button} onPress={handleCreateHabit}>
                <Text style={styles.buttonText}>Create Habit</Text>
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
        </ScrollView>
    );

    // Helper function to show alert modal
    function showAlert(type: 'warning' | 'success' | 'error' | 'info', title: string, message: string, action?: () => void) {
        setAlertType(type);
        setAlertTitle(title);
        setAlertMessage(message);
        setPendingAction(() => action || null);
        setAlertVisible(true);
    }

    // Handle create habit
    function handleCreateHabit() {
        if (!habitName.trim()) {
            showAlert('warning', 'Missing Name', 'Please enter a habit name.');
            return;
        }

        if (endDate && startDate >= endDate) {
            showAlert('warning', 'Invalid Dates', 'End date must be after start date.');
            return;
        }

        const createHabitAction = async () => {
            try {
                await addHabit(
                    habitName,
                    description,
                    'daily', // Default frequency
                    1, // Default target count
                    selectedColor,
                    startDate.toISOString().split('T')[0],
                    endDate ? endDate.toISOString().split('T')[0] : undefined,
                    reminderEnabled ? reminderTime : undefined,
                    false
                );
                // Navigate back to habits screen to refresh the list
                router.replace('/(tabs)/habits');
            } catch (error) {
                console.error(error);
                showAlert('error', 'Error', 'Could not create habit.');
            }
        };

        showAlert('success', 'Create Habit', 'Are you sure you want to create this habit?', createHabitAction);
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    scrollContent: {
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
        borderColor: '#e1e5e9',
        borderRadius: 10,
        padding: 12,
        fontSize: 14,
        marginBottom: 20,
        backgroundColor: '#fff',
    },
    descArea: {
        minHeight: 80,
        maxHeight: 120,
        textAlignVertical: 'top',
    },
    optionsCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        marginBottom: 40,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
    },
    optionText: {
        fontSize: 15,
        color: '#333',
        marginLeft: 10,
    },
    dateSection: {
        marginBottom: 16,
    },
    button: {
        backgroundColor: '#f97316',
        borderRadius: 12,
        paddingVertical: 16,
        width: '100%',
        alignSelf: 'center',
        marginBottom: 45,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#f97316',
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 12,
        width: '80%',
        padding: 20,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 20,
    },
    modalInput: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
        width: '100%',
        textAlign: 'center',
        marginBottom: 20,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    cancelButton: {
        backgroundColor: '#f3f4f6',
    },
    confirmButton: {
        backgroundColor: '#f97316',
    },
    cancelButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '600',
    },
    confirmButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    checkboxContainer: {
        marginRight: 10,
    },
});
