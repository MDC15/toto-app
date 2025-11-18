import { Feather } from "@expo/vector-icons";
import React, { memo, useCallback } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { responsive } from '@/constants/theme';

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

const TaskCard = memo(({
    title,
    description,
    due,
    priority,
    completed,
    onEdit,
    onDelete,
    onToggleComplete,
}: TaskCardProps) => {
    // Memoize callback functions to prevent re-renders
    const handleToggleComplete = useCallback(() => {
        onToggleComplete();
    }, [onToggleComplete]);

    const handleEdit = useCallback(() => {
        onEdit();
    }, [onEdit]);

    const handleDelete = useCallback(() => {
        onDelete();
    }, [onDelete]);

    return (
        <View style={styles.card}>
            {/* Thanh màu thể hiện độ ưu tiên */}
            <View
                style={[styles.priorityIndicator, { backgroundColor: priorityColors[priority] }]}
            />

            <View style={styles.content}>
                {/* Checkbox hoàn thành */}
                <TouchableOpacity onPress={handleToggleComplete} style={styles.iconButton}>
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
                    <TouchableOpacity onPress={handleEdit}>
                        <Feather name="edit-2" size={20} color="#6b7280" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleDelete} style={{ marginLeft: 12 }}>
                        <Feather name="trash" size={20} color="#ef4444" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
});

TaskCard.displayName = 'TaskCard';

export default TaskCard;

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#fff",
        borderRadius: responsive.spacing(12),
        marginBottom: responsive.spacing(16),
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
        flexDirection: "row",
        overflow: "hidden",
    },
    priorityIndicator: {
        width: responsive.spacing(5),
    },
    content: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: responsive.spacing(16),
        paddingHorizontal: responsive.spacing(12),
    },
    iconButton: {
        marginRight: responsive.spacing(12),
    },
    texts: {
        flex: 1,
    },
    title: {
        fontWeight: "700",
        fontSize: responsive.fontSize(17),
        color: "#1f2937",
        marginBottom: responsive.spacing(2),
    },
    description: {
        fontSize: responsive.fontSize(14),
        color: "#6b7280",
        marginBottom: responsive.spacing(8),
    },
    dateTimeWrapper: {
        marginTop: responsive.spacing(4),
    },
    dateRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: responsive.spacing(2),
    },
    timeRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    dueText: {
        fontSize: responsive.fontSize(13),
        color: "#4b5563",
        marginLeft: responsive.spacing(6),
    },
    actions: {
        flexDirection: "row",
        alignItems: "center",
        marginLeft: responsive.spacing(12),
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
