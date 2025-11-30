import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

export default function Premium() {
    const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');

    const features = [
        {
            icon: "infinite",
            title: "Unlimited Tasks & Habits",
            description: "Create as many tasks and habits as you need without any restrictions.",
            iconType: "Ionicons"
        },
        {
            icon: "analytics-outline",
            title: "Advanced Analytics",
            description: "Gain deep insights into your productivity with detailed charts and reports.",
            iconType: "Ionicons"
        },
        {
            icon: "color-palette-outline",
            title: "Custom Themes",
            description: "Personalize your app with exclusive color themes and dark mode options.",
            iconType: "Ionicons"
        },
        {
            icon: "cloud-upload-outline",
            title: "Cloud Backup & Sync",
            description: "Keep your data safe and synchronized across all your devices.",
            iconType: "Ionicons"
        },
        {
            icon: "shield-checkmark-outline",
            title: "Priority Support",
            description: "Get faster response times and dedicated support from our team.",
            iconType: "Ionicons"
        },
        {
            icon: "widgets-outline",
            title: "Home Screen Widgets",
            description: "Access your tasks quickly with customizable home screen widgets.",
            iconType: "MaterialIcons"
        }
    ];

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="close" size={28} color="#333" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.heroSection}>
                    <View style={styles.crownContainer}>
                        <MaterialCommunityIcons name="crown" size={64} color="#fca131" />
                    </View>
                    <ThemedText style={styles.heroTitle}>Upgrade to Premium</ThemedText>
                    <ThemedText style={styles.heroSubtitle}>
                        Unlock the full potential of your productivity
                    </ThemedText>
                </View>

                <View style={styles.featuresContainer}>
                    {features.map((feature, index) => (
                        <View key={index} style={styles.featureItem}>
                            <View style={styles.featureIconContainer}>
                                <Ionicons name={feature.icon as any} size={24} color="#fca131" />
                            </View>
                            <View style={styles.featureTextContainer}>
                                <ThemedText style={styles.featureTitle}>{feature.title}</ThemedText>
                                <ThemedText style={styles.featureDescription}>{feature.description}</ThemedText>
                            </View>
                        </View>
                    ))}
                </View>

                <View style={styles.pricingContainer}>
                    <TouchableOpacity
                        style={[styles.planCard, selectedPlan === 'monthly' && styles.selectedPlanCard]}
                        onPress={() => setSelectedPlan('monthly')}
                        activeOpacity={0.9}
                    >
                        <View style={styles.planHeader}>
                            <ThemedText style={[styles.planName, selectedPlan === 'monthly' && styles.selectedPlanText]}>Monthly</ThemedText>
                            <View style={styles.saveBadge}>
                                <ThemedText style={styles.saveText}>Flexible</ThemedText>
                            </View>
                        </View>
                        <ThemedText style={[styles.planPrice, selectedPlan === 'monthly' && styles.selectedPlanText]}>$4.99<ThemedText style={[styles.perMonth, selectedPlan === 'monthly' && styles.selectedPlanText]}>/mo</ThemedText></ThemedText>
                        <ThemedText style={[styles.planDescription, selectedPlan === 'monthly' && styles.selectedPlanText]}>Billed monthly</ThemedText>

                        {selectedPlan === 'monthly' && (
                            <View style={styles.checkIcon}>
                                <Ionicons name="checkmark-circle" size={24} color="#fff" />
                            </View>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.planCard, selectedPlan === 'yearly' && styles.selectedPlanCard]}
                        onPress={() => setSelectedPlan('yearly')}
                        activeOpacity={0.9}
                    >
                        <View style={styles.popularBadge}>
                            <ThemedText style={styles.popularText}>MOST POPULAR</ThemedText>
                        </View>
                        <View style={styles.planHeader}>
                            <ThemedText style={[styles.planName, selectedPlan === 'yearly' && styles.selectedPlanText]}>Yearly</ThemedText>
                            <View style={styles.saveBadgeHighlight}>
                                <ThemedText style={styles.saveTextHighlight}>SAVE 50%</ThemedText>
                            </View>
                        </View>
                        <ThemedText style={[styles.planPrice, selectedPlan === 'yearly' && styles.selectedPlanText]}>$29.99<ThemedText style={[styles.perMonth, selectedPlan === 'yearly' && styles.selectedPlanText]}>/yr</ThemedText></ThemedText>
                        <ThemedText style={[styles.planDescription, selectedPlan === 'yearly' && styles.selectedPlanText]}>$2.50/month, billed yearly</ThemedText>

                        {selectedPlan === 'yearly' && (
                            <View style={styles.checkIcon}>
                                <Ionicons name="checkmark-circle" size={24} color="#fff" />
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.subscribeButton}>
                    <ThemedText style={styles.subscribeButtonText}>
                        Subscribe {selectedPlan === 'monthly' ? 'Monthly' : 'Yearly'}
                    </ThemedText>
                </TouchableOpacity>

                <ThemedText style={styles.disclaimer}>
                    Recurring billing, cancel anytime. Terms of Service and Privacy Policy apply.
                </ThemedText>
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#f0f0f0",
        alignItems: "center",
        justifyContent: "center",
    },
    scrollContent: {
        paddingBottom: 40,
    },
    heroSection: {
        alignItems: "center",
        paddingHorizontal: 20,
        marginBottom: 40,
    },
    crownContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "#FFF9F0",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
    },
    heroTitle: {
        fontSize: 32,
        fontWeight: "800",
        color: "#333",
        marginBottom: 15,
        lineHeight: 48,
        textAlign: "center",
    },
    heroSubtitle: {
        fontSize: 18,
        color: "#666",
        textAlign: "center",
        lineHeight: 26,
    },
    featuresContainer: {
        paddingHorizontal: 20,
        marginBottom: 40,
    },
    featureItem: {
        flexDirection: "row",
        marginBottom: 24,
    },
    featureIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: "#FFF9F0",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 16,
    },
    featureTextContainer: {
        flex: 1,
    },
    featureTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#333",
        marginBottom: 4,
    },
    featureDescription: {
        fontSize: 15,
        color: "#666",
        lineHeight: 22,
    },
    pricingContainer: {
        paddingHorizontal: 20,
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 30,
        gap: 12,
    },
    planCard: {
        flex: 1,
        borderWidth: 2,
        borderColor: "#e0e0e0",
        borderRadius: 16,
        padding: 16,
        alignItems: "center",
        position: 'relative',
        backgroundColor: '#fff',
    },
    selectedPlanCard: {
        borderColor: "#fca131",
        backgroundColor: "#fca131",
        transform: [{ scale: 1.02 }],
        shadowColor: "#fca131",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
        zIndex: 1,
    },
    popularBadge: {
        position: 'absolute',
        top: -12,
        backgroundColor: "#333",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        zIndex: 2,
    },
    popularText: {
        color: "#fff",
        fontSize: 10,
        fontWeight: "800",
    },
    planHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    planName: {
        fontSize: 16,
        fontWeight: "700",
        color: "#333",
        marginRight: 8,
    },
    saveBadge: {
        backgroundColor: "#f0f0f0",
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    saveBadgeHighlight: {
        backgroundColor: "#fff",
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    saveText: {
        fontSize: 10,
        fontWeight: "700",
        color: "#666",
    },
    saveTextHighlight: {
        fontSize: 10,
        fontWeight: "700",
        color: "#fca131",
    },
    planPrice: {
        fontSize: 24,
        fontWeight: "800",
        color: "#333",
        marginBottom: 4,
    },
    perMonth: {
        fontSize: 14,
        fontWeight: "500",
        color: "#666",
    },
    planDescription: {
        fontSize: 12,
        color: "#666",
        textAlign: "center",
    },
    selectedPlanText: {
        color: "#fff",
    },
    checkIcon: {
        position: 'absolute',
        top: 8,
        right: 8,
    },
    subscribeButton: {
        marginHorizontal: 20,
        backgroundColor: "#fca131",
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: "center",
        marginBottom: 16,
        shadowColor: "#fca131",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    subscribeButtonText: {
        fontSize: 18,
        fontWeight: "700",
        color: "#fff",
    },
    disclaimer: {
        fontSize: 12,
        color: "#999",
        textAlign: "center",
        paddingHorizontal: 40,
        lineHeight: 18,
    },
});
