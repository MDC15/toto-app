import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

interface AddButtonProps {
    label: string;
    onPress: () => void;
}

export default function AddButton({ label, onPress }: AddButtonProps) {
    return (
        <TouchableOpacity style={styles.btn} onPress={onPress}>
            <Text style={styles.text}>{label}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    btn: {
        backgroundColor: "#f97316",
        paddingVertical: 15,
        paddingHorizontal: 30,
        marginTop: 20,
        borderRadius: 15,
        alignItems: "center",
    },
    text: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
});
