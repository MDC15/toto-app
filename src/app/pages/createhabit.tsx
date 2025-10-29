import AlertModal from '@/components/common/AlertModal';
import DatePicker from '@/components/common/DatePicker';
import ReminderSelector from '@/components/common/ReminderSelector';
import { addHabit } from '@/db/database';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const colors = [
    '#fed7aa', '#fecaca', '#d1fae5', '#dbeafe', '#e9d5ff',
    '#fef3c7', '#fce7f3', '#cffafe', '#ecfccb',
];

export default function CreateHabit() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [habitName, setHabitName] = useState(params.title as string || '');
    const [description, setDescription] = useState(params.description as string || '');
    const [frequency, setFrequency] = useState('daily');
    const [targetCount, setTargetCount] = useState('1');
    const [selectedColor, setSelectedColor] = useState('#fed7aa');
    const [reminderEnabled, setReminderEnabled] = useState(false);
    const [reminderTime, setReminderTime] = useState('15 minutes before');
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [showTargetInput, setShowTargetInput] = useState(false);

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
                    onPress={() => {
                        const num = parseInt(targetCount);
                        if (!isNaN(num) && num > 1) {
                            setTargetCount((num - 1).toString());
                        }
                    }}
                >
                    <Text style={styles.counterButtonText}>-</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.counterTextContainer}
                    onPress={() => setShowTargetInput(true)}
                >
                    <Text style={styles.counterText}>{targetCount}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.counterButton}
                    onPress={() => {
                        const num = parseInt(targetCount);
                        if (!isNaN(num)) {
                            setTargetCount((num + 1).toString());
                        }
                    }}
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
                <Text style={styles.sectionTitle}>Additional Settings</Text>

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
                        label="End Date (Optional)"
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
                            value={targetCount}
                            onChangeText={setTargetCount}
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
                                    const num = parseInt(targetCount);
                                    if (isNaN(num) || num <= 0) {
                                        setTargetCount('1');
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

        const targetNum = parseInt(targetCount);
        if (isNaN(targetNum) || targetNum <= 0) {
            showAlert('warning', 'Invalid Target Count', 'Please enter a valid target count greater than 0.');
            return;
        }

        if (endDate && startDate > endDate) {
            showAlert('warning', 'Invalid Dates', 'End date must be after start date.');
            return;
        }

        const createHabitAction = () => {
            try {
                addHabit(
                    habitName,
                    description,
                    frequency,
                    targetNum,
                    selectedColor,
                    startDate.toISOString().split('T')[0],
                    endDate ? endDate.toISOString().split('T')[0] : undefined,
                    reminderEnabled ? reminderTime : undefined
                );
                router.back();
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
    counterTextContainer: {
        minWidth: 30,
        alignItems: 'center',
        justifyContent: 'center',
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
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 16,
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
});
