import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Animated, ImageBackground, ImageSourcePropType, StyleSheet, Text, View } from 'react-native';

interface OnboardingPageProps {
    page: {
        id: string;
        image: ImageSourcePropType;
        title: string;
        subtitle: string;
    };
    index: number;
    scrollOffset: Animated.Value;
    position: Animated.Value;
}

export function OnboardingPage({ page, index, scrollOffset, position }: OnboardingPageProps) {
    const inputRange = [index - 1, index, index + 1];

    const opacity = Animated.add(scrollOffset, position).interpolate({
        inputRange,
        outputRange: [0, 1, 0],
        extrapolate: 'clamp',
    });

    const translateY = Animated.add(scrollOffset, position).interpolate({
        inputRange,
        outputRange: [50, 0, 50],
        extrapolate: 'clamp',
    });

    return (
        <View style={styles.container}>
            <ImageBackground
                source={page.image}
                style={styles.imageBackground}
                resizeMode="cover"
            >
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.9)']}
                    style={styles.gradient}
                >
                    <Animated.View
                        style={[
                            styles.textContainer,
                            { opacity, transform: [{ translateY }] },
                        ]}
                    >
                        <Text style={styles.title}>{page.title}</Text>
                        <Text style={styles.subtitle}>{page.subtitle}</Text>
                    </Animated.View>
                </LinearGradient>
            </ImageBackground>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    imageBackground: {
        flex: 1,
        width: '100%',
        height: '100%',
        justifyContent: 'flex-end',
    },
    gradient: {
        flex: 1,
        justifyContent: 'flex-end',
        paddingHorizontal: 24,
        paddingBottom: 100,
    },
    textContainer: {
        alignItems: 'center',
        paddingBottom: 40,
    },
    title: {
        fontSize: 40,
        letterSpacing: 0.25,
        lineHeight: 48,
        marginBottom: 12,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        flexWrap: 'wrap',
    },
    subtitle: {
        fontSize: 18,
        color: '#ddd',
        textAlign: 'center',
        marginTop: 12,
        lineHeight: 24,
    },
});
