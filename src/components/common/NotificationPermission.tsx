import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useNotifications } from '@/contexts/NotificationContext';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, View, TouchableOpacity } from 'react-native';

interface NotificationPermissionProps {
    onPermissionGranted?: () => void;
    onPermissionDenied?: () => void;
    showFullScreen?: boolean;
}

export function NotificationPermission({
    onPermissionGranted,
    onPermissionDenied,
    showFullScreen = false
}: NotificationPermissionProps) {
    const { hasPermission, requestPermission } = useNotifications();
    const [isRequesting, setIsRequesting] = useState(false);

    useEffect(() => {
        if (hasPermission) {
            onPermissionGranted?.();
        } else {
            onPermissionDenied?.();
        }
    }, [hasPermission, onPermissionGranted, onPermissionDenied]);

    const handleRequestPermission = async () => {
        setIsRequesting(true);
        try {
            const granted = await requestPermission();
            if (granted) {
                onPermissionGranted?.();
            } else {
                onPermissionDenied?.();
            }
        } catch (error) {
            console.error('Error requesting notification permission:', error);
        } finally {
            setIsRequesting(false);
        }
    };

    if (hasPermission) {
        return null; // Don't show anything if permission is already granted
    }

    if (showFullScreen) {
        return (
            <ThemedView style={styles.fullScreenContainer}>
                <View style={styles.content}>
                    <Ionicons name="notifications-outline" size={80} color="#007AFF" />
                    <ThemedText style={styles.title}>Enable Notifications</ThemedText>
                    <ThemedText style={styles.description}>
                        Get reminded about your tasks, events, and habits so you never miss anything important!
                    </ThemedText>

                    <View style={styles.benefits}>
                        <View style={styles.benefit}>
                            <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                            <ThemedText style={styles.benefitText}>Task deadline reminders</ThemedText>
                        </View>
                        <View style={styles.benefit}>
                            <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                            <ThemedText style={styles.benefitText}>Event start notifications</ThemedText>
                        </View>
                        <View style={styles.benefit}>
                            <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                            <ThemedText style={styles.benefitText}>Daily habit reminders</ThemedText>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.button, isRequesting && styles.buttonDisabled]}
                        onPress={handleRequestPermission}
                        disabled={isRequesting}
                    >
                        <ThemedText style={styles.buttonText}>
                            {isRequesting ? 'Requesting...' : 'Enable Notifications'}
                        </ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.secondaryButton} onPress={() => onPermissionDenied?.()}>
                        <ThemedText style={styles.secondaryButtonText}>Maybe Later</ThemedText>
                    </TouchableOpacity>
                </View>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            <View style={styles.warningContainer}>
                <Ionicons name="notifications-off-outline" size={24} color="#FF9500" />
                <View style={styles.warningContent}>
                    <ThemedText style={styles.warningTitle}>Enable Notifications</ThemedText>
                    <ThemedText style={styles.warningText}>
                        Get reminders for your tasks and events
                    </ThemedText>
                </View>
                <TouchableOpacity
                    style={[styles.smallButton, isRequesting && styles.buttonDisabled]}
                    onPress={handleRequestPermission}
                    disabled={isRequesting}
                >
                    <ThemedText style={styles.smallButtonText}>
                        {isRequesting ? '...' : 'Enable'}
                    </ThemedText>
                </TouchableOpacity>
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    fullScreenContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    content: {
        alignItems: 'center',
        maxWidth: 300,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 20,
        marginBottom: 16,
    },
    description: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 24,
        opacity: 0.8,
    },
    benefits: {
        width: '100%',
        marginBottom: 32,
    },
    benefit: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    benefitText: {
        fontSize: 16,
        marginLeft: 12,
    },
    button: {
        backgroundColor: '#007AFF',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 12,
        marginBottom: 16,
        minWidth: 200,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    secondaryButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
    },
    secondaryButtonText: {
        fontSize: 16,
        color: '#007AFF',
    },
    container: {
        padding: 16,
    },
    warningContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF3E0',
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#FF9500',
    },
    warningContent: {
        flex: 1,
        marginLeft: 12,
        marginRight: 8,
    },
    warningTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    warningText: {
        fontSize: 14,
        opacity: 0.8,
    },
    smallButton: {
        backgroundColor: '#FF9500',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    smallButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
});