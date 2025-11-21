import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Linking, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

interface AboutViewProps {
    onBack: () => void;
}

export default function AboutView({ onBack }: AboutViewProps) {
    const handleLinkPress = (url: string) => {
        Linking.openURL(url);
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <ThemedView style={styles.content}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onBack} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={24} color="#007AFF" />
                    </TouchableOpacity>
                    <ThemedText style={styles.title}>About TodoList</ThemedText>
                </View>

                <View style={styles.appIconContainer}>
                    <View style={styles.appIcon}>
                        <MaterialIcons name="check-circle" size={48} color="#f97316" />
                    </View>
                    <ThemedText style={styles.appName}>TodoList Pro</ThemedText>
                    <ThemedText style={styles.appVersion}>Version 1.0.0</ThemedText>
                </View>

                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>About</ThemedText>
                    <ThemedText style={styles.description}>
                        TodoList Pro is a comprehensive productivity app designed to streamline your daily life. From managing tasks and tracking habits to scheduling events, we help you stay organized and achieve your goals efficiently.
                    </ThemedText>
                </View>

                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Key Features</ThemedText>
                    <View style={styles.featureItem}>
                        <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                        <ThemedText style={styles.featureText}>Advanced task management with priorities</ThemedText>
                    </View>
                    <View style={styles.featureItem}>
                        <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                        <ThemedText style={styles.featureText}>Habit tracking with detailed analytics</ThemedText>
                    </View>
                    <View style={styles.featureItem}>
                        <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                        <ThemedText style={styles.featureText}>Smart event scheduling and reminders</ThemedText>
                    </View>
                    <View style={styles.featureItem}>
                        <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                        <ThemedText style={styles.featureText}>Premium features for power users</ThemedText>
                    </View>
                </View>

                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Developer</ThemedText>
                    <ThemedText style={styles.description}>Developed by MDC Team</ThemedText>
                    <ThemedText style={styles.description}>© 2024 All rights reserved</ThemedText>
                </View>

                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Contact & Support</ThemedText>
                    <TouchableOpacity
                        style={styles.linkItem}
                        onPress={() => handleLinkPress('mailto:support@todolistpro.com')}
                    >
                        <Ionicons name="mail" size={20} color="#007AFF" />
                        <ThemedText style={styles.linkText}>support@todolistpro.com</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.linkItem}
                        onPress={() => handleLinkPress('https://todolistpro.com/privacy')}
                    >
                        <Ionicons name="shield-checkmark" size={20} color="#007AFF" />
                        <ThemedText style={styles.linkText}>Privacy Policy</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.linkItem}
                        onPress={() => handleLinkPress('https://todolistpro.com/terms')}
                    >
                        <Ionicons name="document-text" size={20} color="#007AFF" />
                        <ThemedText style={styles.linkText}>Terms of Service</ThemedText>
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Follow Us</ThemedText>
                    <View style={styles.socialContainer}>
                        <TouchableOpacity
                            style={styles.socialButton}
                            onPress={() => handleLinkPress('https://twitter.com/todolistpro')}
                        >
                            <Ionicons name="logo-twitter" size={24} color="#1da1f2" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.socialButton}
                            onPress={() => handleLinkPress('https://instagram.com/todolistpro')}
                        >
                            <Ionicons name="logo-instagram" size={24} color="#e4405f" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.socialButton}
                            onPress={() => handleLinkPress('https://facebook.com/todolistpro')}
                        >
                            <Ionicons name="logo-facebook" size={24} color="#1877f2" />
                        </TouchableOpacity>
                    </View>
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
    appIconContainer: {
        alignItems: "center",
        marginBottom: 32,
    },
    appIcon: {
        width: 80,
        height: 80,
        borderRadius: 20,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    appName: {
        fontSize: 28,
        fontWeight: "700",
        color: "#333",
        marginBottom: 4,
    },
    appVersion: {
        fontSize: 16,
        color: "#666",
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
    featureItem: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    featureText: {
        fontSize: 16,
        color: "#666",
        marginLeft: 12,
        flex: 1,
    },
    linkItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
    },
    linkText: {
        fontSize: 16,
        color: "#007AFF",
        marginLeft: 12,
        textDecorationLine: "underline",
    },
    socialContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 8,
    },
    socialButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        marginHorizontal: 8,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    bullet: {
        fontSize: 16,
        color: "#666",
        lineHeight: 24,
        marginBottom: 8,
    },
});