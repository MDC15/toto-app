import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
    Modal,
    Pressable,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type ReminderSelectorProps = {
    enabled: boolean;
    selected: string;
    onToggle: (enabled: boolean) => void;
    onSelect: (value: string) => void;
};

export default function ReminderSelector({
    enabled,
    selected,
    onToggle,
    onSelect,
}: ReminderSelectorProps) {
    const [showPicker, setShowPicker] = useState(false);

    // Diagnostic logging
    useEffect(() => {
        console.log(
            "ReminderSelector updated → enabled:",
            enabled,
            "| selected:",
            selected
        );
    }, [enabled, selected]);

    const options = [
        "5 minutes before",
        "15 minutes before",
        "30 minutes before",
        "1 hour before",
        "1 day before",
    ];

    const handleToggle = (value: boolean) => {
        console.log("Switch toggled →", value);
        onToggle(value);
    };

    const handleSelect = (opt: string) => {
        console.log("Option selected →", opt);
        onSelect(opt);
        setShowPicker(false);
    };

    return (
        <View>
            <View style={styles.header}>
                <Text style={styles.label}>Reminder</Text>
                <Switch
                    value={enabled}
                    onValueChange={handleToggle}
                    trackColor={{ false: "#ddd", true: "#fdba74" }}
                    thumbColor={enabled ? "#f97316" : "#fff"}
                />
            </View>

            {enabled && (
                <TouchableOpacity
                    style={styles.dropdown}
                    onPress={() => setShowPicker(true)}
                >
                    <Text style={styles.dropdownText}>{selected}</Text>
                    <Feather name="chevron-down" size={20} color="#555" />
                </TouchableOpacity>
            )}

            <Modal visible={showPicker} transparent animationType="fade">
                <Pressable
                    style={styles.overlay}
                    onPress={() => setShowPicker(false)}
                >
                    <View style={styles.modalContent}>
                        {options.map((opt) => {
                            const isActive = opt === selected;
                            return (
                                <TouchableOpacity
                                    key={opt}
                                    style={[
                                        styles.option,
                                        isActive && styles.optionActive,
                                    ]}
                                    onPress={() => handleSelect(opt)}
                                >
                                    <Text
                                        style={[
                                            styles.optionText,
                                            isActive && styles.optionTextActive,
                                        ]}
                                    >
                                        {opt}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    label: {
        fontSize: 16,
        fontWeight: "600",
        color: "#374151",
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
    dropdownText: {
        fontSize: 15,
        color: "#111",
    },
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.3)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        backgroundColor: "#fff",
        borderRadius: 12,
        width: "80%",
        paddingVertical: 10,
    },
    option: {
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    optionText: {
        fontSize: 16,
        color: "#111",
    },
    optionActive: {
        backgroundColor: "#f97316",
    },
    optionTextActive: {
        color: "#fff",
        fontWeight: "600",
    },
});
