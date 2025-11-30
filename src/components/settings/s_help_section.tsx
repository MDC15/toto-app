import { ThemedText } from "@/components/themed-text";
import React from "react";
import { StyleSheet, View } from "react-native";

export default function HelpSection() {
    return (
        <View style={styles.helpSection}>
            <ThemedText style={styles.helpTitle}>💡 Need Help?</ThemedText>
            <ThemedText style={styles.helpText}>
                If you change your notification settings in your device Settings app, this screen will automatically update to reflect the current status.
            </ThemedText>
        </View>
    );
}

const styles = StyleSheet.create({
    helpSection: {
        backgroundColor: "#FFF9F0",
        borderRadius: 12,
        padding: 16,
        borderLeftWidth: 4,
        borderLeftColor: "#fca131",
    },
    helpTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#fca131",
        marginBottom: 8,
    },
    helpText: {
        fontSize: 14,
        color: "#666",
        lineHeight: 20,
    },
});