import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

export const LastOnboardingPage = () => {
    return (
        <View style={styles.container}>
            <View style={styles.textContainer}>
                <Text style={styles.title}>Track your progress & stay motivated</Text>
                <Text style={styles.subtitle}>
                    View daily, weekly, and monthly reports to understand and improve your performance.
                </Text>
            </View>
            <Image
                source={require("../../../assets/images/onboarding/ob5.png")}
                style={styles.image}
                resizeMode="contain"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center", // Align content to the center
        alignItems: "center",
        backgroundColor: "#fefefe",
        paddingBottom: 20, // Reduced padding to allow text to move up
    },
    textContainer: {
        alignItems: "center",
        paddingHorizontal: 25,
        marginBottom: 20, // Reduced margin to move text up
    },
    title: {
        fontSize: 34, // Increased font size
        fontWeight: "800", // Bolder
        color: "#222", // Darker color for prominence
        textAlign: "center",
        marginBottom: 15, // More space below title
        lineHeight: 40, // Improved line spacing
    },
    subtitle: {
        fontSize: 19, // Increased font size
        color: "#555", // Slightly darker subtitle
        textAlign: "center",
        lineHeight: 28, // Improved line spacing
    },
    image: {
        marginTop: 30,
        width: "80%", // Make image smaller
        height: "40%", // Make image smaller
    },
});
