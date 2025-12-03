import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { responsive } from '@/constants/theme';

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
        borderRadius: responsive.spacing(16),
        padding: responsive.spacing(16),
        width: responsive.width(52),
        height: responsive.height(16),
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
    },
    title: {
        color: '#fff',
        fontSize: responsive.fontSize(18),
        fontWeight: 'bold',
        lineHeight: responsive.fontSize(22),
    },
    subtitle: {
        color: '#f8fafc',
        fontSize: responsive.fontSize(14),
        opacity: 0.9,
    },
});
