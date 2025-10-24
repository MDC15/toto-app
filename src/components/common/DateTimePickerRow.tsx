import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface DateTimePickerRowProps {
    date: string;
    time: string;
    onChangeDate: (date: string) => void;
    onChangeTime: (time: string) => void;
}

const DateTimePickerRow: React.FC<DateTimePickerRowProps> = ({
    date,
    time,
    onChangeDate,
    onChangeTime,
}) => {
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    const formatTime = (d: Date) => {
        let h = d.getHours();
        const m = d.getMinutes();
        const ampm = h >= 12 ? "PM" : "AM";
        h = h % 12 || 12;
        return `${h}:${m.toString().padStart(2, "0")} ${ampm}`;
    };

    return (
        <View style={styles.wrapper}>
            <Text style={styles.label}>Date & Time</Text>
            <View style={styles.row}>
                <TouchableOpacity style={[styles.box, styles.rowCenter]} onPress={() => setShowDatePicker(true)}>
                    <Feather name="calendar" size={18} color="#333" />
                    <Text style={styles.boxText}>{date}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.box, styles.rowCenter]} onPress={() => setShowTimePicker(true)}>
                    <Feather name="clock" size={18} color="#333" />
                    <Text style={styles.boxText}>{time}</Text>
                </TouchableOpacity>
            </View>

            {showDatePicker && (
                <DateTimePicker
                    value={new Date()}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={(e, selected) => {
                        setShowDatePicker(false);
                        if (selected) onChangeDate(selected.toDateString());
                    }}
                />
            )}

            {showTimePicker && (
                <DateTimePicker
                    value={new Date()}
                    mode="time"
                    is24Hour={false}
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={(e, selected) => {
                        setShowTimePicker(false);
                        if (selected) onChangeTime(formatTime(selected));
                    }}
                />
            )}
        </View>
    );
};

DateTimePickerRow.displayName = "DateTimePickerRow"; // ✅ fix warning

export default DateTimePickerRow;

const styles = StyleSheet.create({
    wrapper: { marginBottom: 18 },
    label: { fontSize: 16, fontWeight: "600", color: "#374151", marginBottom: 6 },
    row: { flexDirection: "row", justifyContent: "space-between" },
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
});
