import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

interface AboutViewProps {
    onBack: () => void;
}

export default function AboutView({ onBack }: AboutViewProps) {
    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <ThemedView style={styles.content}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onBack} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={24} color="#007AFF" />
                    </TouchableOpacity>
                    <ThemedText style={styles.title}>About TodoList App</ThemedText>
                </View>

                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Welcome to TodoList</ThemedText>
                    <ThemedText style={styles.description}>
                        TodoList is your ultimate productivity companion, designed to help you organize tasks, track habits, and achieve your goals with ease.
                    </ThemedText>
                </View>

                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Features</ThemedText>
                    <ThemedText style={styles.bullet}>• Task management with priorities and reminders</ThemedText>
                    <ThemedText style={styles.bullet}>• Habit tracking with progress visualization</ThemedText>
                    <ThemedText style={styles.bullet}>• Event scheduling and notifications</ThemedText>
                    <ThemedText style={styles.bullet}>• Premium features for advanced users</ThemedText>
                </View>

                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Version</ThemedText>
                    <ThemedText style={styles.description}>Version 1.0.0</ThemedText>
                </View>
            </ThemedView>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f9fa",
    },
    content: {
        padding: 20,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 24,
    },
    backButton: {
        marginRight: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: "700",
        color: "#333",
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: "#333",
        marginBottom: 12,
    },
    description: {
        fontSize: 16,
        color: "#666",
        lineHeight: 24,
    },
    bullet: {
        fontSize: 16,
        color: "#666",
        lineHeight: 24,
        marginBottom: 8,
    },
});