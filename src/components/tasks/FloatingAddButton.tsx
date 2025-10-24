import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

interface FloatingAddButtonProps {
    onPress: () => void;
}

const FloatingAddButton = ({ onPress }: FloatingAddButtonProps) => {
    return (
        <TouchableOpacity style={styles.button} onPress={onPress}>
            <Feather name="plus" size={26} color="#fff" />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        position: "absolute",
        bottom: 30,
        right: 25,
        backgroundColor: "#f97316",
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
});

export default FloatingAddButton;