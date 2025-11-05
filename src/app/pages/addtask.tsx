import AlertModal from "@/components/common/AlertModal";
import PrioritySelector from "@/components/tasks/PrioritySelector";
import { useTasks } from "@/contexts/TasksContext";
import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useNavigation } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function AddTaskScreen() {
    const navigation = useNavigation();
    const { addTask } = useTasks();
    const params = useLocalSearchParams();

    // 🧠 State quản lý
    const [title, setTitle] = useState(params.title as string || "");
    const [description, setDescription] = useState(params.description as string || "");
    const [deadline, setDeadline] = useState(new Date());
    const [priority, setPriority] = useState<"High" | "Medium" | "Low" | undefined>();
    const [reminderEnabled, setReminderEnabled] = useState(params.reminder === "true");
    const [reminderTime, setReminderTime] = useState("15 minutes before");
    const [isCreatingTask, setIsCreatingTask] = useState(false);

    // Track initial state for change detection
    const initialDeadline = useRef(new Date());
    const initialReminderEnabled = useRef(params.reminder === "true");
    const initialReminderTime = useRef("15 minutes before");
    const initialTitle = useRef(params.title as string || "");
    const initialDescription = useRef(params.description as string || "");
    const initialPriority = useRef<"High" | "Medium" | "Low" | undefined>(undefined);

    // ⏰ Picker states
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [showReminderPicker, setShowReminderPicker] = useState(false);

    // Alert modal states
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertType, setAlertType] = useState<'warning' | 'success' | 'error' | 'info'>('warning');
    const [alertTitle, setAlertTitle] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
    const [onCancelAction, setOnCancelAction] = useState<(() => void) | null>(null);
    const [cancelText, setCancelText] = useState('Cancel');
    const [confirmText, setConfirmText] = useState('OK');

    const descRef = useRef<TextInput>(null);

    // Handle hardware back button
    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', (e) => {
            // Don't show unsaved changes warning if task creation is in progress
            if (isCreatingTask) {
                return;
            }

            // Check for changes across all form fields
            const hasDeadlineChanged = deadline.getTime() !== initialDeadline.current.getTime();
            const hasReminderEnabledChanged = reminderEnabled !== initialReminderEnabled.current;
            const hasReminderTimeChanged = reminderTime !== initialReminderTime.current;
            const hasTitleChanged = title.trim() !== initialTitle.current;
            const hasDescriptionChanged = description.trim() !== initialDescription.current;
            const hasPriorityChanged = priority !== initialPriority.current;

            const hasUnsavedChanges = hasTitleChanged || hasDescriptionChanged || hasPriorityChanged ||
                hasDeadlineChanged || hasReminderEnabledChanged || hasReminderTimeChanged;

            if (!hasUnsavedChanges) {
                return;
            }

            e.preventDefault();

            showAlert('warning', 'Unsaved Changes', 'You have unsaved changes. Are you sure you want to go back?', () => {
                navigation.dispatch(e.data.action);
            });
        });

        return unsubscribe;
    }, [navigation, title, description, priority, deadline, reminderEnabled, reminderTime, isCreatingTask]);

    // ⏳ Reminder options
    const reminderOptions = [
        "1 minute before",
        "5 minutes before",
        "15 minutes before",
        "30 minutes before",
        "1 hour before",
        "1 day before",
    ];

    // 🕓 Format time
    const formatTime = (d: Date) => {
        let h = d.getHours();
        const m = d.getMinutes();
        const ampm = h >= 12 ? "PM" : "AM";
        h = h % 12 || 12;
        return `${h}:${m.toString().padStart(2, "0")} ${ampm}`;
    };

    const handleDateChange = (event: any, selectedDate?: Date) => {
        const currentDate = selectedDate || deadline;
        setShowDatePicker(Platform.OS === "ios");
        setDeadline(currentDate);
    };

    const handleTimeChange = (event: any, selectedTime?: Date) => {
        const currentTime = selectedTime || deadline;
        setShowTimePicker(Platform.OS === "ios");
        const newDeadline = new Date(deadline);
        newDeadline.setHours(currentTime.getHours());
        newDeadline.setMinutes(currentTime.getMinutes());
        setDeadline(newDeadline);
    };

    const formatDate = (d: Date) => {
        return d.toDateString();
    };

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

    // ✅ Add Task
    const handleAddTask = () => {
        Keyboard.dismiss();

        // Set creating task state to prevent hardware back button conflicts
        setIsCreatingTask(true);

        // Validation
        if (!title.trim()) {
            setIsCreatingTask(false);
            showAlert('warning', 'Missing Title', 'Please enter a task title.');
            return;
        }
        if (!priority) {
            setIsCreatingTask(false);
            showAlert('warning', 'Select Priority', 'Please choose a priority for your task.');
            return;
        }

        // Add task
        addTask({
            title,
            description,
            deadline: deadline.toISOString(),
            priority,
            date: undefined,
            due: undefined
        });

        // Update initial state to current state to prevent future unsaved changes warnings
        initialTitle.current = title;
        initialDescription.current = description;
        initialDeadline.current = new Date(deadline);
        initialPriority.current = priority;
        initialReminderEnabled.current = reminderEnabled;
        initialReminderTime.current = reminderTime;

        // Create a function to clear form and close modal
        const clearFormAndClose = () => {
            // Clear form fields after successful creation
            setTitle('');
            setDescription('');
            setPriority(undefined);
            setReminderEnabled(initialReminderEnabled.current);
            setReminderTime(initialReminderTime.current);
            setDeadline(new Date());
            setIsCreatingTask(false);
            setAlertVisible(false);
        };

        // Show success alert with single OK button - no navigation and clear form
        showAlert('success', 'Task Created', 'Task created successfully!', clearFormAndClose, clearFormAndClose, '', 'OK');
    };

    // Handle back button press

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
                {/* 📝 Title */}
                <Text style={styles.label}>Task title</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="What do you need to do?"
                    value={title}
                    onChangeText={setTitle}
                    multiline
                    returnKeyType="next"
                    onSubmitEditing={() => descRef.current?.focus()}
                />

                {/* 📄 Description */}
                <Text style={styles.label}>Description (optional)</Text>
                <TextInput
                    ref={descRef}
                    style={[styles.input, styles.descArea]}
                    placeholder="Add details about your task"
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    textAlignVertical="top"
                />

                {/* 📅 Date & Time */}
                <Text style={styles.label}>Date & Time</Text>
                <View style={styles.row}>
                    <TouchableOpacity
                        style={[styles.box, styles.rowCenter]}
                        onPress={() => setShowDatePicker(true)}
                    >
                        <Feather name="calendar" size={18} color="#333" />
                        <Text style={styles.boxText}>{formatDate(deadline)}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.box, styles.rowCenter]}
                        onPress={() => setShowTimePicker(true)}
                    >
                        <Feather name="clock" size={18} color="#333" />
                        <Text style={styles.boxText}>{formatTime(deadline)}</Text>
                    </TouchableOpacity>
                </View>

                {/* 📆 Date Picker */}
                {showDatePicker && (
                    <DateTimePicker
                        value={deadline}
                        mode="date"
                        display={Platform.OS === "ios" ? "spinner" : "default"}
                        onChange={handleDateChange}
                    />
                )}

                {/* ⏰ Time Picker */}
                {showTimePicker && (
                    <DateTimePicker
                        value={deadline}
                        mode="time"
                        is24Hour={false}
                        display={Platform.OS === "ios" ? "spinner" : "default"}
                        onChange={handleTimeChange}
                    />
                )}

                {/* 🔺 Priority */}
                <Text style={styles.label}>Priority</Text>
                <PrioritySelector value={priority} onChange={setPriority} />

                {/* 🔔 Reminder */}
                <View style={styles.reminderHeader}>
                    <Text style={styles.label}>Reminder</Text>
                    <Switch
                        value={reminderEnabled}
                        onValueChange={setReminderEnabled}
                        trackColor={{ false: "#ddd", true: "#fdba74" }}
                        thumbColor={reminderEnabled ? "#f97316" : "#fff"}
                    />
                </View>

                {reminderEnabled && (
                    <TouchableOpacity
                        style={styles.dropdown}
                        onPress={() => setShowReminderPicker(true)}
                    >
                        <Text style={styles.dropdownText}>{reminderTime}</Text>
                        <Feather name="chevron-down" size={20} color="#555" />
                    </TouchableOpacity>
                )}

                {/* ➕ Add Button */}
                <TouchableOpacity style={styles.addButton} onPress={handleAddTask}>
                    <Text style={styles.addButtonText}>+ Add Task</Text>
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

            {/* 🪄 Reminder Modal */}
            <Modal
                visible={showReminderPicker}
                transparent
                animationType="fade"
                onRequestClose={() => setShowReminderPicker(false)}
            >
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setShowReminderPicker(false)}
                >
                    <View style={styles.modalContent}>
                        {reminderOptions.map((opt) => (
                            <TouchableOpacity
                                key={opt}
                                style={[
                                    styles.modalOption,
                                    opt === reminderTime && styles.modalOptionActive,
                                ]}
                                onPress={() => {
                                    setReminderTime(opt);
                                    setShowReminderPicker(false);
                                }}
                            >
                                <Text
                                    style={[
                                        styles.modalOptionText,
                                        opt === reminderTime && styles.modalOptionTextActive,
                                    ]}
                                >
                                    {opt}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Pressable>
            </Modal>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    content: { flexGrow: 1, padding: 20, paddingBottom: 40 },
    label: { fontSize: 16, fontWeight: "600", color: "#374151", marginBottom: 6, paddingTop: 10 },
    input: {
        borderWidth: 1,
        borderColor: "#d1d5db",
        borderRadius: 10,
        paddingHorizontal: 15,
        fontSize: 15,
        color: "#111",
        marginBottom: 18,
    },
    textArea: { minHeight: 48, maxHeight: 120, paddingVertical: 12, textAlignVertical: "top" },
    descArea: { minHeight: 100, maxHeight: 300, paddingVertical: 12 },
    row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 18 },
    rowCenter: { flexDirection: "row", alignItems: "center", justifyContent: "center" },
    box: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#d1d5db",
        borderRadius: 10,
        paddingVertical: 12,
        marginRight: 10,
    },
    boxText: { marginLeft: 8, fontSize: 15, color: "#111" },
    reminderHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    dropdown: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderWidth: 1,
        borderColor: "#d1d5db",
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 12,
        marginBottom: 25,
    },
    dropdownText: { fontSize: 15, color: "#111" },
    addButton: {
        backgroundColor: "#f97316",
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: "center",
    },
    addButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.3)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: { backgroundColor: "#fff", borderRadius: 12, width: "80%", paddingVertical: 10 },
    modalOption: {
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    modalOptionText: { fontSize: 16, color: "#111" },
    modalOptionActive: { backgroundColor: "#f97316" },
    modalOptionTextActive: { color: "#fff" },
});
