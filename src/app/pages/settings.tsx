import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useNotifications } from "@/contexts/NotificationContext";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import { AppState, AppStateStatus, Linking, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

export default function Settings() {
    const { hasPermission, requestPermission } = useNotifications();
    const [isToggling, setIsToggling] = useState(false);
    const [appState, setAppState] = useState(AppState.currentState);

    // Handle app state changes to sync with device settings
    useEffect(() => {
        const subscription = AppState.addEventListener("change", (nextAppState: AppStateStatus) => {
            if (appState.match(/inactive|background/) && nextAppState === "active") {
                // App came to foreground, check if permission status changed
                console.log("🔄 App came to foreground, checking notification permissions...");
            }
            setAppState(nextAppState);
        });

        return () => {
            subscription.remove();
        };
    }, [appState]);

    const toggleNotifications = useCallback(async () => {
        if (isToggling) return;
        setIsToggling(true);

        try {
            if (!hasPermission) {
                // Direct permission request without alert
                await requestPermission();
            } else {
                // Direct to device settings without alert
                try {
                    await Linking.openSettings();
                    console.log("📱 Opened device settings");
                } catch (error) {
                    console.log("❌ Could not open settings:", error);
                }
            }
        } catch {
            console.log("❌ Toggle error occurred");
        } finally {
            // Small delay to prevent rapid toggling
            setTimeout(() => setIsToggling(false), 300);
        }
    }, [hasPermission, isToggling, requestPermission]);

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <ThemedView style={styles.content}>
                {/* Header Section */}
                <View style={styles.headerSection}>
                    <View style={styles.headerIcon}>
                        <Ionicons
                            name="notifications"
                            size={32}
                            color={hasPermission ? "#34C759" : "#FF9500"}
                        />
                    </View>
                    <ThemedText style={styles.headerTitle}>Notification Settings</ThemedText>
                    <ThemedText style={styles.headerSubtitle}>
                        Manage how you receive reminders and updates
                    </ThemedText>
                </View>

                {/* Status Card */}
                <ThemedView style={styles.statusCard}>
                    <View style={styles.statusHeader}>
                        <View style={styles.statusIndicator}>
                            <View
                                style={[
                                    styles.statusDot,
                                    { backgroundColor: hasPermission ? "#34C759" : "#FF3B30" },
                                ]}
                            />
                            <ThemedText
                                style={[
                                    styles.statusTitle,
                                    { color: hasPermission ? "#34C759" : "#FF3B30" },
                                ]}
                            >
                                {hasPermission ? "Notifications Active" : "Notifications Inactive"}
                            </ThemedText>
                        </View>
                        <Ionicons
                            name={hasPermission ? "checkmark-circle" : "close-circle"}
                            size={24}
                            color={hasPermission ? "#34C759" : "#FF3B30"}
                        />
                    </View>

                    <ThemedText style={styles.statusDescription}>
                        {hasPermission
                            ? "You're all set! You'll receive notifications for your tasks, events, and habits."
                            : "Enable notifications to get reminders and stay on top of your goals."}
                    </ThemedText>
                </ThemedView>

                {/* Toggle Section */}
                <ThemedView style={styles.toggleCard}>
                    <View style={styles.toggleHeader}>
                        <View style={styles.toggleIcon}>
                            <Ionicons
                                name={hasPermission ? "notifications" : "notifications-off"}
                                size={20}
                                color={hasPermission ? "#34C759" : "#999"}
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
                        onPress={toggleNotifications}
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

                {/* Features List */}
                {hasPermission && (
                    <ThemedView style={styles.featuresCard}>
                        <ThemedText style={styles.featuresTitle}>🔔 Notification Features</ThemedText>
                        <View style={styles.featureItem}>
                            <Ionicons name="checkbox" size={16} color="#34C759" />
                            <ThemedText style={styles.featureText}>Task deadline reminders</ThemedText>
                        </View>
                        <View style={styles.featureItem}>
                            <Ionicons name="calendar" size={16} color="#007AFF" />
                            <ThemedText style={styles.featureText}>Event start notifications</ThemedText>
                        </View>
                        <View style={styles.featureItem}>
                            <Ionicons name="fitness" size={16} color="#FF9500" />
                            <ThemedText style={styles.featureText}>Daily habit reminders</ThemedText>
                        </View>
                    </ThemedView>
                )}

                {/* Help Section */}
                <View style={styles.helpSection}>
                    <ThemedText style={styles.helpTitle}>💡 Need Help?</ThemedText>
                    <ThemedText style={styles.helpText}>
                        If you change your notification settings in your device Settings app, this screen will automatically update to reflect the current status.
                    </ThemedText>
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

    // Header Styles
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

    // Status Card Styles
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

    // Toggle Card Styles
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
        backgroundColor: "#34C759",
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

    // Features Card Styles
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
    featuresTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333",
        marginBottom: 16,
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

    // Help Section Styles
    helpSection: {
        backgroundColor: "#f0f8ff",
        borderRadius: 12,
        padding: 16,
        borderLeftWidth: 4,
        borderLeftColor: "#007AFF",
    },
    helpTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#007AFF",
        marginBottom: 8,
    },
    helpText: {
        fontSize: 14,
        color: "#666",
        lineHeight: 20,
    },

    // Legacy styles (kept for compatibility)
    section: {
        marginBottom: 24,
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#E5E5EA",
        backgroundColor: "#fff",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: "700",
        marginBottom: 20,
        color: "#333",
        textAlign: "center",
    },
    statusDisplay: {
        marginBottom: 20,
        padding: 16,
        backgroundColor: "#F8F9FA",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E5E5EA",
        alignItems: "center",
    },
    statusRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    statusText: {
        fontSize: 18,
        fontWeight: "600",
        marginLeft: 12,
    },
    toggleContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 16,
    },
    toggleLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    toggleLabel: {
        fontSize: 16,
        fontWeight: "500",
        marginLeft: 12,
    },
    infoBox: {
        marginTop: 16,
        padding: 12,
        backgroundColor: "#F0F8FF",
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: "#007AFF",
    },
    infoText: {
        fontSize: 14,
        color: "#007AFF",
        lineHeight: 20,
    },
});
