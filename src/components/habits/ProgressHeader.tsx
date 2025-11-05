import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
    title: string;
    subtitle: string;
    progress: number;
};

export default function ProgressHeader({ title, subtitle, progress }: Props) {
    return (
        <LinearGradient
            colors={["#FF8C42", "#FF5E62"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.container}
        >
            {/* 🏷️ Tiêu đề */}
            <Text style={styles.title}>{title}</Text>

            {/* 📊 Subtitle + phần trăm */}
            <View style={styles.row}>
                <Text style={styles.subtitle}>{subtitle}</Text>
                <Text style={styles.percent}>{progress}%</Text>
            </View>

            {/* 🔸 Thanh tiến trình */}
            <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { width: `${progress}%` }]} />
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 12,
        marginHorizontal: 16,
        marginTop: -30,
        marginBottom: 16,
        padding: 16,
        backgroundColor: "#FF8C42",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,

        // Layout
        flexDirection: "column",
        justifyContent: "center",
        gap: 8,
    },
    title: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 18,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 4,
    },
    subtitle: {
        color: "rgba(255,255,255,0.9)",
        fontSize: 14,
    },
    percent: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 14,
    },
    progressContainer: {
        height: 6,
        backgroundColor: "rgba(255,255,255,0.3)",
        borderRadius: 3,
        marginTop: 10,
    },
    progressBar: {
        height: "100%",
        backgroundColor: "#fff",
        borderRadius: 3,
    },
});
