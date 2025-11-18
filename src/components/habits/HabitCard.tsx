import { formatShortDate } from "@/utils/dateUtils";
import { Feather } from "@expo/vector-icons";
import React, { useEffect, useRef, memo, useCallback, useMemo } from "react";
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
    color: string;
    isCheckedIn: boolean;
    canCheckIn: boolean;
    startDate?: Date | string;
    endDate?: Date | string;
    frequency?: string;
    targetCount?: number;
    completedCount?: number;
    totalDaysInPeriod?: number;
    onEdit: () => void;
    onDelete: () => void;
    onCheckIn: () => void;
    onPress?: () => void;
}

// Utility functions (not memoized since they're pure functions)
const parseDate = (dateValue: Date | string | undefined): Date | null => {
    if (!dateValue) return null;
    if (dateValue instanceof Date) return dateValue;
    if (typeof dateValue === "string") {
        try {
            if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
                const [y, m, d] = dateValue.split("-").map(Number);
                return new Date(y, m - 1, d);
            }
            return new Date(dateValue);
        } catch {
            return null;
        }
    }
    return null;
};

const formatHabitDate = (dateValue: Date | string | undefined): string => {
    const parsed = parseDate(dateValue);
    if (!parsed) return "No start date";
    return formatShortDate(parsed);
};

const SWIPE_MAX = 150;
const SWIPE_OPEN_LEFT = -SWIPE_MAX;
const SWIPE_OPEN_RIGHT = SWIPE_MAX;
const SWIPE_THRESHOLD = 70;

const HabitCard: React.FC<HabitCardProps> = memo(({
    title,
    color,
    isCheckedIn,
    canCheckIn,
    startDate,
    endDate,
    frequency = "daily",
    targetCount = 1,
    completedCount = 0,
    totalDaysInPeriod,
    onEdit,
    onDelete,
    onCheckIn,
    onPress,
}) => {
    const translateX = useRef(new Animated.Value(0)).current;

    // Memoized handlers to prevent re-renders
    const handleGesture = useCallback(
        Animated.event(
            [{ nativeEvent: { translationX: translateX } }],
            { useNativeDriver: true }
        ),
        [translateX]
    );

    useEffect(() => {
        const listenerId = translateX.addListener(({ value }) => {
            if (value > SWIPE_MAX) translateX.setValue(SWIPE_MAX);
            if (value < -SWIPE_MAX) translateX.setValue(-SWIPE_MAX);
        });

        return () => translateX.removeListener(listenerId);
    }, [translateX]);

    const handleRelease = useCallback(({ nativeEvent }: any) => {
        const { translationX } = nativeEvent;

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

        if (translationX < -SWIPE_THRESHOLD) {
            Animated.spring(translateX, {
                toValue: SWIPE_OPEN_LEFT,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.spring(translateX, {
                toValue: 0,
                useNativeDriver: true,
            }).start();
        }
    }, [onCheckIn, translateX]);

    const getDailyProgressText = useCallback(() => {
        const total = totalDaysInPeriod || 1;
        const done = completedCount;
        return `${done}/${total} day${total !== 1 ? "s" : ""}`;
    }, [totalDaysInPeriod, completedCount]);

    const getDailyProgressPercentage = useCallback(() => {
        const total = totalDaysInPeriod || 1;
        const done = completedCount;
        return Math.min((done / total) * 100, 100);
    }, [totalDaysInPeriod, completedCount]);

    // Memoized button handlers
    const handleEdit = useCallback(() => onEdit(), [onEdit]);
    const handleDelete = useCallback(() => onDelete(), [onDelete]);
    const handleCheckIn = useCallback(() => {
        if (canCheckIn) onCheckIn();
    }, [canCheckIn, onCheckIn]);
    const handlePress = useCallback(() => onPress?.(), [onPress]);

    // Memoized date formatting
    const formattedStartDate = useMemo(() => formatHabitDate(startDate), [startDate]);
    const formattedEndDate = useMemo(() => endDate ? formatHabitDate(endDate) : null, [endDate]);
    const dateRange = formattedEndDate ? `${formattedStartDate} - ${formattedEndDate}` : formattedStartDate;

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
                        <TouchableOpacity style={styles.actionBtn} onPress={handleEdit}>
                            <Feather name="edit-2" size={24} color="#2563eb" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionBtn, { backgroundColor: "#fee2e2" }]}
                            onPress={handleDelete}
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
                                borderLeftColor: "#ffffff",
                                transform: [{ translateX }],
                            },
                        ]}
                    >
                        <TouchableOpacity activeOpacity={0.85} onPress={handlePress}>
                            <View style={styles.contentRow}>
                                <TouchableOpacity
                                    onPress={handleCheckIn}
                                    style={[styles.iconButton, !canCheckIn && styles.disabledButton]}
                                    disabled={!canCheckIn}
                                >
                                    <Feather
                                        name={isCheckedIn ? "check-circle" : "circle"}
                                        size={24}
                                        color={
                                            isCheckedIn
                                                ? "#10b981"
                                                : canCheckIn
                                                    ? "#9ca3af"
                                                    : "#d1d5db"
                                        }
                                    />
                                </TouchableOpacity>

                                <View style={styles.texts}>
                                    <Text
                                        style={[styles.title, isCheckedIn && styles.textCompleted]}
                                        numberOfLines={1}
                                    >
                                        {title}
                                    </Text>

                                    <View style={styles.dateInfoRow}>
                                        <View style={styles.dateRow}>
                                            <Feather name="calendar" size={14} color="#6b7280" />
                                            <Text
                                                style={[
                                                    styles.dateText,
                                                    isCheckedIn && styles.textCompletedLight,
                                                ]}
                                            >
                                                {dateRange}
                                            </Text>
                                        </View>

                                        <View style={styles.frequencyRow}>
                                            <Feather name="repeat" size={14} color="#6b7280" />
                                            <Text
                                                style={[
                                                    styles.frequencyText,
                                                    isCheckedIn && styles.textCompletedLight,
                                                ]}
                                            >
                                                {frequency} • {completedCount}/{targetCount}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </View>

                            {/* Daily progress only */}
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
});

