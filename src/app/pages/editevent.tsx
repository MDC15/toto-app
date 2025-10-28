import { getEvents, updateEvent } from "@/db/database";
import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Alert,
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
    const [eventColor, setEventColor] = useState("#f97316");

    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showStartTimePicker, setShowStartTimePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    const [showEndTimePicker, setShowEndTimePicker] = useState(false);

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
                    setEventColor(event.color || "#f97316");
                }
            } catch (error) {
                console.error("Error loading event:", error);
                Alert.alert("Error", "Could not load the event.");
            }
        };

        if (id) {
            loadEvent();
        }
    }, [id]);

    const handleUpdateEvent = async () => {
        Keyboard.dismiss();
        if (!title.trim()) {
            Alert.alert("Missing title", "Please enter an event title.");
            return;
        }

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
            Alert.alert("Error", "Could not update the event.");
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
                        "#f97316", // Orange
                        "#ef4444", // Red
                        "#10b981", // Green
                        "#3b82f6", // Blue
                        "#8b5cf6", // Purple
                        "#f59e0b", // Yellow
                        "#ec4899", // Pink
                        "#06b6d4", // Cyan
                        "#84cc16"  // Lime
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