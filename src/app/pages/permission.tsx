import { useNotifications } from "@/contexts/NotificationContext";
import { Ionicons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

interface PermissionState {
    checking: boolean;
    requesting: boolean;
}

export default function NotificationPermissionScreen() {
    const router = useRouter();
    const { hasPermission, requestPermission: requestContextPermission, checkPermission: checkContextPermission } = useNotifications();
    const [state, setState] = useState<PermissionState>({
        checking: false,
        requesting: false,
    });

    useEffect(() => {
        const checkPermission = async () => {
            try {
                setState((prev) => ({ ...prev, checking: true }));

                const { status: existingStatus } = await Notifications.getPermissionsAsync();
                console.log("Notification permission:", existingStatus);

                // Sync with context if permission is granted
                if (existingStatus === 'granted' && !hasPermission) {
                    await checkContextPermission();
                }
            } catch (error) {
                console.error("Error checking notification permission:", error);
            } finally {
                setState((prev) => ({ ...prev, checking: false }));
            }
        };

        checkPermission();
    }, [hasPermission, checkContextPermission]);

    // If permission is already granted, navigate away
    useEffect(() => {
        if (hasPermission) {
            console.log('✅ Permission already granted, navigating to main app');
            router.push("/(tabs)");
        }
    }, [hasPermission, router]);

    // 🚀 Xin quyền + gửi thông báo thử
    const requestPermission = async () => {
        try {
            setState((prev) => ({ ...prev, requesting: true }));

            // Use context method to ensure state is updated globally
            const granted = await requestContextPermission();

            if (granted) {
                console.log('✅ Permission granted! Notifications are now active');
                // Force a check to ensure context is updated
                await checkContextPermission();
                router.push("/(tabs)");
            } else {
                console.log('❌ Permission denied, still navigating to main app');
                router.push("/(tabs)");
            }
        } catch (error) {
            console.error("Error requesting notification permission:", error);
            router.push("/(tabs)");
        } finally {
            setState((prev) => ({ ...prev, requesting: false }));
        }
    };

    return (
        <View style={styles.container}>

            <Ionicons name="notifications" size={120} color="#FF6B35" style={styles.headerIcon} />

            <Text style={styles.title}>Turn on notifications so you don’t miss anything</Text>

            <Text style={styles.subtitle}>
                Allow notifications to remind you at the right time! (Reminders for tasks, events, and daily habits)
            </Text>

            <TouchableOpacity
                style={[styles.button, state.requesting && styles.buttonDisabled]}
                onPress={requestPermission}
                disabled={state.requesting}
            >
                {state.requesting ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <View style={styles.buttonContent}>
                        <Ionicons name="checkmark-circle" size={20} color="#fff" style={styles.buttonIcon} />
                        <Text style={styles.buttonText}>Allow notifications</Text>
                    </View>
                )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push("/(tabs)")}>
                <Text style={styles.later}>Activate later</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 30,
        backgroundColor: "#fff",
    },
    image: {
        width: 120,
        height: 120,
        marginBottom: 40,
        borderRadius: 60,
    },
    headerIcon: {
        marginBottom: 40,
    },
    title: {
        fontSize: 24,
        fontWeight: "800",
        color: "#222",
        textAlign: "center",
        marginBottom: 20,
    },
    subtitle: {
        fontSize: 16,
        color: "#666",
        textAlign: "center",
        marginBottom: 50,
        lineHeight: 22,
    },
    button: {
        backgroundColor: "#FF6B35",
        borderRadius: 25,
        paddingVertical: 18,
        paddingHorizontal: 40,
        width: "100%",
        marginBottom: 25,
        shadowOpacity: 0.15,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 16,
    },
    later: {
        color: "#FF8C00",
        fontWeight: "600",
        fontSize: 14,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonIcon: {
        marginRight: 8,
    }

});
