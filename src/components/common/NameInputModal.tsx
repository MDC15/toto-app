import React, { useState } from "react";
import {
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

type NameInputModalProps = {
    visible: boolean;
    onConfirm: (name: string) => void;
    onCancel: () => void;
};

export default function NameInputModal({
    visible,
    onConfirm,
    onCancel,
}: NameInputModalProps) {
    const [name, setName] = useState("");

    const handleConfirm = () => {
        const trimmed = name.trim();
        if (trimmed) {
            onConfirm(trimmed);
            setName("");
        }
    };

    const handleCancel = () => {
        setName("");
        onCancel();
    };

    return (
        <Modal
            animationType="fade"
            transparent
            visible={visible}
            onRequestClose={handleCancel}
        >
            <View style={styles.overlay}>
                <View style={styles.card}>
                    <Text style={styles.title}>What&apos;s your name?</Text>
                    <Text style={styles.subtitle}>
                        Let&apos;s make this app personal!
                    </Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Enter your name"
                        value={name}
                        onChangeText={setName}
                        maxLength={20}
                        autoFocus
                    />

                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={handleCancel}
                        >
                            <Text style={styles.cancelText}>Skip</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.confirmButton,
                                { opacity: name.trim() ? 1 : 0.5 },
                            ]}
                            onPress={handleConfirm}
                            disabled={!name.trim()}
                        >
                            <Text style={styles.confirmText}>Confirm</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.3)",
        justifyContent: "center",
        alignItems: "center",
    },
    card: {
        width: 320,
        backgroundColor: "#fff",
        borderRadius: 20,
        paddingVertical: 28,
        paddingHorizontal: 20,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    title: {
        fontSize: 24,
        fontWeight: "700",
        color: "#FF8C42", // primary cam
        marginBottom: 8,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 16,
        color: "#777",
        marginBottom: 20,
        textAlign: "center",
    },
    input: {
        width: "100%",
        height: 50,
        borderWidth: 2,
        borderColor: "#E8A06B", // viền cam nhẹ
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 18,
        backgroundColor: "#FFF6F0", // nền input nhạt cam
        color: "#333",
        marginBottom: 20,
    },
    buttonRow: {
        flexDirection: "row",
        gap: 12,
    },
    cancelButton: {
        backgroundColor: "#F3F4F6",
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
        flex: 1,
        alignItems: "center",
    },
    confirmButton: {
        backgroundColor: "#fd9b1bff", // primary cam
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
        flex: 1,
        alignItems: "center",
    },
    cancelText: {
        color: "#6B7280",
        fontWeight: "600",
        fontSize: 16,
    },
    confirmText: {
        color: "#fff",
        fontWeight: "800",
        fontSize: 16,
    },
});
