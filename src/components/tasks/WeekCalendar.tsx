import {
    formatShortDate,
    getDayLabel,
    getDayNumber,
    getNow,
    getStartOfWeek,
    getWeekDays,
    isSameDay,
} from '@/utils/dateUtils';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    Modal,
    NativeScrollEvent,
    NativeSyntheticEvent,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';

interface WeekCalendarProps {
    selectedDate: Date;
    onSelectDate: (date: Date) => void;
}

export default function WeekCalendar({ selectedDate, onSelectDate }: WeekCalendarProps) {
    const WEEK_WIDTH = 300; // chiều rộng mỗi tuần để scroll mượt
    const scrollViewRef = useRef<ScrollView>(null);
    const [showCalendar, setShowCalendar] = useState(false);
    const [weekOffset, setWeekOffset] = useState(0); // offset tuần so với hiện tại
    const baseWeekStart = useMemo(() => getStartOfWeek(getNow()), []);

    /** Đồng bộ tuần mỗi khi chọn ngày mới */
    useEffect(() => {
        const nowWeek = getStartOfWeek(getNow());
        const selectedWeek = getStartOfWeek(selectedDate);
        const diffWeeks =
            Math.round(
                (selectedWeek.getTime() - nowWeek.getTime()) /
                (7 * 24 * 3600 * 1000)
            );
        setWeekOffset(diffWeeks);
    }, [selectedDate]);

    /** Cuộn đến tuần tương ứng */
    useEffect(() => {
        requestAnimationFrame(() => {
            scrollViewRef.current?.scrollTo({
                x: (weekOffset + 20) * WEEK_WIDTH,
                animated: true,
            });
        });
    }, [weekOffset]);

    /** Sinh danh sách tuần (40 tuần = 20 trước + 20 sau) */
    const weeks = useMemo(() => {
        const arr: Date[] = [];
        const start = new Date(baseWeekStart);
        start.setDate(start.getDate() - 7 * 20);
        for (let i = 0; i < 41; i++) {
            arr.push(new Date(start));
            start.setDate(start.getDate() + 7);
        }
        return arr;
    }, [baseWeekStart]);

    /** Khi cuộn xong, cập nhật offset tuần mới */
    const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / WEEK_WIDTH);
        const newOffset = index - 20; // 20 tuần trước là mốc 0
        setWeekOffset(newOffset);
    };

    /** Chọn ngày trong tuần */
    const handleDaySelect = (day: Date) => {
        onSelectDate(day);
    };

    /** Chọn ngày trong modal lịch */
    const handleCalendarDayPress = (day: DateData) => {
        const newDate = new Date(day.timestamp);
        onSelectDate(newDate);
        const selectedWeek = getStartOfWeek(newDate);
        const nowWeek = getStartOfWeek(getNow());
        const diffWeeks =
            Math.round(
                (selectedWeek.getTime() - nowWeek.getTime()) /
                (7 * 24 * 3600 * 1000)
            );
        setWeekOffset(diffWeeks);
        setShowCalendar(false);
    };

    /** Render từng tuần */
    const renderWeek = (weekStart: Date, index: number) => {
        const days = getWeekDays(weekStart);
        return (
            <View key={index} style={styles.weekContainer}>
                <View style={styles.weekRow}>
                    {days.map((day, i) => {
                        const isSelected = isSameDay(day, selectedDate);
                        const isToday = isSameDay(day, getNow());
                        const isHighlighted = isSelected || isToday;

                        return (
                            <TouchableOpacity
                                key={i}
                                onPress={() => handleDaySelect(day)}
                                activeOpacity={0.8}
                                style={[
                                    styles.dayItem,
                                    isSelected && styles.selectedDay,
                                    !isSelected && isToday && styles.todayHighlight,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.dayLabel,
                                        isHighlighted && styles.highlightText,
                                    ]}
                                >
                                    {getDayLabel(day)}
                                </Text>
                                <Text
                                    style={[
                                        styles.dayNumber,
                                        isHighlighted && styles.highlightText,
                                    ]}
                                >
                                    {getDayNumber(day)}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => setWeekOffset((prev) => prev - 1)}
                >
                    <AntDesign name="left" size={22} color="#555" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.centerSection}
                    onPress={() => {
                        setWeekOffset(0);
                        onSelectDate(getNow());
                    }}
                >
                    <Text
                        style={[
                            styles.headerTitle,
                            isSameDay(selectedDate, getNow()) &&
                            styles.todaySelected,
                        ]}
                    >
                        {isSameDay(selectedDate, getNow())
                            ? 'Today'
                            : formatShortDate(selectedDate)}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setShowCalendar(true)}
                    style={styles.calendarButton}
                >
                    <Ionicons name="calendar-outline" size={22} color="#111" />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setWeekOffset((prev) => prev + 1)}
                >
                    <AntDesign name="right" size={22} color="#555" />
                </TouchableOpacity>
            </View>

            {/* Week Scroll */}
            <ScrollView
                ref={scrollViewRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={WEEK_WIDTH}
                decelerationRate="fast"
                bounces
                onMomentumScrollEnd={handleScrollEnd}
                scrollEventThrottle={16}
                contentOffset={{ x: (weekOffset + 20) * WEEK_WIDTH, y: 0 }}
                contentContainerStyle={styles.weeksScrollContent}
            >
                {weeks.map(renderWeek)}
            </ScrollView>

            {/* Calendar Modal */}
            <Modal transparent animationType="fade" visible={showCalendar}>
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPressOut={() => setShowCalendar(false)}
                >
                    <View style={styles.modalContent}>
                        <Calendar
                            current={selectedDate.toISOString().split('T')[0]}
                            onDayPress={handleCalendarDayPress}
                            markedDates={{
                                [selectedDate.toISOString().split('T')[0]]: {
                                    selected: true,
                                    selectedColor: '#f97316',
                                    selectedTextColor: '#fff',
                                },
                            }}
                            theme={{
                                todayTextColor: '#f97316',
                                arrowColor: '#f97316',
                                textSectionTitleColor: '#333',
                            }}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 10,
        marginVertical: 10,
        width: '95%',
        alignSelf: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    centerSection: { flex: 1, alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '600', color: '#111' },
    todaySelected: { color: '#f97316', fontWeight: '700' },
    calendarButton: { marginHorizontal: 10 },
    weeksScrollContent: { paddingVertical: 6 },
    weekContainer: { width: 300, paddingHorizontal: 8 },
    weekRow: { flexDirection: 'row', justifyContent: 'space-between' },
    dayItem: {
        width: 38,
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        backgroundColor: '#f8f8f8',
    },
    selectedDay: { backgroundColor: '#f97316' },
    todayHighlight: {
        borderWidth: 2,
        borderColor: '#f97316',
        backgroundColor: '#fff',
    },
    dayLabel: { fontSize: 12, fontWeight: '600', color: '#555' },
    dayNumber: { fontSize: 16, fontWeight: '700', color: '#444' },
    highlightText: { color: '#fff' },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 18,
        width: 340,
        height: 400,
        elevation: 5,
    },
});
