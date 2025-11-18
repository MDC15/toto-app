import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";

interface FeaturesCardProps {
    hasPermission: boolean;
}

export default function FeaturesCard({ hasPermission }: FeaturesCardProps) {
    if (!hasPermission) return null;

    return (
        <ThemedView style={styles.featuresCard}>
            <View style={styles.titleRow}>
                <Ionicons name="notifications-outline" size={20} color="#fca131" />
                <ThemedText style={styles.featuresTitle}>Notification Features</ThemedText>
            </View>

            <View style={styles.featureItem}>
                <Ionicons name="alarm-outline" size={16} color="#fca131" />
                <ThemedText style={styles.featureText}>Task deadline reminders</ThemedText>
            </View>

            <View style={styles.featureItem}>
                <Ionicons name="calendar-outline" size={16} color="#fca131" />
                <ThemedText style={styles.featureText}>Event start notifications</ThemedText>
            </View>

            <View style={styles.featureItem}>
                <Ionicons name="repeat-outline" size={16} color="#fca131" />
                <ThemedText style={styles.featureText}>Daily habit reminders</ThemedText>
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    featuresCard: {
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
    titleRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    featuresTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333",
        marginLeft: 10,
    },
    featureItem: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    featureText: {
        fontSize: 16,
        color: "#666",
        marginLeft: 12,
    },
});
