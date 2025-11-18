import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

interface PremiumViewProps {
    onBack: () => void;
}

export default function PremiumView({ onBack }: PremiumViewProps) {
    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <ThemedView style={styles.content}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onBack} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={24} color="#007AFF" />
                    </TouchableOpacity>
                    <ThemedText style={styles.title}>Premium Features</ThemedText>
                </View>

                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Unlock Advanced Features</ThemedText>
                    <ThemedText style={styles.description}>
                        Upgrade to premium to access exclusive features that help you maximize your productivity.
                    </ThemedText>
                </View>

                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Premium Benefits</ThemedText>
                    <ThemedText style={styles.bullet}>• Unlimited tasks and habits</ThemedText>
                    <ThemedText style={styles.bullet}>• Advanced analytics and reports</ThemedText>
                    <ThemedText style={styles.bullet}>• Custom themes and widgets</ThemedText>
                    <ThemedText style={styles.bullet}>• Priority support</ThemedText>
                </View>

                <TouchableOpacity style={styles.upgradeButton}>
                    <ThemedText style={styles.upgradeText}>Upgrade to Premium</ThemedText>
                </TouchableOpacity>
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
    upgradeButton: {
        backgroundColor: "#007AFF",
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 24,
    },
    upgradeText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
    },
});