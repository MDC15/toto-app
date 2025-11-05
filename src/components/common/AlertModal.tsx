import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type AlertType = 'warning' | 'success' | 'error' | 'info';

interface AlertModalProps {
    visible: boolean;
    type?: AlertType;
    title?: string;
    message?: string;
    cancelText?: string;
    confirmText?: string;
    onCancel?: () => void;
    onConfirm?: () => void;
    onClose?: () => void;
}

export default function AlertModal(props: AlertModalProps) {
    const {
        visible,
        type = 'info',
        title = 'Alert',
        message = '',
        cancelText = 'Cancel',
        confirmText = 'OK',
        onCancel,
        onConfirm,
        onClose,
    } = props;

    const colors = {
        warning: '#D97706',
        success: '#16A34A',
        error: '#DC2626',
        info: '#2563EB',
    };

    const iconMap = {
        warning: 'warning' as const,
        success: 'checkmark-circle' as const,
        error: 'close-circle' as const,
        info: 'information-circle' as const,
    };

    return (
        <Modal
            animationType="fade"
            transparent
            visible={visible}
            onRequestClose={onClose || onCancel}
        >
            <Pressable
                style={styles.overlay}
                onPress={onClose || onCancel}
            >
                <View style={styles.card} onTouchStart={(e) => e.stopPropagation()}>
                    <View style={[styles.iconCircle, { backgroundColor: colors[type] }]}>
                        <Ionicons name={iconMap[type]} size={24} color="#fff" />
                    </View>

                    <Text style={[styles.title, { color: colors[type] }]}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>

                    <View style={styles.buttonRow}>
                        {cancelText && onCancel && (
                            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
                                <Text style={styles.cancelText}>{cancelText}</Text>
                            </TouchableOpacity>
                        )}

                        {onConfirm && (
                            <TouchableOpacity
                                style={[styles.confirmButton, { backgroundColor: colors[type] }]}
                                onPress={onConfirm}
                            >
                                <Text style={styles.confirmText}>{confirmText}</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </Pressable>
        </Modal>
    );
}

// 💅 Styles
const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.25)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        width: 320,
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingVertical: 28,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    iconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    title: {
        fontWeight: '700',
        fontSize: 20,
        marginBottom: 8,
    },
    message: {
        color: '#333',
        textAlign: 'center',
        fontSize: 14,
        marginBottom: 16,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 20,
    },
    cancelButton: {
        backgroundColor: '#F3F4F6',
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 12,
    },
    confirmButton: {
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 12,
    },
    cancelText: {
        color: '#6B7280',
        fontWeight: '600',
    },
    confirmText: {
        color: '#fff',
        fontWeight: '600',
    },
});
