import { Feather } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import {
    GestureHandlerRootView,
    PanGestureHandler,
} from "react-native-gesture-handler";

interface HabitCardProps {
    title: string;
    progress: number; // 0-100
    color: string;
    isCheckedIn: boolean;
    canCheckIn: boolean;
    startDate?: Date;
    endDate?: Date;
    frequency?: string;
    targetCount?: number;
    completedCount?: number;
    onEdit: () => void;
    onDelete: () => void;
    onCheckIn: () => void;
    onPress?: () => void;
}

// ⚙️ Giới hạn kéo
const SWIPE_MAX = 150; // giới hạn tối đa mỗi bên (card chỉ mở 50%)
const SWIPE_OPEN_LEFT = -SWIPE_MAX; // mở menu
const SWIPE_OPEN_RIGHT = SWIPE_MAX; // hiệu ứng check-in
const SWIPE_THRESHOLD = 70; // ngưỡng quyết định mở / đóng

export default function HabitCard({
    title,
    progress,
    color,
    isCheckedIn,
    canCheckIn,
    startDate,
    endDate,
    frequency = 'daily',
    targetCount = 1,
    completedCount = 0,
    onEdit,
    onDelete,
    onCheckIn,
    onPress,
}: HabitCardProps) {
    const translateX = useRef(new Animated.Value(0)).current;
    const animatedProgress = useRef(new Animated.Value(progress)).current;

    // 🎨 Animate thanh tiến trình
    useEffect(() => {
        Animated.timing(animatedProgress, {
            toValue: progress,
            duration: 600,
            useNativeDriver: false,
        }).start();
    }, [animatedProgress, progress]);

    // 🖐 Gesture move
    const handleGesture = Animated.event(
        [{ nativeEvent: { translationX: translateX } }],
        { useNativeDriver: true }
    );

    // 🧠 Giới hạn vùng kéo
    useEffect(() => {
        translateX.addListener(({ value }) => {
            if (value > SWIPE_MAX) translateX.setValue(SWIPE_MAX);
            if (value < -SWIPE_MAX) translateX.setValue(-SWIPE_MAX);
        });
        return () => translateX.removeAllListeners();
    }, [translateX]);

    // 🏁 Khi thả tay
    const handleRelease = ({ nativeEvent }: any) => {
        const { translationX } = nativeEvent;

        // ✅ Kéo phải để check-in
        if (translationX > SWIPE_THRESHOLD) {
            Animated.timing(translateX, {
                toValue: SWIPE_OPEN_RIGHT,
                duration: 200,
                useNativeDriver: true,
            }).start(() => {
                onCheckIn();
                Animated.spring(translateX, {
                    toValue: 0,
                    useNativeDriver: true,
                }).start();
            });
            return;
        }

        // ✅ Kéo trái để mở menu
        if (translationX < -SWIPE_THRESHOLD) {
            Animated.spring(translateX, {
                toValue: SWIPE_OPEN_LEFT,
                useNativeDriver: true,
            }).start();
        } else {
            // ✅ Trả card về
            Animated.spring(translateX, {
                toValue: 0,
                useNativeDriver: true,
            }).start();
        }
    };

    // 🔄 Tiến trình (progress từ 0-100)
    const progressWidth = animatedProgress.interpolate({
        inputRange: [0, 100],
        outputRange: ["0%", "100%"],
    });

    // 📅 Tính tiến độ theo ngày
    const getDailyProgressText = () => {
        if (!startDate) return '0/1 day';

        const today = new Date();
        const diffTime = today.getTime() - startDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 để tính ngày đầu tiên
        const completedDays = completedCount;

        return `${completedDays}/${diffDays} day${diffDays !== 1 ? 's' : ''}`;
    };

    const getDailyProgressPercentage = () => {
        if (!startDate) return 0;

        const today = new Date();
        const diffTime = today.getTime() - startDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        const completedDays = completedCount;

        return Math.min((completedDays / diffDays) * 100, 100);
    };

    return (
        <GestureHandlerRootView>
            <View style={styles.wrapper}>
                {/* Background actions */}
                <View style={styles.actionsContainer}>
                    <View style={styles.leftActions}>
                        <Feather name="check-circle" size={26} color="#16a34a" />
                        <Text style={styles.actionText}>Check In</Text>
                    </View>

                    <View style={styles.rightActions}>
                        <TouchableOpacity style={styles.actionBtn} onPress={onEdit}>
                            <Feather name="edit-2" size={24} color="#2563eb" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionBtn, { backgroundColor: "#fee2e2" }]}
                            onPress={onDelete}
                        >
                            <Feather name="trash-2" size={24} color="#dc2626" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Foreground card */}
                <PanGestureHandler onGestureEvent={handleGesture} onEnded={handleRelease}>
                    <Animated.View
                        style={[
                            styles.card,
                            {
                                backgroundColor: color,
                                borderLeftColor: '#ffffff',
                                transform: [{ translateX }],
                            },
                        ]}
                    >
                        <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
                            <View style={styles.contentRow}>
                                {/* Checkbox */}
                                <TouchableOpacity
                                    onPress={canCheckIn ? onCheckIn : undefined}
                                    style={[styles.iconButton, !canCheckIn && styles.disabledButton]}
                                    disabled={!canCheckIn}
                                >
                                    <Feather
                                        name={isCheckedIn ? "check-circle" : "circle"}
                                        size={24}
                                        color={isCheckedIn ? "#10b981" : (canCheckIn ? "#9ca3af" : "#d1d5db")}
                                    />
                                </TouchableOpacity>

                                {/* Content */}
                                <View style={styles.texts}>
                                    <Text
                                        style={[styles.title, isCheckedIn && styles.textCompleted]}
                                        numberOfLines={1}
                                    >
                                        {title}
                                    </Text>

                                    {/* Date range and frequency info */}
                                    <View style={styles.dateInfoRow}>
                                        <View style={styles.dateRow}>
                                            <Feather name="calendar" size={14} color="#6b7280" />
                                            <Text style={[styles.dateText, isCheckedIn && styles.textCompletedLight]}>
                                                {startDate?.toLocaleDateString()}{endDate && ` - ${endDate.toLocaleDateString()}`}
                                            </Text>
                                        </View>

                                        <View style={styles.frequencyRow}>
                                            <Feather name="repeat" size={14} color="#6b7280" />
                                            <Text style={[styles.frequencyText, isCheckedIn && styles.textCompletedLight]}>
                                                {frequency} • {completedCount}/{targetCount}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </View>

                            {/* Progress bar */}
                            <View style={styles.progressBar}>
                                <Animated.View
                                    style={[
                                        styles.progressFill,
                                        { width: progressWidth },
                                    ]}
                                />
                            </View>

                            {/* Daily progress bar */}
                            <View style={styles.dailyProgressContainer}>
                                <Text style={styles.dailyProgressLabel}>
                                    {getDailyProgressText()}
                                </Text>
                                <View style={styles.dailyProgressBar}>
                                    <View
                                        style={[
                                            styles.dailyProgressFill,
                                            { width: `${getDailyProgressPercentage()}%` },
                                        ]}
                                    />
                                </View>
                            </View>
                        </TouchableOpacity>
                    </Animated.View>
                </PanGestureHandler>
            </View>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        marginBottom: 16,
        position: "relative",
    },

    // Background actions
    actionsContainer: {
        ...StyleSheet.absoluteFillObject,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 18,
    },
    leftActions: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    rightActions: {
        flexDirection: "row",
        gap: 10,
        padding: 1
    },
    actionBtn: {
        backgroundColor: "#e5e7eb",
        padding: 10,
        borderRadius: 10,
    },
    actionText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#16a34a",
    },

    // Foreground card
    card: {
        padding: 18,
        borderRadius: 12,
        borderLeftWidth: 4,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },

    // Content layout (EventCard-like structure)
    contentRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    iconButton: {
        marginRight: 12,
    },
    disabledButton: {
        opacity: 0.5,
    },
    texts: {
        flex: 1,
    },
    title: {
        fontWeight: "700",
        fontSize: 17,
        color: "#1f2937",
        marginBottom: 2,
    },
    dateInfoRow: {
        marginTop: 4,
    },
    dateRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 2,
    },
    dateText: {
        fontSize: 13,
        color: "#4b5563",
        marginLeft: 6,
    },
    frequencyRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    frequencyText: {
        fontSize: 13,
        color: "#4b5563",
        marginLeft: 6,
    },

    // Progress bar
    progressBar: {
        height: 8,
        borderRadius: 6,
        overflow: "hidden",
        backgroundColor: "rgba(255, 255, 255, 0.3)",
    },
    progressFill: {
        height: "100%",
        borderRadius: 6,
        backgroundColor: "#ffffff",
    },

    // Daily progress bar
    dailyProgressContainer: {
        marginTop: 8,
        paddingHorizontal: 4,
    },
    dailyProgressLabel: {
        fontSize: 11,
        color: "#666666",
        fontWeight: "500",
        marginBottom: 4,
        textAlign: "center",
    },
    dailyProgressBar: {
        height: 4,
        borderRadius: 2,
        overflow: "hidden",
        backgroundColor: "rgba(255, 255, 255, 0.2)",
    },
    dailyProgressFill: {
        height: "100%",
        borderRadius: 2,
        backgroundColor: "rgba(255, 255, 255, 0.8)",
    },

    // Completed states
    textCompleted: {
        textDecorationLine: "line-through",
        color: "#9ca3af",
    },
    textCompletedLight: {
        textDecorationLine: "line-through",
        color: "#d1d5db",
    },
});
