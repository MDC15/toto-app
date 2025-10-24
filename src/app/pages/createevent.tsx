import { addEvent } from "@/db/database";
import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from "expo-router";
import React, { useState } from "react";
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

export default function CreateEventScreen() {
    const router = useRouter();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [startTime, setStartTime] = useState(new Date());
    const [endTime, setEndTime] = useState(new Date());

    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showStartTimePicker, setShowStartTimePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    const [showEndTimePicker, setShowEndTimePicker] = useState(false);

    // Reset form when screen comes into focus
    useFocusEffect(
        React.useCallback(() => {
            setTitle("");
            setDescription("");
            setStartTime(new Date());
            setEndTime(new Date());
        }, [])
    );

    const handleAddEvent = async () => {
        Keyboard.dismiss();
        if (!title.trim()) {
            Alert.alert("Missing title", "Please enter an event title.");
            return;
        }

        try {
            await addEvent(title, startTime.toISOString(), endTime.toISOString(), description);
            router.back();
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Could not save the event.");
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

                <TouchableOpacity style={styles.addButton} onPress={handleAddEvent}>
                    <Text style={styles.addButtonText}>+ Add Event</Text>
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
    addButton: {
        backgroundColor: "#f97316",
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 20,
    },
    addButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});
