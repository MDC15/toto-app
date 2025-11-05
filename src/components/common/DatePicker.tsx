import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface DatePickerProps {
    label: string;
    date: Date | null;
    onChange: (date: Date) => void;
    placeholder?: string;
}

export default function DatePicker(
    { label,
        date,
        onChange,
        placeholder = "Select date" }: DatePickerProps) {
    const [showPicker, setShowPicker] = useState(false);

    const formatDate = (d: Date) => {
        return d.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    return (
        <View style={styles.wrapper}>
            <Text style={styles.label}>{label}</Text>

            <TouchableOpacity style={styles.button} onPress={() => setShowPicker(true)}>
                <Text style={[styles.buttonText, !date && styles.placeholder]}>
                    {date ? formatDate(date) : placeholder}
                </Text>
            </TouchableOpacity>

            {showPicker && (
                <DateTimePicker
                    value={date || new Date()}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={(event, selected) => {
                        setShowPicker(false);
                        if (selected) onChange(selected);
                    }}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        marginBottom: 16,
    },
    label: {
        fontSize: 15,
        fontWeight: "600",
        color: "#444",
        marginBottom: 6,
    },
    button: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        padding: 12,
        backgroundColor: "#fff",
    },
    buttonText: {
        fontSize: 14,
        color: "#333",
    },
    placeholder: {
        color: "#999",
    },
});
