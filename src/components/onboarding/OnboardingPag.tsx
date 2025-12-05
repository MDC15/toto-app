import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

export const OnboardingPage = ({ page }: any) => {
    return (
        <View style={[styles.container, { backgroundColor: page.backgroundColor }]}>
            <Image source={page.image} style={styles.image} resizeMode="contain" />

            <View style={{ marginTop: 48, alignItems: "center" }}>
                <Text style={styles.titleBold}>{page.titleBold}</Text>
                <Text style={styles.title}>{page.title}</Text>
                <Text style={styles.subtitle}>{page.subtitle}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 30,
        justifyContent: "center",
        alignItems: "center",
    },

    image: {
        width: 250,
        height: 250,
    },

    titleBold: {
        fontFamily: "Roboto",
        fontSize: 36,
        lineHeight: 45,
        fontWeight: "bold",
        color: "#333",
        textAlign: "center",
    },
    title: {
        fontFamily: "Roboto",
        fontSize: 30,
        lineHeight: 36,
        fontWeight: "bold",
        color: "#ff9800",
        textAlign: "center",
        marginTop: 4,
    },
    subtitle: {
        fontFamily: "Roboto",
        marginTop: 16,
        fontSize: 18,
        fontWeight: "400",
        lineHeight: 24,
        color: "#666",
        textAlign: "center",
    },
});
