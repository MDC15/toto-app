import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
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
    const [state, setState] = useState<PermissionState>({
        checking: false,
        requesting: false,
    });

    useEffect(() => {
        checkPermission();
    }, []);

    // ✅ Kiểm tra quyền thông báo
    const checkPermission = async () => {
        try {
            setState((prev) => ({ ...prev, checking: true }));

            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            console.log("Notification permission:", existingStatus);
        } catch (error) {
            console.error("Error checking notification permission:", error);
            Alert.alert("Error", "Failed to check notification permissions");
        } finally {
            setState((prev) => ({ ...prev, checking: false }));
        }
    };

    // 🚀 Xin quyền + gửi thông báo thử
    const requestPermission = async () => {
        try {
            setState((prev) => ({ ...prev, requesting: true }));

            const { status } = await Notifications.requestPermissionsAsync({
                ios: {
                    allowAlert: true,
                    allowBadge: true,
                    allowSound: true,
                },
            });

            if (status === 'granted') {
                // Gửi thông báo test
                await Notifications.scheduleNotificationAsync({
                    content: {
                        title: "🎉 Notifications Enabled!",
                        body: "You'll now receive reminders and updates.",
                        sound: 'default',
                    },
                    trigger: null, // Send immediately
                });

                Alert.alert("✅ Success", "Notifications have been enabled!");
                router.push("/(tabs)");
            } else {
                Alert.alert(
                    "🚫 Notifications Disabled",
                    "You can enable notifications later in your device settings."
                );
                router.push("/(tabs)");
            }
        } catch (error) {
            console.error("Error requesting notification permission:", error);
            Alert.alert("Error", "Failed to request notification permissions.");
        } finally {
            setState((prev) => ({ ...prev, requesting: false }));
        }
    };

    return (
        <View style={styles.container}>
            <Image
                source={{
                    uri: "https://cdn-icons-png.flaticon.com/512/1827/1827349.png",
                }}
                style={styles.image}
            />

            <Text style={styles.title}>Enable Notifications</Text>

            <Text style={styles.subtitle}>
                Allow notifications so we can remind you at the right time!{"\n"}
                Daily tasks, goals, and helpful reminders
            </Text>

            <TouchableOpacity
                style={[styles.button, state.requesting && styles.buttonDisabled]}
                onPress={requestPermission}
                disabled={state.requesting}
            >
                {state.requesting ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Allow Notifications</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push("/(tabs)")}>
                <Text style={styles.later}>Maybe later</Text>
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
        marginBottom: 30,
        borderRadius: 60,
    },
    title: {
        fontSize: 24,
        fontWeight: "800",
        color: "#222",
        textAlign: "center",
        marginBottom: 15,
    },
    subtitle: {
        fontSize: 16,
        color: "#666",
        textAlign: "center",
        marginBottom: 40,
        lineHeight: 22,
    },
    button: {
        backgroundColor: "#FF6B35",
        borderRadius: 25,
        paddingVertical: 18,
        paddingHorizontal: 40,
        width: "100%",
        alignItems: "center",
        marginBottom: 20,
        shadowColor: "#000",
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
        textDecorationLine: "underline",
    },
});
