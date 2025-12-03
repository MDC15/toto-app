import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function EditHabit() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const [habitName, setHabitName] = useState('');
    const [description, setDescription] = useState('');
    const [frequency, setFrequency] = useState('daily');
    const [targetCount, setTargetCount] = useState(1);
    const [selectedColor, setSelectedColor] = useState('#ea580c');
    const [reminderEnabled, setReminderEnabled] = useState(false);
    const [reminderTime, setReminderTime] = useState<string | null>(null);
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [showTargetInput, setShowTargetInput] = useState(false);
    const { hasPermission, scheduleHabitNotification, cancelHabitNotification } = useNotifications();

    // Debug: Track reminder state changes
    React.useEffect(() => {
        console.log('EditHabit: Reminder state changed to:', reminderEnabled, 'time:', reminderTime);
    }, [reminderEnabled, reminderTime]);

    // Alert modal states
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertType, setAlertType] = useState<'warning' | 'success' | 'error' | 'info'>('warning');
    const [alertTitle, setAlertTitle] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

    // Helper function to parse habit date (handles both old and new formats)
    const parseHabitDate = (dateString: string): Date => {
        try {
            // Try to parse as YYYY-MM-DD format first (new format)
            if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
                const [year, month, day] = dateString.split('-').map(Number);
                return new Date(year, month - 1, day);
            }
            // Fallback to standard Date parsing for other formats
            return new Date(dateString);
        } catch (error) {
            console.warn('Error parsing date:', dateString, error);
            return new Date(); // Return current date as fallback
        }
    };

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
                    const reminderEnabled = habit.reminder !== null && habit.reminder !== undefined && habit.reminder !== '';
                    setReminderEnabled(reminderEnabled);
                    setReminderTime(habit.reminder || null);
                    setStartDate(habit.start_date ? parseHabitDate(habit.start_date) : new Date());
                    setEndDate(habit.end_date ? parseHabitDate(habit.end_date) : null);
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

        console.log('EditHabit: handleUpdateHabit called with reminder enabled:', reminderEnabled, 'time:', reminderTime);

        if (endDate && startDate >= endDate) {
            showAlert('warning', 'Invalid Dates', 'End date must be after start date.');
            return;
        }

        const targetNum = targetCount;
        if (isNaN(targetNum) || targetNum <= 0) {
            showAlert('warning', 'Invalid Target Count', 'Please enter a valid target count greater than 0.');
            return;
        }

        const updateHabitAction = async () => {
            try {
                const reminderValue = reminderEnabled && reminderTime ? reminderTime : undefined;
                console.log('EditHabit: Updating habit with reminder:', reminderValue);

                // Update the habit
                await updateHabit(parseInt(id as string), habitName, description, frequency, targetCount, 0, selectedColor, reminderValue, getDateString(startDate), endDate ? getDateString(endDate) : undefined, undefined, false);

                // Handle notifications
                try {
                    if (hasPermission) {
                        // Cancel existing notification
                        await cancelHabitNotification(parseInt(id as string));

                        // Schedule new notification if reminder is enabled
                        if (reminderEnabled && reminderTime) {
                            // Parse the reminder time from the string
                            let reminderDate = new Date();
                            if (reminderTime.includes(':')) {
                                // It's a time string like "09:00" or "15:30"
                                const [hours, minutes] = reminderTime.split(':').map(Number);
                                reminderDate.setHours(hours);
                                reminderDate.setMinutes(minutes);
                            } else {
                                // It's a relative time like "15 minutes before"
                                const now = new Date();
                                if (reminderTime.includes("1 minute")) {
                                    reminderDate = new Date(now.getTime() + 60000);
                                } else if (reminderTime.includes("15 minutes")) {
                                    reminderDate = new Date(now.getTime() + 15 * 60000);
                                } else if (reminderTime.includes("30 minutes")) {
                                    reminderDate = new Date(now.getTime() + 30 * 60000);
                                } else {
                                    // Default to tomorrow at 9 AM
                                    reminderDate.setDate(reminderDate.getDate() + 1);
                                    reminderDate.setHours(9, 0, 0, 0);
                                }
                            }

                            await scheduleHabitNotification(
                                parseInt(id as string),
                                habitName,
                                description,
                                reminderDate.toISOString(),
                                'daily'
                            );
                        }
                    }
                } catch (notificationError) {
                    console.error('Error handling habit notifications:', notificationError);
                }

                console.log('EditHabit: Habit updated successfully');
                router.back();
            } catch (error) {
                console.error('EditHabit: Error updating habit:', error);
                showAlert('error', 'Error', 'Could not update habit.');
            }
        };

        showAlert('success', 'Update Habit', 'Are you sure you want to update this habit?', updateHabitAction);
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
            {/* Header Section with Color Preview */}
            <View style={[styles.section, styles.headerSection, { borderLeftColor: selectedColor, borderLeftWidth: 5 }]}>
                <View style={styles.headerRow}>
                    <View style={styles.headerContent}>
                        <Text style={styles.headerLabel}>Edit Habit</Text>
                        <Text style={styles.headerSubtitle}>{habitName || 'Untitled'}</Text>
                    </View>
                    <View style={[styles.colorPreview, { backgroundColor: selectedColor }]} />
                </View>
            </View>

            {/* Habit Details Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Details</Text>

                <Text style={styles.label}>Habit Name</Text>
                <TextInput
                    value={habitName}
                    onChangeText={setHabitName}
                    placeholder="Enter habit name"
                    style={styles.input}
                />

                <Text style={[styles.label, { marginTop: 12 }]}>Description</Text>
                <TextInput
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Add details about your habit"
                    style={[styles.input, styles.descArea]}
                    multiline
                    textAlignVertical="top"
                />

                <Text style={[styles.label, { marginTop: 12 }]}>Color</Text>
                <ColorPick
                    selectedColor={selectedColor}
                    onColorSelect={setSelectedColor}
                />
            </View>

            {/* Schedule Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Schedule</Text>

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

            {/* Reminder Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Reminder</Text>
                <UnifiedReminderSelector
                    type="habit"
                    enabled={reminderEnabled}
                    onToggle={setReminderEnabled}
                    value={reminderTime ? new Date().toISOString() : null}
                    onChange={(time) => {
                        if (time) {
                            setReminderTime(new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
                        } else {
                            setReminderTime(null);
                        }
                    }}
                    disabled={!hasPermission}
                />
            </View>

            {/* Submit Button */}
            <TouchableOpacity style={styles.button} onPress={handleUpdateHabit}>
                <Feather name="check" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.buttonText}>Save Changes</Text>
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

            {/* Target Count Input Modal */}
            <Modal
                visible={showTargetInput}
                transparent
                animationType="fade"
                onRequestClose={() => setShowTargetInput(false)}
            >
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setShowTargetInput(false)}
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Enter Target Count</Text>
                        <TextInput
                            style={styles.modalInput}
                            value={targetCount.toString()}
                            onChangeText={(text) => setTargetCount(parseInt(text) || 1)}
                            keyboardType="numeric"
                            autoFocus
                            selectTextOnFocus
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setShowTargetInput(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.confirmButton]}
                                onPress={() => {
                                    const num = targetCount;
                                    if (isNaN(num) || num <= 0) {
                                        setTargetCount(1);
                                    }
                                    setShowTargetInput(false);
                                }}
                            >
                                <Text style={styles.confirmButtonText}>OK</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Pressable>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },

    // Header section with color preview
    headerSection: { marginBottom: 24, backgroundColor: "#fafafa", paddingLeft: 16 },
    headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    headerContent: { flex: 1 },
    headerLabel: { fontSize: 12, fontWeight: "600", color: "#9ca3af", textTransform: "uppercase" },
    headerSubtitle: { fontSize: 20, fontWeight: "700", color: "#1f2937", marginTop: 4 },
    colorPreview: { width: 48, height: 48, borderRadius: 8 },

    // Form sections
    section: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 2,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    sectionTitle: { fontSize: 14, fontWeight: "700", color: "#1f2937", marginBottom: 14, textTransform: "uppercase", letterSpacing: 0.5 },

    label: {
        fontSize: 15,
        fontWeight: '600',
        color: '#444',
        marginBottom: 6,
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
    frequencyRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    frequencyOption: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: '#e1e5e9',
        borderRadius: 10,
        alignItems: 'center',
        marginHorizontal: 2,
        backgroundColor: '#fff',
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
    counterTextContainer: {
        minWidth: 30,
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
        flexDirection: 'row',
        justifyContent: 'center',
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