import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface ToggleCardProps {
    hasPermission: boolean;
    isToggling: boolean;
    onToggle: () => void;
}

export default function ToggleCard({ hasPermission, isToggling, onToggle }: ToggleCardProps) {
    return (
        <ThemedView style={styles.toggleCard}>
            <View style={styles.toggleHeader}>
                <View style={styles.toggleIcon}>
                    <Ionicons
                        name={hasPermission ? "notifications" : "notifications-off"}
                        size={20}
                        color={hasPermission ? "#fca131" : "#999"}
                    />
                </View>
                <View style={styles.toggleTextContainer}>
                    <ThemedText style={styles.toggleTitle}>Enable Notifications</ThemedText>
                    <ThemedText style={styles.toggleSubtitle}>
                        Receive reminders for tasks, events, and habits
                    </ThemedText>
                </View>
            </View>

            <TouchableOpacity
                style={[styles.toggleSwitch, isToggling && styles.toggleDisabled]}
                onPress={onToggle}
                disabled={isToggling}
                activeOpacity={0.7}
            >
                <View
                    style={[
                        styles.toggleTrack,
                        hasPermission ? styles.toggleTrackOn : styles.toggleTrackOff,
                        isToggling && styles.toggleTrackDisabled,
                    ]}
                >
                    <View
                        style={[
                            styles.toggleThumb,
                            hasPermission ? styles.toggleThumbOn : styles.toggleThumbOff,
                        ]}
                    />
                </View>
            </TouchableOpacity>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    toggleCard: {
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
    toggleHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    toggleIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#f8f9fa",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 16,
    },
    toggleTextContainer: {
        flex: 1,
    },
    toggleTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333",
        marginBottom: 4,
    },
    toggleSubtitle: {
        fontSize: 14,
        color: "#666",
        lineHeight: 20,
    },
    toggleSwitch: {
        alignSelf: "flex-end",
    },
    toggleDisabled: {
        opacity: 0.6,
    },
    toggleTrack: {
        width: 51,
        height: 31,
        borderRadius: 15.5,
        justifyContent: "center",
        paddingHorizontal: 2,
    },
    toggleTrackOn: {
        backgroundColor: "#fca131",
    },
    toggleTrackOff: {
        backgroundColor: "#E5E5EA",
    },
    toggleTrackDisabled: {
        opacity: 0.5,
    },
    toggleThumb: {
        width: 27,
        height: 27,
        borderRadius: 13.5,
        backgroundColor: "#fff",
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 2,
        shadowOffset: { width: 0, height: 1 },
        elevation: 2,
    },
    toggleThumbOn: {
        alignSelf: "flex-end",
    },
    toggleThumbOff: {
        alignSelf: "flex-start",
    },
});