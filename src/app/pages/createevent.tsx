import AlertModal from "@/components/common/AlertModal";
import { UnifiedReminderSelector } from "@/components/common/UnifiedReminderSelector";
import ColorPick from '@/components/habits/ColorPick';
import { useEventReminders, useNotifications } from "@/contexts/NotificationContext";
import { addEvent } from "@/db/database";
import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from "react";
import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

export default function CreateEventScreen() {
    const navigation = useNavigation();

    // Form field states
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [startTime, setStartTime] = useState(new Date());
    const [endTime, setEndTime] = useState(new Date());
    const [reminderEnabled, setReminderEnabled] = useState(false);
    const [reminderTime, setReminderTime] = useState<string | null>(null);
    const [eventColor, setEventColor] = useState("#fed7aa");
    const [isCreatingEvent, setIsCreatingEvent] = useState(false);
    const { hasPermission } = useNotifications();
    const { setupEventReminder } = useEventReminders();

    // Track initial state for change detection
    const initialTitle = useRef("");
    const initialDescription = useRef("");
    const initialStartTime = useRef(new Date());
    const initialEndTime = useRef(new Date());
    const initialReminderEnabled = useRef(false);
    const initialReminderTime = useRef<string | null>(null);
    const initialEventColor = useRef("#fed7aa");

    // Diagnostic logging for reminder state
    React.useEffect(() => {
        console.log('CreateEvent: Reminder state - enabled:', reminderEnabled, 'time:', reminderTime);
    }, [reminderEnabled, reminderTime]);

    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showStartTimePicker, setShowStartTimePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    const [showEndTimePicker, setShowEndTimePicker] = useState(false);

    // Alert modal states
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertType, setAlertType] = useState<'warning' | 'success' | 'error' | 'info'>('warning');
    const [alertTitle, setAlertTitle] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
    const [onCancelAction, setOnCancelAction] = useState<(() => void) | null>(null);
    const [cancelText, setCancelText] = useState('Cancel');
    const [confirmText, setConfirmText] = useState('OK');

    // Reset form when screen comes into focus
    useFocusEffect(
        React.useCallback(() => {
            setTitle("");
            setDescription("");
            setStartTime(new Date());
            setEndTime(new Date());
            setReminderEnabled(false);
            setReminderTime(null);
            setEventColor("#fed7aa");
            setIsCreatingEvent(false);

            // Reset initial states to current default values
            initialTitle.current = "";
            initialDescription.current = "";
            initialStartTime.current = new Date();
            initialEndTime.current = new Date();
            initialReminderEnabled.current = false;
            initialReminderTime.current = null;
            initialEventColor.current = "#fed7aa";
        }, [])
    );

    // Handle hardware back button with change detection
    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', (e: any) => {
            // Don't show unsaved changes warning if event creation is in progress
            if (isCreatingEvent) {
                return;
            }

            // Check for changes across all form fields
            const hasTitleChanged = title.trim() !== initialTitle.current;
            const hasDescriptionChanged = description.trim() !== initialDescription.current;
            const hasStartTimeChanged = startTime.getTime() !== initialStartTime.current.getTime();
            const hasEndTimeChanged = endTime.getTime() !== initialEndTime.current.getTime();
            const hasReminderEnabledChanged = reminderEnabled !== initialReminderEnabled.current;
            const hasReminderTimeChanged = reminderTime !== initialReminderTime.current;
            const hasEventColorChanged = eventColor !== initialEventColor.current;

            const hasUnsavedChanges = hasTitleChanged || hasDescriptionChanged || hasStartTimeChanged ||
                hasEndTimeChanged || hasReminderEnabledChanged || hasReminderTimeChanged || hasEventColorChanged;

            if (!hasUnsavedChanges) {
                return;
            }

            e.preventDefault();

            showAlert('warning', 'Unsaved Changes', 'You have unsaved changes. Are you sure you want to go back?', () => {
                navigation.dispatch(e.data.action);
            });
        });

        return unsubscribe;
    }, [navigation, title, description, startTime, endTime, reminderEnabled, reminderTime, eventColor, isCreatingEvent]);

    // Helper function to show alert modal
    const showAlert = (
        type: 'warning' | 'success' | 'error' | 'info',
        title: string,
        message: string,
        action?: () => void,
        cancelAction?: () => void,
        cancelText: string = 'Cancel',
        confirmText: string = 'OK'
    ) => {
        setAlertType(type);
        setAlertTitle(title);
        setAlertMessage(message);
        setPendingAction(() => action || null);
        setOnCancelAction(() => cancelAction || null);
        setCancelText(cancelText);
        setConfirmText(confirmText);
        setAlertVisible(true);
    };

    const handleAddEvent = async () => {
        Keyboard.dismiss();

        // Set creating event state to prevent hardware back button conflicts
        setIsCreatingEvent(true);

        // Validation
        if (!title.trim()) {
            setIsCreatingEvent(false);
            showAlert('warning', 'Missing Title', 'Please enter an event title.');
            return;
        }

        try {
            // Convert reminder time to ISO string for database compatibility
            let reminderISO = undefined;
            let reminderMinutes: 1 | 5 | 30 = 5;
            if (reminderEnabled && reminderTime) {
                // Parse the string to get minutes
                const match = reminderTime.match(/(\d+)/);
                if (match) {
                    const minutes = parseInt(match[1]);
                    if (minutes === 1 || minutes === 5 || minutes === 30) {
                        reminderMinutes = minutes as 1 | 5 | 30;
                    }
                }
                const reminderDate = new Date(startTime);
                reminderDate.setMinutes(reminderDate.getMinutes() - reminderMinutes);
                reminderISO = reminderDate.toISOString();
            }

            const newEventId = await addEvent(title, startTime.toISOString(), endTime.toISOString(), description, reminderISO, eventColor);

            // Schedule reminder if enabled
            if (reminderEnabled && reminderTime && hasPermission) {
                await setupEventReminder(
                    newEventId,
                    title,
                    description,
                    startTime.toISOString(),
                    reminderMinutes
                );
            }

            // Update initial state to current state to prevent future unsaved changes warnings
            initialTitle.current = title;
            initialDescription.current = description;
            initialStartTime.current = new Date(startTime);
            initialEndTime.current = new Date(endTime);
            initialReminderEnabled.current = reminderEnabled;
            initialReminderTime.current = reminderTime;
            initialEventColor.current = eventColor;

            // Create a function to clear form and close modal
            const clearFormAndClose = () => {
                // Clear form fields after successful creation
                setTitle("");
                setDescription("");
                setStartTime(new Date());
                setEndTime(new Date());
                setReminderEnabled(false);
                setReminderTime(null);
                setEventColor("#fed7aa");
                setIsCreatingEvent(false);
                setAlertVisible(false);
            };

            // Show success alert with single OK button - clear form and close modal
            showAlert('success', 'Event Created', 'Event created successfully!', clearFormAndClose, clearFormAndClose, '', 'OK');
        } catch (error) {
            console.error('Error creating event:', error);
            setIsCreatingEvent(false);
            showAlert('error', 'Error', 'Could not save the event.');
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <ScrollView
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.section}>
                    <Text style={styles.label}>Event title</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="What is the event?"
                        value={title}
                        onChangeText={setTitle}
                        multiline
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Description (optional)</Text>
                    <TextInput
                        style={[styles.input, styles.descArea]}
                        placeholder="Add details about the event"
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        textAlignVertical="top"
                    />
                </View>

                <View style={styles.section}>
                    <ColorPick selectedColor={eventColor} onColorSelect={setEventColor} label="Event Color" />
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Start Time</Text>
                    <View style={styles.row}>
                        <TouchableOpacity
                            style={[styles.box, styles.rowCenter]}
                            onPress={() => setShowStartDatePicker(true)}
                        >
                            <Feather name="calendar" size={18} color="#6b7280" />
                            <Text style={styles.boxText}>{startTime.toDateString()}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.box, styles.rowCenter]}
                            onPress={() => setShowStartTimePicker(true)}
                        >
                            <Feather name="clock" size={18} color="#6b7280" />
                            <Text style={styles.boxText}>{startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {showStartDatePicker && (
                    <DateTimePicker
                        value={startTime}
                        mode="date"
                        display={Platform.OS === "ios" ? "spinner" : "default"}
                        onChange={(e, d) => {
                            setShowStartDatePicker(false);
                            if (d) setStartTime(d);
                        }}
                    />
                )}

                {showStartTimePicker && (
                    <DateTimePicker
                        value={startTime}
                        mode="time"
                        display={Platform.OS === "ios" ? "spinner" : "default"}
                        onChange={(e, d) => {
                            setShowStartTimePicker(false);
                            if (d) setStartTime(d);
                        }}
                    />
                )}

                <View style={styles.section}>
                    <Text style={styles.label}>End Time</Text>
                    <View style={styles.row}>
                        <TouchableOpacity
                            style={[styles.box, styles.rowCenter]}
                            onPress={() => setShowEndDatePicker(true)}
                        >
                            <Feather name="calendar" size={18} color="#6b7280" />
                            <Text style={styles.boxText}>{endTime.toDateString()}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.box, styles.rowCenter]}
                            onPress={() => setShowEndTimePicker(true)}
                        >
                            <Feather name="clock" size={18} color="#6b7280" />
                            <Text style={styles.boxText}>{endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {showEndDatePicker && (
                    <DateTimePicker
                        value={endTime}
                        mode="date"
                        display={Platform.OS === "ios" ? "spinner" : "default"}
                        onChange={(e, d) => {
                            setShowEndDatePicker(false);
                            if (d) setEndTime(d);
                        }}
                    />
                )}

                {showEndTimePicker && (
                    <DateTimePicker
                        value={endTime}
                        mode="time"
                        display={Platform.OS === "ios" ? "spinner" : "default"}
                        onChange={(e, d) => {
                            setShowEndTimePicker(false);
                            if (d) setEndTime(d);
                        }}
                    />
                )}

                <View style={styles.section}>
                    <UnifiedReminderSelector
                        type="event"
                        enabled={reminderEnabled}
                        onToggle={setReminderEnabled}
                        value={reminderTime as any} // Cast to string | null
                        onChange={(value: string | null) => setReminderTime(value as any)} // Handle string | null
                        mainTime={startTime.toISOString()}
                        disabled={!hasPermission || isCreatingEvent}
                    />
                </View>

                <TouchableOpacity style={styles.addButton} onPress={handleAddEvent}>
                    <Text style={styles.addButtonText}>Create Event</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Alert Modal */}
            <AlertModal
                visible={alertVisible}
                type={alertType}
                title={alertTitle}
                message={alertMessage}
                cancelText={cancelText}
                confirmText={confirmText}
                onConfirm={pendingAction || (() => setAlertVisible(false))}
                onCancel={onCancelAction || (() => setAlertVisible(false))}
                onClose={() => setAlertVisible(false)}
            />
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f9fafb" },
    content: { flexGrow: 1, padding: 20, paddingBottom: 40 },
    section: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    label: { fontSize: 14, fontWeight: "600", color: "#4b5563", marginBottom: 8 },
    input: {
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 8,
        paddingHorizontal: 12,
        fontSize: 15,
        color: "#1f2937",
        backgroundColor: "#f9fafb",
    },
    textArea: { minHeight: 48, maxHeight: 120, paddingVertical: 12, textAlignVertical: "top" },
    descArea: { minHeight: 100, maxHeight: 300, paddingVertical: 12 },
    row: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
    rowCenter: { flexDirection: "row", alignItems: "center", justifyContent: "center" },
    box: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 8,
        paddingVertical: 12,
        backgroundColor: "#f9fafb",
    },
    boxText: { marginLeft: 8, fontSize: 14, color: "#374151", fontWeight: "500" },
    addButton: {
        backgroundColor: "#f97316",
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 8,
        shadowColor: "#f97316",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    addButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
    colorRow: { flexDirection: "row", justifyContent: "space-between", flexWrap: "wrap", gap: 8 },
    colorOption: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: "transparent",
    },
    colorSelected: { borderColor: "#1f2937", borderWidth: 2, transform: [{ scale: 1.1 }] },
});

