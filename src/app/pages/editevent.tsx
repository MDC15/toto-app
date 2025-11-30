import AlertModal from "@/components/common/AlertModal";
import { UnifiedReminderSelector } from "@/components/common/UnifiedReminderSelector";

import { useEventReminders, useNotifications } from "@/contexts/NotificationContext";
import { getEvents, updateEvent } from "@/db/database";
import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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

export default function EditEventScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [startTime, setStartTime] = useState(new Date());
    const [endTime, setEndTime] = useState(new Date());
    const [reminderEnabled, setReminderEnabled] = useState(false);
    const [reminderTime, setReminderTime] = useState<string | null>(null);
    const { hasPermission } = useNotifications();
    const { setupEventReminder, cancelEventReminder } = useEventReminders();

    // Diagnostic logging for reminder state
    React.useEffect(() => {
        console.log('EditEvent: Reminder state - enabled:', reminderEnabled, 'time:', reminderTime);
    }, [reminderEnabled, reminderTime]);
    const eventColor = "#f97316"; // Orange color theme

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

    // Helper function to show alert modal
    const showAlert = (type: 'warning' | 'success' | 'error' | 'info', title: string, message: string, action?: () => void) => {
        setAlertType(type);
        setAlertTitle(title);
        setAlertMessage(message);
        setPendingAction(() => action || null);
        setAlertVisible(true);
    };

    useEffect(() => {
        const loadEvent = async () => {
            try {
                const events = await getEvents();
                const event = events.find((e: any) => e.id === parseInt(id as string));
                if (event) {
                    setTitle(event.title);
                    setDescription(event.description || "");
                    setStartTime(new Date(event.start_time));
                    setEndTime(new Date(event.end_time));
                    setReminderEnabled(!!event.reminder);
                    setReminderTime(event.reminder || null);
                }
            } catch (error) {
                console.error("Error loading event:", error);
                showAlert('error', 'Error', 'Could not load the event.');
            }
        };

        if (id) {
            loadEvent();
        }
    }, [id]);

    const handleUpdateEvent = async () => {
        Keyboard.dismiss();

        // Validation
        if (!title.trim()) {
            showAlert('warning', 'Missing Title', 'Please enter an event title.');
            return;
        }

        // Success action
        const updateEventAction = async () => {
            try {
                // Update the event
                await updateEvent(
                    parseInt(id as string),
                    title,
                    startTime.toISOString(),
                    endTime.toISOString(),
                    description,
                    false, // completed
                    reminderEnabled && reminderTime ? reminderTime : undefined,
                    eventColor
                );

                // Handle notifications
                try {
                    if (hasPermission) {
                        // Cancel existing notification
                        await cancelEventReminder(parseInt(id as string));

                        // Schedule new reminder if enabled
                        if (reminderEnabled && reminderTime) {
                            // Convert reminder time to new API format (only supports 1, 5, 30 minutes)
                            let reminderTimeMinutes: 1 | 5 | 30 = 5; // Default

                            if (reminderTime.includes("1 minute")) reminderTimeMinutes = 1;
                            else if (reminderTime.includes("15 minutes")) reminderTimeMinutes = 5; // Fallback to 5
                            else if (reminderTime.includes("30 minutes")) reminderTimeMinutes = 30;
                            else if (reminderTime.includes("1 hour")) reminderTimeMinutes = 30; // Fallback to 30
                            else if (reminderTime.includes("2 hours")) reminderTimeMinutes = 30; // Fallback to 30

                            await setupEventReminder(
                                parseInt(id as string),
                                title,
                                description,
                                startTime.toISOString(),
                                reminderTimeMinutes
                            );
                        }
                    }
                } catch (notificationError) {
                    console.error('Error handling event notifications:', notificationError);
                }

                router.back();
            } catch (error) {
                console.error(error);
                showAlert('error', 'Error', 'Could not update the event.');
            }
        };

        showAlert('success', 'Update Event', 'Are you sure you want to update this event?', updateEventAction);
    };

    const formatDateRange = () => {
        const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
        const startDate = startTime.toLocaleDateString('en-US', options);
        const endDate = endTime.toLocaleDateString('en-US', options);
        return startDate === endDate ? startDate : `${startDate} - ${endDate}`;
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
                {/* Header Section with Orange Accent */}
                <View style={[styles.header, styles.headerOrange]}>
                    <View style={styles.headerContent}>
                        <Text style={styles.headerLabel}>Edit Event</Text>
                        <Text style={styles.headerTitle} numberOfLines={2}>{title || 'Untitled Event'}</Text>
                        <Text style={styles.headerSubtitle}>{formatDateRange()}</Text>
                    </View>
                </View>

                {/* Event Title Section */}
                <View style={styles.section}>
                    <View style={styles.inputGroup}>
                        <View style={styles.iconLabel}>
                            <Feather name="edit-3" size={18} color={eventColor} />
                            <Text style={styles.label}>Event Title</Text>
                        </View>
                        <TextInput
                            style={[styles.input, styles.titleInput]}
                            placeholder="What is the event?"
                            placeholderTextColor="#9ca3af"
                            value={title}
                            onChangeText={setTitle}
                            multiline
                        />
                    </View>
                </View>

                {/* Description Section */}
                <View style={styles.section}>
                    <View style={styles.inputGroup}>
                        <View style={styles.iconLabel}>
                            <Feather name="align-left" size={18} color={eventColor} />
                            <Text style={styles.label}>Description</Text>
                        </View>
                        <TextInput
                            style={[styles.input, styles.descArea]}
                            placeholder="Add details about the event"
                            placeholderTextColor="#9ca3af"
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            textAlignVertical="top"
                        />
                    </View>
                </View>

                {/* Date & Time Section - Google Calendar Style */}
                <View style={styles.section}>
                    <View style={styles.inputGroup}>
                        <View style={styles.iconLabel}>
                            <Feather name="calendar" size={18} color={eventColor} />
                            <Text style={styles.label}>Date & Time</Text>
                        </View>

                        {/* Start Date/Time */}
                        <View style={styles.dateTimeContainer}>
                            <Text style={styles.dateTimeLabel}>Starts</Text>
                            <View style={styles.dateTimeRow}>
                                <TouchableOpacity
                                    style={styles.dateTimeBox}
                                    onPress={() => setShowStartDatePicker(true)}
                                >
                                    <Feather name="calendar" size={16} color={eventColor} />
                                    <Text style={styles.dateTimeText}>{startTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.dateTimeBox}
                                    onPress={() => setShowStartTimePicker(true)}
                                >
                                    <Feather name="clock" size={16} color={eventColor} />
                                    <Text style={styles.dateTimeText}>{startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Divider */}
                        <View style={styles.timelineDivider} />

                        {/* End Date/Time */}
                        <View style={styles.dateTimeContainer}>
                            <Text style={styles.dateTimeLabel}>Ends</Text>
                            <View style={styles.dateTimeRow}>
                                <TouchableOpacity
                                    style={styles.dateTimeBox}
                                    onPress={() => setShowEndDatePicker(true)}
                                >
                                    <Feather name="calendar" size={16} color={eventColor} />
                                    <Text style={styles.dateTimeText}>{endTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.dateTimeBox}
                                    onPress={() => setShowEndTimePicker(true)}
                                >
                                    <Feather name="clock" size={16} color={eventColor} />
                                    <Text style={styles.dateTimeText}>{endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
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

                {/* Reminder Section */}
                <View style={styles.section}>
                    <View style={styles.inputGroup}>
                        <View style={styles.iconLabel}>
                            <Feather name="bell" size={18} color={eventColor} />
                            <Text style={styles.label}>Notification</Text>
                        </View>
                        <UnifiedReminderSelector
                            type="event"
                            enabled={reminderEnabled}
                            onToggle={setReminderEnabled}
                            value={reminderTime}
                            onChange={setReminderTime}
                            mainTime={startTime.toISOString()}
                            disabled={!hasPermission}
                        />
                    </View>
                </View>

                {/* Save Button */}
                <TouchableOpacity style={[styles.updateButton, styles.updateButtonOrange]} onPress={handleUpdateEvent}>
                    <Feather name="check" size={20} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.updateButtonText}>Save Changes</Text>
                </TouchableOpacity>

                <View style={styles.bottomSpacer} />
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

const ORANGE_COLOR = "#f97316";
const ORANGE_LIGHT = "#fed7aa";

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f5f5f5" },
    content: { flexGrow: 1, paddingBottom: 40 },

    // Header section - Orange theme
    header: {
        paddingTop: 16,
        paddingHorizontal: 20,
        paddingBottom: 24,
        borderRadius: 0,
    },
    headerOrange: {
        backgroundColor: ORANGE_COLOR,
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
    },
    headerContent: {
        paddingRight: 12,
    },
    headerLabel: { fontSize: 11, fontWeight: "700", color: "rgba(255, 255, 255, 0.7)", textTransform: "uppercase", letterSpacing: 1 },
    headerTitle: { fontSize: 28, fontWeight: "800", color: "#fff", marginTop: 12, lineHeight: 36, letterSpacing: -0.5 },
    headerSubtitle: { fontSize: 13, color: "rgba(255, 255, 255, 0.85)", marginTop: 6, fontWeight: "600" },

    // Form sections
    section: {
        backgroundColor: "#fff",
        borderRadius: 14,
        padding: 18,
        marginHorizontal: 16,
        marginBottom: 14,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
        borderWidth: 0.5,
        borderColor: "rgba(0, 0, 0, 0.04)",
    },

    inputGroup: {
        gap: 12,
    },

    iconLabel: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },

    label: { fontSize: 16, fontWeight: "700", color: "#111827", letterSpacing: -0.3 },

    input: {
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 15,
        color: "#1f2937",
        backgroundColor: "#f9fafb",
    },

    titleInput: { minHeight: 48, paddingVertical: 12 },
    descArea: { minHeight: 100, maxHeight: 200, paddingVertical: 12, textAlignVertical: "top" },

    // Date/Time styling - Google Calendar style
    dateTimeContainer: {
        marginVertical: 8,
    },

    dateTimeLabel: {
        fontSize: 13,
        fontWeight: "500",
        color: "#6b7280",
        marginBottom: 8,
        textTransform: "uppercase",
        letterSpacing: 0.3,
    },

    dateTimeRow: {
        flexDirection: "row",
        gap: 10,
    },

    dateTimeBox: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: "#f9fafb",
    },

    dateTimeText: {
        fontSize: 14,
        fontWeight: "500",
        color: "#374151",
        flex: 1,
    },

    timelineDivider: {
        height: 1,
        backgroundColor: "#e5e7eb",
        marginVertical: 12,
        marginLeft: 0,
    },

    updateButton: {
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 16,
        flexDirection: "row",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 3,
    },
    updateButtonOrange: {
        backgroundColor: ORANGE_COLOR,
    },

    updateButtonText: { color: "#fff", fontSize: 16, fontWeight: "700", letterSpacing: 0.3 },

    bottomSpacer: { height: 24 },
});