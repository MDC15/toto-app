import React from "react";
import { StyleSheet, Text, View } from "react-native";
import AddButton from "./AddButton";

interface EmptyStateProps {
    message: string;
    buttonText?: string;
    onButtonPress?: () => void;
}

export default function EmptyState({ message, buttonText, onButtonPress }: EmptyStateProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.message}>{message}</Text>
            {buttonText && buttonText.trim() !== '' && (
                <AddButton label={buttonText} onPress={onButtonPress || (() => {})} />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
    },
    message: {
        fontSize: 16,
        color: "#888",
        marginBottom: 20,
    },
});
