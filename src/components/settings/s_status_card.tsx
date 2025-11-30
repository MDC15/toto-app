import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";

interface StatusCardProps {
    hasPermission: boolean;
}

export default function StatusCard({ hasPermission }: StatusCardProps) {
    return (
        <ThemedView style={styles.statusCard}>
            <View style={styles.statusHeader}>
                <View style={styles.statusIndicator}>
                    <View
                        style={[
                            styles.statusDot,
                            { backgroundColor: hasPermission ? "#fca131" : "#FF3B30" },
                        ]}
                    />
                    <ThemedText
                        style={[
                            styles.statusTitle,
                            { color: hasPermission ? "#fca131" : "#FF3B30" },
                        ]}
                    >
                        {hasPermission ? "Notifications Active" : "Notifications Inactive"}
                    </ThemedText>
                </View>
                <Ionicons
                    name={hasPermission ? "checkmark-circle" : "close-circle"}
                    size={24}
                    color={hasPermission ? "#fca131" : "#FF3B30"}
                />
            </View>

            <ThemedText style={styles.statusDescription}>
                {hasPermission
                    ? "You're all set! You'll receive notifications for your tasks, events, and habits."
                    : "Enable notifications to get reminders and stay on top of your goals."}
            </ThemedText>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    statusCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },
    statusHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    statusIndicator: {
        flexDirection: "row",
        alignItems: "center",
    },
    statusDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 12,
    },
    statusTitle: {
        fontSize: 20,
        fontWeight: "600",
    },
    statusDescription: {
        fontSize: 16,
        color: "#666",
        lineHeight: 24,
    },
});