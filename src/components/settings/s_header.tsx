import { ThemedText } from "@/components/themed-text";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";

interface HeaderSectionProps {
    hasPermission: boolean;
}

export default function HeaderSection({ hasPermission }: HeaderSectionProps) {
    return (
        <View style={styles.headerSection}>
            <View style={styles.headerIcon}>
                <Ionicons
                    name="notifications"
                    size={32}
                    color={hasPermission ? "#fca131" : "#34C759"}
                />
            </View>
            <ThemedText style={styles.headerTitle}>Notification</ThemedText>
            <ThemedText style={styles.headerSubtitle}>
                Notification & reminder preferences
            </ThemedText>
        </View>
    );
}

const styles = StyleSheet.create({
    headerSection: {
        alignItems: "center",
        marginBottom: 24,
        paddingVertical: 20,
    },
    headerIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: "700",
        color: "#333",
        textAlign: "center",
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 16,
        color: "#666",
        textAlign: "center",
        lineHeight: 24,
        paddingHorizontal: 20,
    },
});