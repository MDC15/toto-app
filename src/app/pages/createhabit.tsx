import AlertModal from '@/components/common/AlertModal';
import DatePicker from '@/components/common/DatePicker';
import { UnifiedReminderSelector } from '@/components/common/UnifiedReminderSelector';
import ColorPick from '@/components/habits/ColorPick';
import { useNotifications } from '@/contexts/NotificationContext';
import { addHabit } from '@/db/database';
import { getDateString } from '@/utils/dateUtils';
import { ReminderTime } from '@/types/reminder.types';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from "expo-router";
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function CreateHabit() {
    const params = useLocalSearchParams();
    const [habitName, setHabitName] = useState(params.title as string || '');
    const [description, setDescription] = useState(params.description as string || '');
    const [selectedColor, setSelectedColor] = useState('#ea580c');
    const [reminderEnabled, setReminderEnabled] = useState(() => params.reminder === "true");
    const [reminderTime, setReminderTime] = useState<ReminderTime>(5); // Default to 5 minutes
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState<Date | null>(null);
    const { hasPermission, scheduleHabitNotification } = useNotifications();

    // Validate date function to prevent invalid dates
    const validateDate = (date: Date): boolean => {
        return date instanceof Date && !isNaN(date.getTime());
    };

    // Safe date creation function
    const createSafeDate = (year: number, month: number, day: number, hours: number = 0, minutes: number = 0): Date | null => {
        try {
            const date = new Date(year, month, day, hours, minutes, 0, 0);
            return validateDate(date) ? date : null;
        } catch (error) {
            console.error('Invalid date creation:', { year, month, day, hours, minutes }, error);
            return null;
        }
    };

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
            <Text style={styles.label}>Description</Text>
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

                <UnifiedReminderSelector
                    type="habit"
                    enabled={reminderEnabled}
                    onToggle={setReminderEnabled}
                    value={reminderTime as any} // Cast to string | null
                    onChange={(value: string | null) => setReminderTime(value as any)} // Handle string | null
                    disabled={!hasPermission}
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
                onCancel={alertType === 'success' ? undefined : () => setAlertVisible(false)}
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
    async function handleCreateHabit() {
        if (!habitName.trim()) {
            showAlert('warning', 'Missing Name', 'Please enter a habit name.');
            return;
        }

        if (endDate && startDate >= endDate) {
            showAlert('warning', 'Invalid Dates', 'End date must be after start date.');
            return;
        }

        try {
            const newHabitId = await addHabit(
                habitName,
                description,
                'daily', // Default frequency
                1, // Default target count
                selectedColor,
                getDateString(startDate),
                endDate ? getDateString(endDate) : undefined,
                reminderEnabled && reminderTime ? (reminderTime as number).toString() : undefined,
                false
            );

            // Schedule notification if reminder is enabled and we have a valid reminder time
            if (reminderEnabled && reminderTime && hasPermission && newHabitId) {
                try {
                    const reminderDate = await calculateReminderDate(reminderTime);
                    if (reminderDate && validateDate(reminderDate)) {
                        await scheduleHabitNotification(
                            newHabitId,
                            habitName,
                            description,
                            reminderDate.toISOString(),
                            'daily'
                        );
                    } else {
                        console.warn('Invalid reminder date calculated, skipping notification');
                    }
                } catch (notificationError) {
                    console.error('Failed to schedule notification:', notificationError);
                    // Don't fail habit creation for notification errors
                }
            }

            // Create a function to clear form and close modal
            const clearFormAndClose = () => {
                // Clear form fields after successful creation
                setHabitName('');
                setDescription('');
                setSelectedColor('#ea580c');
                setReminderEnabled(false);
                setReminderTime(5); // Reset to default 5 minutes
                setStartDate(new Date());
                setEndDate(null);
                setAlertVisible(false);
            };

            // Show success alert and clear form
            showAlert('success', 'Habit Created', 'Habit created successfully!', clearFormAndClose);
        } catch (error) {
            console.error('Error creating habit:', error);
            showAlert('error', 'Error', 'Could not create habit. Please try again.');
        }
    }

    // Calculate reminder date with proper validation
    async function calculateReminderDate(reminderTime: ReminderTime): Promise<Date | null> {
        try {
            const now = new Date();

            // Handle standard reminder times (1, 5, 30 minutes)
            if (typeof reminderTime === 'number') {
                const reminderDate = new Date(now.getTime() + (reminderTime * 60 * 1000));
                return validateDate(reminderDate) ? reminderDate : null;
            }

            // Handle custom reminder times
            if (typeof reminderTime === 'object' && reminderTime !== null) {
                const { hours, minutes } = reminderTime;
                if (typeof hours === 'number' && typeof minutes === 'number') {
                    const today = new Date();
                    const reminderDate = createSafeDate(
                        today.getFullYear(),
                        today.getMonth(),
                        today.getDate(),
                        hours,
                        minutes
                    );

                    // If time has passed today, schedule for tomorrow
                    if (reminderDate && reminderDate <= now) {
                        const tomorrow = new Date(today);
                        tomorrow.setDate(today.getDate() + 1);
                        return createSafeDate(
                            tomorrow.getFullYear(),
                            tomorrow.getMonth(),
                            tomorrow.getDate(),
                            hours,
                            minutes
                        );
                    }

                    return reminderDate;
                }
            }

            console.warn('Invalid reminder time format:', reminderTime);
            return null;
        } catch (error) {
            console.error('Error calculating reminder date:', error);
            return null;
        }
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
