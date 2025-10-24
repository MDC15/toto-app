import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
    useAnimatedProps,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";
import { Circle, Svg } from "react-native-svg";

interface ProgressCardProps {
    date: string;
    progress: number; // 0 - 1
    completed: number;
    total: number;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function ProgressCard({
    date,
    progress,
    completed,
    total,
}: ProgressCardProps) {
    const radius = 35;
    const strokeWidth = 8;
    const circumference = 2 * Math.PI * radius;

    // Animate progress value
    const animatedProgress = useSharedValue(progress);

    useEffect(() => {
        animatedProgress.value = withTiming(progress, { duration: 800 });
    }, [animatedProgress, progress]);

    // Animated circle props
    const animatedProps = useAnimatedProps(() => {
        const strokeDashoffset =
            circumference - animatedProgress.value * circumference;
        return { strokeDashoffset };
    });

    // ✨ Lời động viên theo tiến độ
    const message = useMemo(() => {
        if (progress <= 0.1) return "Let’s get started! 🚀";
        if (progress <= 0.3) return "Good start! Keep it going 💪";
        if (progress <= 0.5) return "Halfway there! You can do it 🔥";
        if (progress <= 0.7) return "You’re doing great! Keep pushing 🌟";
        if (progress <= 0.9) return "Almost done! Don’t stop now ⚡";
        return "You crushed it! 🎉";
    }, [progress]);

    return (
        <LinearGradient
            colors={["#f97316", "#facc15"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
        >
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.dateText}>{date}</Text>
                <Text style={styles.messageText}>{message}</Text>
            </View>

            {/* Progress */}
            <View style={styles.progressRow}>
                <View style={styles.circleWrapper}>
                    <Svg width={90} height={90}>
                        {/* Background */}
                        <Circle
                            stroke="#fff"
                            fill="none"
                            cx="45"
                            cy="45"
                            r={radius}
                            strokeWidth={strokeWidth}
                            opacity={0.2}
                        />
                        {/* Animated foreground */}
                        <AnimatedCircle
                            stroke="#fff"
                            fill="none"
                            cx="45"
                            cy="45"
                            r={radius}
                            strokeWidth={strokeWidth}
                            strokeDasharray={circumference}
                            animatedProps={animatedProps}
                            strokeLinecap="round"
                            transform="rotate(-90 45 45)"
                        />
                    </Svg>

                    <View style={styles.progressTextWrapper}>
                        <Text style={styles.percentText}>
                            {Math.round(progress * 100)}%
                        </Text>
                    </View>
                </View>

                <View style={styles.textBlock}>
                    <Text style={styles.progressLabel}>Your progress</Text>
                    <Text style={styles.taskText}>
                        {completed} of {total} tasks completed
                    </Text>
                </View>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 12,
        padding: 18,
        marginHorizontal: 16,
        marginTop: 12,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
        elevation: 4,
    },
    header: {
        marginBottom: 12,
    },
    dateText: {
        fontSize: 17,
        fontWeight: "700",
        color: "#fff",
    },
    messageText: {
        fontSize: 15,
        color: "#fff",
        opacity: 0.95,
        marginTop: 4,
    },
    progressRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    circleWrapper: {
        position: "relative",
        justifyContent: "center",
        alignItems: "center",
    },
    progressTextWrapper: {
        position: "absolute",
        top: 32,
        left: 0,
        right: 0,
        alignItems: "center",
    },
    percentText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#fff",
    },
    textBlock: {
        flex: 1,
        marginLeft: 18,
    },
    progressLabel: {
        color: "#fff",
        fontSize: 15,
        opacity: 0.9,
        marginBottom: 4,
    },
    taskText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 15,
    },
});
