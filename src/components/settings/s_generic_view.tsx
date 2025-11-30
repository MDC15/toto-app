import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

interface GenericViewProps {
    title: string;
    content: string;
    onBack: () => void;
}

export default function GenericView({ title, content, onBack }: GenericViewProps) {
    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <ThemedView style={styles.content}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onBack} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={24} color="#fca131" />
                    </TouchableOpacity>
                    <ThemedText style={styles.title}>{title}</ThemedText>
                </View>

                <View style={styles.section}>
                    <ThemedText style={styles.description}>{content}</ThemedText>
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
    description: {
        fontSize: 16,
        color: "#666",
        lineHeight: 24,
    },
});