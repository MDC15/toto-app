import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface StatCardProps {
    title: string;
    value: string;
    icon: string;
}

export default function StatCard({ title, value, icon }: StatCardProps) {
    return (
        <View style={styles.card}>
            <View style={styles.iconContainer}>
                <Feather name={icon as any} size={24} color="#f97316" />
            </View>
            <View style={styles.texts}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.value}>{value}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#fff",
        padding: 14,
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        flexDirection: "row",
        alignItems: "center",
    },
    iconContainer: {
        marginRight: 12,
    },
    texts: {
        flex: 1,
    },
    title: {
        fontSize: 14,
        color: "#444",
    },
    value: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#111",
    },
});
