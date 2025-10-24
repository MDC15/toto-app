import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface PriorityBadgeProps {
    label: "High" | "Medium" | "Low";
}

export default function PriorityBadge({ label }: PriorityBadgeProps) {
    const getPriorityColors = () => {
        switch (label) {
            case "High":
                return {
                    color: "#ef4444",
                    backgroundColor: "rgba(239, 68, 68, 0.1)",
                    textColor: "#ef4444",
                };
            case "Medium":
                return {
                    color: "#f97316",
                    backgroundColor: "rgba(249, 115, 22, 0.1)",
                    textColor: "#f97316",
                };
            case "Low":
                return {
                    color: "#3b82f6",
                    backgroundColor: "rgba(59, 130, 246, 0.1)",
                    textColor: "#3b82f6",
                };
            default:
                return {
                    color: "#9ca3af",
                    backgroundColor: "rgba(156, 163, 175, 0.1)",
                    textColor: "#9ca3af",
                };
        }
    };

    const { color, backgroundColor, textColor } = getPriorityColors();

    return (
        <View
            style={[
                styles.container,
                {
                    borderColor: color,
                    backgroundColor: backgroundColor,
                    marginTop: 14,
                },
            ]}
        >
            <Text
                style={[
                    styles.text,
                    {
                        color: textColor,
                    },
                ]}
            >
                {label.toUpperCase()}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderWidth: 1,
        borderRadius: 6,
        paddingVertical: 2,
        paddingHorizontal: 8,
        alignSelf: "flex-start",
        justifyContent: "center",
        alignItems: "center",
    },
    text: {
        fontWeight: "600",
        fontSize: 12,
    },
});