HabitCard.displayName = 'HabitCard';

export default HabitCard;

const styles = StyleSheet.create({
    wrapper: { marginBottom: 16, position: "relative" },
    actionsContainer: {
        ...StyleSheet.absoluteFillObject,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 18,
    },
    leftActions: { flexDirection: "row", alignItems: "center", gap: 8 },
    rightActions: { flexDirection: "row", gap: 10, padding: 1 },
    actionBtn: {
        backgroundColor: "#e5e7eb",
        padding: 10,
        borderRadius: 10,
    },
    actionText: { fontSize: 16, fontWeight: "600", color: "#16a34a" },
    card: {
        padding: 18,
        borderRadius: 12,
        borderLeftWidth: 4,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    contentRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
    iconButton: { marginRight: 12 },
    disabledButton: { opacity: 0.5 },
    texts: { flex: 1 },
    title: { fontWeight: "700", fontSize: 17, color: "#1f2937", marginBottom: 2 },
    dateInfoRow: { marginTop: 4 },
    dateRow: { flexDirection: "row", alignItems: "center", marginBottom: 2 },
    dateText: { fontSize: 13, color: "#4b5563", marginLeft: 6 },
    frequencyRow: { flexDirection: "row", alignItems: "center" },
    frequencyText: { fontSize: 13, color: "#4b5563", marginLeft: 6 },
    dailyProgressContainer: { marginTop: 4, paddingHorizontal: 4 },
    dailyProgressLabel: {
        fontSize: 11,
        color: "#666",
        fontWeight: "500",
        marginBottom: 4,
        textAlign: "center",
    },
    dailyProgressBar: {
        height: 5,
        borderRadius: 3,
        overflow: "hidden",
        backgroundColor: "rgba(255,255,255,0.3)",
    },
    dailyProgressFill: {
        height: "100%",
        borderRadius: 3,
        backgroundColor: "#fff",
    },
    textCompleted: { textDecorationLine: "line-through", color: "#9ca3af" },
    textCompletedLight: { textDecorationLine: "line-through", color: "#d1d5db" },
});
