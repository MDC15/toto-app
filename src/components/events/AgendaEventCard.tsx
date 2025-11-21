import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";

interface AgendaEventCardProps {
    title: string;
    timeRange: string;
    color?: string;
    onPress?: () => void;
    onDelete?: () => void;
}

const AgendaEventCard: React.FC<AgendaEventCardProps> = ({
    title,
    timeRange,
    color = "#f97316",
    onPress,
    onDelete,
}) => {
    return (
        <View style={[styles.card, { backgroundColor: color }]}>
            <TouchableOpacity style={styles.mainContent} onPress={onPress}>
                <View style={styles.content}>
                    <Text style={styles.timeText}>{timeRange}</Text>
                    <Text style={styles.titleText} numberOfLines={1}>
                        {title}
                    </Text>
                </View>
            </TouchableOpacity>
            {onDelete && (
                <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
                    <Feather name="trash" size={18} color="#ef4444" />
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 8,
        marginBottom: 8,
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 16,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    mainContent: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    deleteButton: {
        marginLeft: 12,
        padding: 4,
    },
    content: {
        flex: 1,
    },
    timeText: {
        fontSize: 14,
        color: "#fff",
        marginBottom: 2,
    },
    titleText: {
        fontSize: 16,
        color: "#fff",
        fontWeight: "500",
    },
});

export default AgendaEventCard;