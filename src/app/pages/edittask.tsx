import AlertModal from "@/components/common/AlertModal";
import { UnifiedReminderSelector } from "@/components/common/UnifiedReminderSelector";
import PrioritySelector from "@/components/tasks/PrioritySelector";
import { useNotifications } from "@/contexts/NotificationContext";
import { useTasks } from "@/contexts/TasksContext";
import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
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

export default function EditTaskScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { getTaskById, updateTask } = useTasks();

    const idParam = params.id ? Number(params.id) : undefined;
    const taskFromContext = idParam ? getTaskById(idParam) : undefined;

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [deadline, setDeadline] = useState(new Date());
    const [priority, setPriority] = useState<"High" | "Medium" | "Low">(
        "Medium"
    );
    const [reminderEnabled, setReminderEnabled] = useState(false);
    const [reminderTime, setReminderTime] = useState<string | null>(null);
    const { hasPermission, scheduleTaskNotification, cancelTaskNotification } = useNotifications();

    // Alert modal states
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertType, setAlertType] = useState<'warning' | 'success' | 'error' | 'info'>('warning');
    const [alertTitle, setAlertTitle] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

    useEffect(() => {
        const task = taskFromContext;
        if (task) {
            setTitle(task.title);
            setDescription(task.description || "");
            if (task.date && task.due) {
                setDeadline(new Date(`${task.date} ${task.due}`));
            } else {
                setDeadline(new Date());
            }
            setPriority(task.priority);

            // Load reminder data
            if (task.reminder) {
                setReminderEnabled(true);
                setReminderTime(task.reminder);
            } else {
                setReminderEnabled(false);
                setReminderTime(null);
            }
        }
    }, [taskFromContext]);

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    const descRef = useRef<TextInput>(null);

    // Helper function to show alert modal
    const showAlert = (type: 'warning' | 'success' | 'error' | 'info', title: string, message: string, action?: () => void) => {
        setAlertType(type);
        setAlertTitle(title);
        setAlertMessage(message);
        setPendingAction(() => action || null);
        setAlertVisible(true);
    };

    const formatTime = (d: Date) => {
        let h = d.getHours();
        const m = d.getMinutes();
        const ampm = h >= 12 ? "PM" : "AM";
        h = h % 12 || 12;
        return `${h}:${m.toString().padStart(2, "0")} ${ampm}`;
    };

    const handleSaveTask = () => {
        Keyboard.dismiss();

        // Validation
        if (!title.trim()) {
            showAlert('warning', 'Missing Title', 'Please enter a task title.');
            return;
        }
        if (!priority) {
            showAlert('warning', 'Select Priority', 'Please choose a priority for your task.');
            return;
        }

        // Success action
        const saveTask = async () => {
            if (idParam) {
                // Update the task
                updateTask(idParam, {
                    title,
                    description,
                    due: deadline.toISOString(),
                    priority,
                    reminder: reminderEnabled && reminderTime ? reminderTime : undefined,
                });

                // Handle notifications
                try {
                    if (hasPermission) {
                        // Cancel existing notification
                        await cancelTaskNotification(idParam);

                        // Schedule new notification if reminder is enabled
                        if (reminderEnabled && reminderTime) {
                            await scheduleTaskNotification(
                                idParam,
                                title,
                                description,
                                deadline.toISOString()
                            );
                        }
                    }
                } catch (error) {
                    console.error('Error handling task notifications:', error);
                }
            }
            router.back();
        };

        showAlert('success', 'Save Task', 'Are you sure you want to save these changes?', saveTask);
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
                {/* Basic Info Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Task Details</Text>

                    <Text style={styles.label}>Title</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="What do you need to do?"
                        value={title}
                        onChangeText={setTitle}
                        multiline
                        returnKeyType="next"
                        onSubmitEditing={() => descRef.current?.focus()}
                    />

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
                </View>

                {/* Schedule Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Schedule</Text>

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

                    {showTimePicker && (
                        <DateTimePicker
                            value={deadline}
                            mode="time"
                            is24Hour={false}
                            display={Platform.OS === "ios" ? "spinner" : "default"}
                            onChange={handleTimeChange}
                        />
                    )}
                </View>

                {/* Settings Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Settings</Text>

                    <Text style={styles.label}>Priority</Text>
                    <PrioritySelector value={priority} onChange={setPriority} />
                </View>

                {/* Reminders Section */}
                <View style={styles.section}>
                    <UnifiedReminderSelector
                        type="task"
                        enabled={reminderEnabled}
                        onToggle={setReminderEnabled}
                        value={reminderTime}
                        onChange={setReminderTime}
                        mainTime={deadline.toISOString()}
                        disabled={!hasPermission}
                    />
                </View>

                {/* Save Button */}
                <TouchableOpacity style={[styles.addButton, { flexDirection: 'row', justifyContent: 'center' }]} onPress={handleSaveTask}>
                    <Feather name="check" size={20} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.addButtonText}>Save Changes</Text>
                </TouchableOpacity>
            </ScrollView>

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
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    content: { flexGrow: 1, padding: 20, paddingBottom: 40 },

    // Form sections
    section: {
        marginBottom: 20,
        padding: 16,
        backgroundColor: "#f9fafb",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#e5e7eb",
    },
    sectionTitle: { fontSize: 14, fontWeight: "700", color: "#1f2937", marginBottom: 14, textTransform: "uppercase", letterSpacing: 0.5 },

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
        marginTop: 16,
    },
    addButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});
