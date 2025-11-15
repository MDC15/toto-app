import AlertModal from "@/components/common/AlertModal";
import PrioritySelector from "@/components/tasks/PrioritySelector";
import { UnifiedReminderSelector } from "@/components/common/UnifiedReminderSelector";
import { NotificationPermission } from "@/components/common/NotificationPermission";
import { useTasks } from "@/contexts/TasksContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useNavigation } from "expo-router";
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
    const [reminderEnabled, setReminderEnabled] = useState(false);
    const [reminderTime, setReminderTime] = useState<string | null>(null);
    const [isCreatingTask, setIsCreatingTask] = useState(false);
    const { hasPermission, scheduleTaskNotification } = useNotifications();

    // Track initial state for change detection
    const initialDeadline = useRef(new Date());
    const initialReminderTime = useRef<string | null>(null);
    const initialReminderEnabled = useRef(false);
    const initialTitle = useRef(params.title as string || "");
    const initialDescription = useRef(params.description as string || "");
    const initialPriority = useRef<"High" | "Medium" | "Low" | undefined>(undefined);

    // ⏰ Picker states
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

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
            const hasReminderTimeChanged = reminderTime !== initialReminderTime.current;
            const hasReminderEnabledChanged = reminderEnabled !== initialReminderEnabled.current;
            const hasTitleChanged = title.trim() !== initialTitle.current;
            const hasDescriptionChanged = description.trim() !== initialDescription.current;
            const hasPriorityChanged = priority !== initialPriority.current;

            const hasUnsavedChanges = hasTitleChanged || hasDescriptionChanged || hasPriorityChanged ||
                hasDeadlineChanged || hasReminderTimeChanged || hasReminderEnabledChanged;

            if (!hasUnsavedChanges) {
                return;
            }

            e.preventDefault();

            showAlert('warning', 'Unsaved Changes', 'You have unsaved changes. Are you sure you want to go back?', () => {
                navigation.dispatch(e.data.action);
            });
        });

        return unsubscribe;
    }, [navigation, title, description, priority, deadline, reminderTime, reminderEnabled, isCreatingTask]);

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

        // Add task with reminder only if enabled and has time
        const reminder = reminderEnabled && reminderTime ? reminderTime : null;

        addTask({
            title,
            description,
            deadline: deadline.toISOString(),
            priority,
            date: undefined,
            due: undefined,
            reminder: reminder || undefined
        });

        // Schedule notification if reminder is set and user has permission
        const scheduleNotification = async () => {
            if (reminder && hasPermission) {
                try {
                    // Get the task ID from the addTask result (assuming it returns the new task)
                    const newTaskId = Date.now(); // Temporary ID - in real app this would come from addTask

                    await scheduleTaskNotification(
                        newTaskId,
                        title,
                        description,
                        deadline.toISOString()
                    );

                    console.log('✅ Task notification scheduled successfully');
                } catch (error) {
                    console.error('❌ Failed to schedule task notification:', error);
                }
            }
        };

        // Update initial state to current state to prevent future unsaved changes warnings
        initialTitle.current = title;
        initialDescription.current = description;
        initialDeadline.current = new Date(deadline);
        initialPriority.current = priority;
        initialReminderEnabled.current = reminderEnabled;
        initialReminderTime.current = reminderTime;

        // Schedule notification
        scheduleNotification();

        // Create a function to clear form and close modal
        const clearFormAndClose = () => {
            // Clear form fields after successful creation
            setTitle('');
            setDescription('');
            setPriority(undefined);
            setReminderEnabled(false);
            setReminderTime(null);
            setDeadline(new Date());
            setIsCreatingTask(false);
            setAlertVisible(false);
        };

        // Create success message
        const successMessage = reminder && hasPermission
            ? 'Task created successfully! Reminder notification scheduled.'
            : 'Task created successfully!';

        // Show success alert with single OK button - no navigation and clear form
        showAlert('success', 'Task Created', successMessage, clearFormAndClose, clearFormAndClose, '', 'OK');
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
                {/* Notification Permission */}
                <NotificationPermission showFullScreen={false} />

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

                {/* 🔔 Unified Reminder Selector */}
                <UnifiedReminderSelector
                    type="task"
                    enabled={reminderEnabled}
                    onToggle={setReminderEnabled}
                    value={reminderTime}
                    onChange={setReminderTime}
                    mainTime={deadline.toISOString()}
                    disabled={!hasPermission || isCreatingTask}
                />

                {/* ➕ Add Button */}
                <TouchableOpacity
                    style={[styles.addButton, isCreatingTask && styles.addButtonDisabled]}
                    onPress={handleAddTask}
                    disabled={isCreatingTask}
                >
                    <Text style={styles.addButtonText}>
                        {isCreatingTask ? 'Creating...' : '+ Add Task'}
                    </Text>
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
    addButton: {
        backgroundColor: "#f97316",
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 20,
    },
    addButtonDisabled: {
        opacity: 0.6,
    },
    addButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});
