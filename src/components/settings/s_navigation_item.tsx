import { ThemedText } from "@/components/themed-text";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface NavigationItemProps {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
    onPress: () => void;
}

export default function NavigationItem({ icon, title, subtitle, onPress }: NavigationItemProps) {
    return (
        <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Ionicons name={icon} size={24} color="#fca131" />
                </View>
                <View style={styles.textContainer}>
                    <ThemedText style={styles.title}>{title}</ThemedText>
                    {subtitle && <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>}
                </View>
                <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#fff",
        borderRadius: 12,
        marginBottom: 8,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 1 },
        elevation: 2,
    },
    content: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: "#F2F2F7",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 16,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 17,
        fontWeight: "400",
        color: "#000",
        marginBottom: 2,
    },
    subtitle: {
        fontSize: 13,
        color: "#8E8E93",
        lineHeight: 16,
    },
});