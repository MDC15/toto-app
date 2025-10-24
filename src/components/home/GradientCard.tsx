import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

interface GradientCardProps {
    title: string;
    subtitle1?: string;
    subtitle2?: string;
    colors?: readonly [string, string];
    style?: ViewStyle;
    onPress?: () => void;
}

export default function GradientCard({
    title,
    subtitle1,
    subtitle2,
    colors = ['#f97316', '#facc15'] as const,
    style,
    onPress,
}: GradientCardProps) {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
        };
    });

    const handlePressIn = () => {
        scale.value = withSpring(0.97);
    };

    const handlePressOut = () => {
        scale.value = withSpring(1);
    };

    return (
        <Animated.View style={[animatedStyle, style]}>
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
            >
                <LinearGradient colors={colors} style={styles.card}>
                    <Text style={styles.title} numberOfLines={2}>
                        {title}
                    </Text>
                    {subtitle1 && (
                        <Text style={styles.subtitle}>{subtitle1}</Text>
                    )}
                    {subtitle2 && (
                        <Text style={[styles.subtitle, { marginTop: 4 }]}>
                            {subtitle2}
                        </Text>
                    )}
                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 10,
        padding: 16,
        width: 220,
        height: 120,
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },
    title: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        lineHeight: 22,
    },
    subtitle: {
        color: '#f8fafc',
        fontSize: 14,
        opacity: 0.9,
    },
});
