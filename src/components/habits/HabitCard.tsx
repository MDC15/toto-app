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
                            <View style={styles.titleContainer}>
                                <Text style={styles.title}>{title}</Text>
                                <Feather
                                    name={isCheckedIn ? "check-circle" : "circle"}
                                    size={20}
                                    color={isCheckedIn ? "#16a34a" : "#666666"}
                                />
                            </View>

                            <View style={styles.progressBar}>
                                <Animated.View
                                    style={[
                                        styles.progressFill,
                                        { width: progressWidth },
                                    ]}
                                />
                            </View>

                            <View style={styles.percentContainer}>
                                <Text style={styles.percent}>
                                    {Math.round(progress)}%
                                </Text>
                                {progress === 100 && (
                                    <Feather
                                        name="check"
                                        size={18}
                                        color="#16a34a"
                                        style={styles.completedIcon}
                                    />
                                )}
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
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    title: {
        fontSize: 17,
        fontWeight: "600",
        color: "#000000",
        flex: 1,
    },

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
    percentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginTop: 6,
        gap: 4,
    },
    percent: {
        fontSize: 13,
        color: "#000000",
        fontWeight: "600",
    },
    completedIcon: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 2,
    },
});
