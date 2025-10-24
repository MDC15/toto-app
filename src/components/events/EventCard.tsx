import { AntDesign, Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface EventCardProps {
    title: string;
    timeRange: string;
    date: string;
    icon: string;
    completed?: boolean;
    onToggleComplete?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
}

export default function EventCard({
    title,
    timeRange,
    date,
    icon,
    completed = false,
    onToggleComplete,
    onEdit,
    onDelete,
}: EventCardProps) {
    return (
        <View style={styles.card}>
            {/* Thanh màu thể hiện trạng thái */}
            <View
                style={[styles.statusIndicator, { backgroundColor: completed ? "#10b981" : "#f97316" }]}
            />

            <View style={styles.content}>
                {/* Checkbox hoàn thành */}
                <TouchableOpacity onPress={onToggleComplete} style={styles.iconButton}>
                    <Feather
                        name={completed ? "check-circle" : "circle"}
                        size={24}
                        color={completed ? "#10b981" : "#9ca3af"}
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

                    {/* Thời gian */}
                    <View style={styles.dateTimeWrapper}>
                        <View style={styles.timeRow}>
                            <AntDesign name="clock-circle" size={14} color="#6b7280" />
                            <Text style={[styles.timeText, completed && styles.textCompletedLight]}>
                                {timeRange}
                            </Text>
                        </View>
                        <View style={styles.dateRow}>
                            <Feather name="calendar" size={14} color="#6b7280" />
                            <Text style={[styles.dateText, completed && styles.textCompletedLight]}>
                                {date}
                            </Text>
                        </View>
                    </View>
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
    statusIndicator: {
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
    actions: {
        flexDirection: "row",
        alignItems: "center",
        marginLeft: 12,
    },
    title: {
        fontWeight: "700",
        fontSize: 17,
        color: "#1f2937",
        marginBottom: 2,
    },
    dateTimeWrapper: {
        marginTop: 4,
    },
    timeRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 2,
    },
    dateRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    timeText: {
        fontSize: 13,
        color: "#4b5563",
        marginLeft: 6,
    },
    dateText: {
        fontSize: 13,
        color: "#4b5563",
        marginLeft: 6,
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
