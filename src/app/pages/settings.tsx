import { ThemedView } from "@/components/themed-view";
import { useNotifications } from "@/contexts/NotificationContext";
import HeaderSection from "@/components/settings/s_header";
import StatusCard from "@/components/settings/s_status_card";
import ToggleCard from "@/components/settings/s_toggle_card";
import FeaturesCard from "@/components/settings/s_features_card";
import NavigationList from "@/components/settings/s_navigation_list";
import HelpSection from "@/components/settings/s_help_section";
import AboutView from "@/components/settings/s_about_view";
import RatingModal from "@/components/common/RatingModal";
import React, { useCallback, useEffect, useState } from "react";
import { AppState, AppStateStatus, Linking, ScrollView, StyleSheet } from "react-native";
import * as WebBrowser from 'expo-web-browser';

export default function Settings() {
    const { hasPermission, requestPermission, checkPermission } = useNotifications();
    const [isToggling, setIsToggling] = useState(false);
    const [appState, setAppState] = useState(AppState.currentState);
    const [currentView, setCurrentView] = useState<'main' | 'about'>('main');
    const [showRatingModal, setShowRatingModal] = useState(false);

    const handleNavigation = async (key: string) => {
        if (key === 'rate') {
            setShowRatingModal(true);
        } else if (key === 'about') {
            try {
                await WebBrowser.openBrowserAsync('https://www.example.com/about');
            } catch (error) {
                console.log('Could not open about URL:', error);
            }
        } else if (key === 'terms') {
            try {
                await WebBrowser.openBrowserAsync('https://www.example.com/terms-of-service');
            } catch (error) {
                console.log('Could not open terms URL:', error);
            }
        } else if (key === 'privacy') {
            try {
                await WebBrowser.openBrowserAsync('https://www.example.com/privacy-policy');
            } catch (error) {
                console.log('Could not open privacy URL:', error);
            }
        } else if (key === 'help') {
            try {
                await WebBrowser.openBrowserAsync('https://www.example.com/support');
            } catch (error) {
                console.log('Could not open support URL:', error);
            }
        } else {
            setCurrentView(key as any);
        }
    };

    const handleRatingSubmit = async (rating: number) => {
        setShowRatingModal(false);
        try {
            await Linking.openURL('https://play.google.com/store/apps/details?id=com.manhdevtoi.todolistapp');
            console.log(`User rated ${rating} stars and opened Google Play`);
        } catch (error) {
            console.log('Could not open Google Play:', error);
        }
    };

    // Handle app state changes to sync with device settings
    useEffect(() => {
        const subscription = AppState.addEventListener("change", (nextAppState: AppStateStatus) => {
            if (appState.match(/inactive|background/) && nextAppState === "active") {
                // App came to foreground, check if permission status changed
                console.log("🔄 App came to foreground, checking notification permissions...");
                checkPermission();
            }
            setAppState(nextAppState);
        });

        return () => {
            subscription.remove();
        };
    }, [appState, checkPermission]);

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
        <>
            {currentView === 'main' ? (
                <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                    <ThemedView style={styles.content}>
                        <HeaderSection hasPermission={hasPermission} />
                        <StatusCard hasPermission={hasPermission} />
                        <ToggleCard hasPermission={hasPermission} isToggling={isToggling} onToggle={toggleNotifications} />
                        <FeaturesCard hasPermission={hasPermission} />
                        <NavigationList onItemPress={handleNavigation} />
                        <HelpSection />
                    </ThemedView>
                </ScrollView>
            ) : (
                <AboutView onBack={() => setCurrentView('main')} />
            )}
            <RatingModal
                visible={showRatingModal}
                onClose={() => setShowRatingModal(false)}
                onSubmit={handleRatingSubmit}
            />
        </>
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
});
