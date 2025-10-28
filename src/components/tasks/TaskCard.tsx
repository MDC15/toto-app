import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface TaskCardProps {
    title: string;
    description?: string;
    due?: string;
    priority: "High" | "Medium" | "Low";
    completed: boolean;
    onEdit: () => void;
    onDelete: () => void;
    onToggleComplete: () => void;
}

const priorityColors = {
    High: "#ef4444",
    Medium: "#f97316",
    Low: "#3b82f6",
};

export default function TaskCard({
    title,
    description,
    due,
    priority,
    completed,
    onEdit,
    onDelete,
    onToggleComplete,
}: TaskCardProps) {
    return (
        <View style={styles.card}>
            {/* Thanh màu thể hiện độ ưu tiên */}
            <View
                style={[styles.priorityIndicator, { backgroundColor: priorityColors[priority] }]}
            />

            <View style={styles.content}>
                {/* Checkbox hoàn thành */}
                <TouchableOpacity onPress={onToggleComplete} style={styles.iconButton}>
                    <Feather
                        name={completed ? "check-circle" : "circle"}
                        size={24}
                        color={completed ? priorityColors[priority] : "#9ca3af"}
                    />
                </TouchableOpacity>

                {/* Nội dung */}
                <View style={styles.texts}>
                    <Text
                        style={[styles.title, completed && styles.textCompleted]}
                        numberOfLines={1}
                    >
                        {title}
                    </Text>

                    {!!description && (
                        <Text
                            style={[
                                styles.description,
                                completed && styles.textCompletedLight,
                            ]}
                            numberOfLines={2}
                        >
                            {description}
                        </Text>
                    )}

                    {/* Ngày & Giờ */}
                    {!!due && (
                        <View style={styles.dateTimeWrapper}>
                            <View style={styles.dateRow}>
                                <Feather name="calendar" size={14} color="#6b7280" />
                                <Text style={styles.dueText}>{due}</Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* Nút edit / delete */}
                <View style={styles.actions}>
                    <TouchableOpacity onPress={onEdit}>
                        <Feather name="edit-2" size={20} color="#6b7280" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onDelete} style={{ marginLeft: 12 }}>
                        <Feather name="trash" size={20} color="#ef4444" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
        flexDirection: "row",
        overflow: "hidden",
    },
    priorityIndicator: {
        width: 5,
    },
    content: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 16,
        paddingHorizontal: 12,
    },
    iconButton: {
        marginRight: 12,
    },
    texts: {
        flex: 1,
    },
    title: {
        fontWeight: "700",
        fontSize: 17,
        color: "#1f2937",
        marginBottom: 2,
    },
    description: {
        fontSize: 14,
        color: "#6b7280",
        marginBottom: 8,
    },
    dateTimeWrapper: {
        marginTop: 4,
    },
    dateRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 2,
    },
    timeRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    dueText: {
        fontSize: 13,
        color: "#4b5563",
        marginLeft: 6,
    },
    actions: {
        flexDirection: "row",
        alignItems: "center",
        marginLeft: 12,
    },
    textCompleted: {
        textDecorationLine: "line-through",
        color: "#9ca3af",
    },
    textCompletedLight: {
        textDecorationLine: "line-through",
        color: "#d1d5db",
    },
});
