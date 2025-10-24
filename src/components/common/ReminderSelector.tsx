import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    Modal,
    Pressable,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface ReminderSelectorProps {
    enabled: boolean;
    selected: string;
    onToggle: (enabled: boolean) => void;
    onSelect: (value: string) => void;
}

const ReminderSelector: React.FC<ReminderSelectorProps> = ({
    enabled,
    selected,
    onToggle,
    onSelect,
}) => {
    const [showPicker, setShowPicker] = useState(false);

    const options = [
        "5 minutes before",
        "15 minutes before",
        "30 minutes before",
        "1 hour before",
        "1 day before",
    ];

    return (
        <View>
            <View style={styles.header}>
                <Text style={styles.label}>Reminder</Text>
                <Switch
                    value={enabled}
                    onValueChange={onToggle}
                    trackColor={{ false: "#ddd", true: "#fdba74" }}
                    thumbColor={enabled ? "#f97316" : "#fff"}
                />
            </View>

            {enabled && (
                <TouchableOpacity style={styles.dropdown} onPress={() => setShowPicker(true)}>
                    <Text style={styles.dropdownText}>{selected}</Text>
                    <Feather name="chevron-down" size={20} color="#555" />
                </TouchableOpacity>
            )}

            <Modal visible={showPicker} transparent animationType="fade">
                <Pressable style={styles.overlay} onPress={() => setShowPicker(false)}>
                    <View style={styles.modalContent}>
                        {options.map((opt) => (
                            <TouchableOpacity
                                key={opt}
                                style={[styles.option, opt === selected && styles.optionActive]}
                                onPress={() => {
                                    onSelect(opt);
                                    setShowPicker(false);
                                }}
                            >
                                <Text style={[styles.optionText, opt === selected && styles.optionTextActive]}>
                                    {opt}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
};

ReminderSelector.displayName = "ReminderSelector"; // ✅ fix ESLint warning

export default ReminderSelector;

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    label: { fontSize: 16, fontWeight: "600", color: "#374151" },
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
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.3)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: { backgroundColor: "#fff", borderRadius: 12, width: "80%", paddingVertical: 10 },
    option: { paddingVertical: 14, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: "#eee" },
    optionText: { fontSize: 16, color: "#111" },
    optionActive: { backgroundColor: "#f97316" },
    optionTextActive: { color: "#fff" },
});
