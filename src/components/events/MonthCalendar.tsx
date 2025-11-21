import { Colors, responsive } from '@/constants/theme';
import { isSameDay } from '@/utils/dateUtils';
import { Feather } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Dimensions, FlatList, NativeScrollEvent, NativeSyntheticEvent, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

interface Event {
    id: number;
    title: string;
    startTime: Date;
    color: string;
    timeRange: string;
}

interface MonthCalendarProps {
    selectedDate: Date;
    onSelectDate: (date: Date) => void;
    events: Event[];
    onEditEvent?: (eventId: number) => void;
    onDeleteEvent?: (eventId: number) => void;
    onViewEvents?: (date: Date) => void;
}

const MonthCalendar: React.FC<MonthCalendarProps> = React.memo(({
    selectedDate,
    onSelectDate,
    events,
    onEditEvent,
    onDeleteEvent,
    onViewEvents
}) => {
    const scrollViewRef = useRef<ScrollView>(null);
    const [months, setMonths] = useState(() => {
        const base = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
        return [
            new Date(base.getFullYear(), base.getMonth() - 2, 1),
            new Date(base.getFullYear(), base.getMonth() - 1, 1),
            base,
            new Date(base.getFullYear(), base.getMonth() + 1, 1),
            new Date(base.getFullYear(), base.getMonth() + 2, 1),
        ];
    });
    const currentMonth = months[2];

    useEffect(() => {
        const base = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
        setMonths([
            new Date(base.getFullYear(), base.getMonth() - 2, 1),
            new Date(base.getFullYear(), base.getMonth() - 1, 1),
            base,
            new Date(base.getFullYear(), base.getMonth() + 1, 1),
            new Date(base.getFullYear(), base.getMonth() + 2, 1),
        ]);
    }, [selectedDate]);

    useEffect(() => {
        // Scroll to the center month on mount
        setTimeout(() => {
            scrollViewRef.current?.scrollTo({ x: screenWidth * 2, animated: false });
        }, 100);
    }, []);

    // Generate calendar days for a specific month
    const generateCalendarDays = React.useCallback((month: Date) => {
        const year = month.getFullYear();
        const monthIndex = month.getMonth();

        // First day of month
        const firstDay = new Date(year, monthIndex, 1);
        // First day of calendar grid (might be from previous month), starting on Monday
        const dayOfWeek = firstDay.getDay();
        const offset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        const startDate = new Date(firstDay.getTime() - offset * 24 * 60 * 60 * 1000);

        const days = [];
        const current = new Date(startDate);

        // Generate 6 weeks (42 days) to fill the grid
        for (let i = 0; i < 42; i++) {
            days.push(new Date(current));
            current.setDate(current.getDate() + 1);
        }

        return days;
    }, []);

    // Get events for a specific date
    const getEventsForDate = React.useCallback((date: Date) => {
        return events.filter(event => isSameDay(event.startTime, date));
    }, [events]);

    // Navigate months
    const navigateMonth = (direction: 'prev' | 'next') => {
        if (direction === 'prev') {
            setMonths(prev => [
                new Date(prev[0].getFullYear(), prev[0].getMonth() - 1, 1),
                ...prev.slice(0, 4)
            ]);
        } else {
            setMonths(prev => [
                ...prev.slice(1),
                new Date(prev[4].getFullYear(), prev[4].getMonth() + 1, 1)
            ]);
        }
        scrollViewRef.current?.scrollTo({ x: screenWidth * 2, animated: true });
    };

    const goToToday = () => {
        const today = new Date();
        const base = new Date(today.getFullYear(), today.getMonth(), 1);
        setMonths([
            new Date(base.getFullYear(), base.getMonth() - 2, 1),
            new Date(base.getFullYear(), base.getMonth() - 1, 1),
            base,
            new Date(base.getFullYear(), base.getMonth() + 1, 1),
            new Date(base.getFullYear(), base.getMonth() + 2, 1),
        ]);
        onSelectDate(today);
        scrollViewRef.current?.scrollTo({ x: screenWidth * 2, animated: true });
    };

    const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const { contentOffset, layoutMeasurement } = event.nativeEvent;
        const page = Math.round(contentOffset.x / layoutMeasurement.width);
        if (page === 0) {
            // scrolled to prev
            setMonths(prev => [
                new Date(prev[0].getFullYear(), prev[0].getMonth() - 1, 1),
                ...prev.slice(0, 4)
            ]);
            scrollViewRef.current?.scrollTo({ x: layoutMeasurement.width, animated: false });
        } else if (page === 4) {
            // scrolled to next
            setMonths(prev => [
                ...prev.slice(1),
                new Date(prev[4].getFullYear(), prev[4].getMonth() + 1, 1)
            ]);
            scrollViewRef.current?.scrollTo({ x: layoutMeasurement.width * 3, animated: false });
        }
    };

    const isCurrentMonth = (date: Date, month: Date) => {
        return date.getMonth() === month.getMonth() && date.getFullYear() === month.getFullYear();
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return isSameDay(date, today);
    };

    const isSelected = (date: Date) => {
        return isSameDay(date, selectedDate);
    };

    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const cellSize = (screenWidth - 40) / 7; // 7 days, 24 padding on sides
    const cellHeight = cellSize * 1.6; // Make cells taller for events

    return (
        <View style={styles.container}>
            {/* Header with month and navigation */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigateMonth('prev')} style={styles.navButton}>
                    <Feather name="chevron-left" size={24} color="#f97316" />
                </TouchableOpacity>

                <TouchableOpacity onPress={goToToday} style={styles.monthSelector}>
                    <Text style={styles.monthText}>
                        {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigateMonth('next')} style={styles.navButton}>
                    <Feather name="chevron-right" size={24} color="#f97316" />
                </TouchableOpacity>
            </View>

            {/* Day names header */}
            <View style={styles.dayNamesContainer}>
                {dayNames.map(day => (
                    <View key={day} style={[styles.dayNameCell, { width: cellSize, height: 60 }]}>
                        <Text style={styles.dayNameText}>{day}</Text>
                    </View>
                ))}
            </View>

            {/* Calendar grid */}
            <ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={handleScrollEnd}
                style={styles.gridContainer}
            >
                {months.map((month, monthIndex) => (
                    <View key={month.toISOString()} style={styles.monthPage}>
                        <FlatList
                            data={generateCalendarDays(month)}
                            keyExtractor={(item, index) => `${monthIndex}-${index}`}
                            numColumns={7}
                            getItemLayout={(data, index) => ({
                                length: cellHeight,
                                offset: Math.floor(index / 7) * cellHeight,
                                index,
                            })}
                            renderItem={({ item: date, index }) => {
                                const dayEvents = getEventsForDate(date);
                                const inCurrentMonth = isCurrentMonth(date, month);
                                const today = isToday(date);
                                const selected = isSelected(date);

                                return (
                                    <TouchableOpacity
                                        style={[
                                            styles.dayCell,
                                            {
                                                width: cellSize,
                                                height: cellHeight,
                                                opacity: inCurrentMonth ? 1 : 0.3
                                            },
                                            selected && styles.selectedDay,
                                            today && !selected && styles.todayDay,
                                        ]}
                                        onPress={() => onViewEvents ? onViewEvents(date) : onSelectDate(date)}
                                    >
                                        <Text
                                            style={[
                                                styles.dayNumber,
                                                selected && styles.selectedText,
                                                today && !selected && styles.todayText,
                                                !inCurrentMonth && styles.otherMonthText,
                                            ]}
                                        >
                                            {date.getDate()}
                                        </Text>

                                        {/* Events list */}
                                        {dayEvents.length > 0 && (
                                            <View style={styles.eventsList}>
                                                {dayEvents.slice(0, 2).map((event) => (
                                                    <TouchableOpacity
                                                        key={event.id}
                                                        style={[styles.eventItem, { backgroundColor: event.color }]}
                                                        onPress={() => {
                                                            Alert.alert(
                                                                'Event Options',
                                                                `What would you like to do with "${event.title}"?`,
                                                                [
                                                                    { text: 'Cancel', style: 'cancel' },
                                                                    {
                                                                        text: 'Edit',
                                                                        onPress: () => onEditEvent?.(event.id)
                                                                    },
                                                                    {
                                                                        text: 'Delete',
                                                                        style: 'destructive',
                                                                        onPress: () => onDeleteEvent?.(event.id)
                                                                    }
                                                                ]
                                                            );
                                                        }}
                                                    >
                                                        <Text style={styles.eventTitle} numberOfLines={1}>
                                                            {event.title}
                                                        </Text>
                                                    </TouchableOpacity>
                                                ))}
                                                {dayEvents.length > 2 && (
                                                    <Text style={styles.moreEventsText}>
                                                        +{dayEvents.length - 2} more
                                                    </Text>
                                                )}
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                );
                            }}
                            style={styles.grid}
                            contentContainerStyle={styles.gridContent}
                            showsVerticalScrollIndicator={false}
                            showsHorizontalScrollIndicator={false}
                        />
                    </View>
                ))}
            </ScrollView>
        </View>
    );
});

MonthCalendar.displayName = 'MonthCalendar';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: responsive.spacing(16),
        paddingVertical: responsive.spacing(16),
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        backgroundColor: Colors.light.background,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    navButton: {
        padding: responsive.spacing(8),
    },
    monthSelector: {
        flex: 1,
        alignItems: 'center',
    },
    monthText: {
        fontSize: responsive.fontSize(18),
        fontWeight: '600',
        color: Colors.light.text,
    },
    dayNamesContainer: {
        flexDirection: 'row',
        paddingHorizontal: responsive.spacing(24),
        paddingVertical: responsive.spacing(8),
        backgroundColor: '#f9fafb',
    },
    dayNameCell: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    dayNameText: {
        fontSize: responsive.fontSize(12),
        fontWeight: '600',
        color: '#6b7280',
    },
    gridContainer: {
        flex: 1,
    },
    monthPage: {
        width: screenWidth,
        flex: 1,
    },
    grid: {
        paddingVertical: responsive.spacing(8),
    },
    gridContent: {
        paddingHorizontal: responsive.spacing(24),
        justifyContent: 'flex-start',
    },
    dayCell: {
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: responsive.spacing(4),
        margin: 1,
        borderRadius: 8,
        backgroundColor: Colors.light.background,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    selectedDay: {
        backgroundColor: Colors.light.tint,
        borderColor: Colors.light.tint,
    },
    todayDay: {
        borderWidth: 2,
        borderColor: Colors.light.tint,
    },
    dayNumber: {
        fontSize: responsive.fontSize(16),
        fontWeight: '600',
        color: Colors.light.text,
        marginBottom: responsive.spacing(2),
    },
    selectedText: {
        color: '#fff',
    },
    todayText: {
        color: Colors.light.tint,
        fontWeight: 'bold',
    },
    otherMonthText: {
        color: '#9ca3af',
    },
    eventsList: {
        width: '100%',
        alignItems: 'center',
    },
    eventItem: {
        width: '90%',
        paddingHorizontal: responsive.spacing(4),
        paddingVertical: responsive.spacing(2),
        borderRadius: 6,
        marginBottom: responsive.spacing(2),
    },
    eventTitle: {
        fontSize: responsive.fontSize(10),
        color: '#fff',
        fontWeight: '500',
    },
    moreEventsText: {
        fontSize: responsive.fontSize(10),
        color: '#6b7280',
        fontWeight: '500',
    },
});

export default MonthCalendar;