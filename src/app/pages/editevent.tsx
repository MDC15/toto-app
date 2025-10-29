import { getEvents, updateEvent } from "@/db/database";
import AlertModal from "@/components/common/AlertModal";
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
import ReminderSelector from "@/components/common/ReminderSelector";

export default function EditEventScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [startTime, setStartTime] = useState(new Date());
    const [endTime, setEndTime] = useState(new Date());
    const [reminderEnabled, setReminderEnabled] = useState(false);
    const [reminderTime, setReminderTime] = useState("5 minutes before");
    const [eventColor, setEventColor] = useState("#fed7aa");

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
                    setReminderTime(event.reminder || "5 minutes before");
                    setEventColor(event.color || "#fed7aa");
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
                await updateEvent(
                    parseInt(id as string),
                    title,
                    startTime.toISOString(),
                    endTime.toISOString(),
                    description,
                    false, // completed
                    reminderEnabled ? reminderTime : undefined,
                    eventColor
                );
                router.back();
            } catch (error) {
                console.error(error);
                showAlert('error', 'Error', 'Could not update the event.');
            }
        };

        showAlert('success', 'Update Event', 'Are you sure you want to update this event?', updateEventAction);
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
                <Text style={styles.label}>Event title</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="What is the event?"
                    value={title}
                    onChangeText={setTitle}
                    multiline
                />

                <Text style={styles.label}>Description (optional)</Text>
                <TextInput
                    style={[styles.input, styles.descArea]}
                    placeholder="Add details about the event"
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    textAlignVertical="top"
                />

                <ReminderSelector
                    enabled={reminderEnabled}
                    selected={reminderTime}
                    onToggle={setReminderEnabled}
                    onSelect={setReminderTime}
                />

                <Text style={styles.label}>Event Color</Text>
                <View style={styles.colorRow}>
                    {[
                        "#fed7aa", // Light Orange
                        "#fecaca", // Light Red
                        "#d1fae5", // Light Green
                        "#dbeafe", // Light Blue
                        "#e9d5ff", // Light Purple
                        "#fef3c7", // Light Yellow
                        "#fce7f3", // Light Pink
                        "#cffafe", // Light Cyan
                        "#ecfccb"  // Light Lime
                    ].map((color, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[styles.colorOption, { backgroundColor: color }, eventColor === color && styles.colorSelected]}
                            onPress={() => setEventColor(color)}
                        />
                    ))}
                </View>

                <Text style={styles.label}>Start Time</Text>
                <View style={styles.row}>
                    <TouchableOpacity
                        style={[styles.box, styles.rowCenter]}
                        onPress={() => setShowStartDatePicker(true)}
                    >
                        <Feather name="calendar" size={18} color="#333" />
                        <Text style={styles.boxText}>{startTime.toDateString()}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.box, styles.rowCenter]}
                        onPress={() => setShowStartTimePicker(true)}
                    >
                        <Feather name="clock" size={18} color="#333" />
                        <Text style={styles.boxText}>{startTime.toLocaleTimeString()}</Text>
                    </TouchableOpacity>
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

                <Text style={styles.label}>End Time</Text>
                <View style={styles.row}>
                    <TouchableOpacity
                        style={[styles.box, styles.rowCenter]}
                        onPress={() => setShowEndDatePicker(true)}
                    >
                        <Feather name="calendar" size={18} color="#333" />
                        <Text style={styles.boxText}>{endTime.toDateString()}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.box, styles.rowCenter]}
                        onPress={() => setShowEndTimePicker(true)}
                    >
                        <Feather name="clock" size={18} color="#333" />
                        <Text style={styles.boxText}>{endTime.toLocaleTimeString()}</Text>
                    </TouchableOpacity>
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

                <TouchableOpacity style={styles.updateButton} onPress={handleUpdateEvent}>
                    <Text style={styles.updateButtonText}>Update Event</Text>
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
    updateButton: {
        backgroundColor: "#f97316",
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 20,
    },
    updateButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
    colorRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap" },
    colorOption: {
        width: 35,
        height: 35,
        borderRadius: 17.5,
        borderWidth: 2,
        borderColor: "#d1d5db",
        marginHorizontal: 2,
    },
    colorSelected: { borderColor: "#000", borderWidth: 3 },
});