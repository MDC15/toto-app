import { Colors, responsive } from '@/constants/theme';
import { isSameDay } from '@/utils/dateUtils';
import { Feather } from '@expo/vector-icons';
// replaced DateTimePicker with custom inline month picker
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
    const monthPickerScrollRef = useRef<FlatList<any> | null>(null);
    const [showMonthPicker, setShowMonthPicker] = useState(false);
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
        // center calendar around selectedDate
        centerCalendar(selectedDate);
    }, [selectedDate]);

    // Keep the initial selected date in a ref so the mount effect doesn't need selectedDate in its deps
    const initialSelectedDateRef = React.useRef<Date>(selectedDate);

    useEffect(() => {
        // Ensure calendar is centered on mount (uses ref to avoid eslint missing-deps)
        setTimeout(() => {
            centerCalendar(initialSelectedDateRef.current);
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

    const goToToday = () => {
        const today = new Date();
        onSelectDate(today);
        centerCalendar(today);
    };


    const monthNamesShort = React.useMemo(() => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], []);

    const generateYears = (centerYear: number, range = 2) => {
        const years = [] as number[];
        for (let y = centerYear - range; y <= centerYear + range; y++) years.push(y);
        return years;
    };

    const PICKER_ITEM_WIDTH = Math.max(64, responsive.width(12));
    const PICKER_HEIGHT = Math.max(56, responsive.spacing(44));

    const buildPickerItems = React.useCallback((centerYear: number, range = 2) => {
        const years = generateYears(centerYear, range);
        const items: any[] = [];
        years.forEach((year) => {
            items.push({ type: 'year', year });
            monthNamesShort.forEach((m, idx) => items.push({ type: 'month', year, idx, label: m }));
        });
        return items;
    }, [monthNamesShort]);

    const pickerItems = React.useMemo(() => buildPickerItems(currentMonth.getFullYear(), 2), [buildPickerItems, currentMonth]);

    // Center the calendar pages around a given date so that the requested month is in the center page
    const centerCalendar = (date: Date) => {
        const base = new Date(date.getFullYear(), date.getMonth(), 1);
        setMonths([
            new Date(base.getFullYear(), base.getMonth() - 2, 1),
            new Date(base.getFullYear(), base.getMonth() - 1, 1),
            base,
            new Date(base.getFullYear(), base.getMonth() + 1, 1),
            new Date(base.getFullYear(), base.getMonth() + 2, 1),
        ]);
        // scroll to center after short delay to give layout time to update
        setTimeout(() => {
            scrollViewRef.current?.scrollTo({ x: screenWidth * 2, animated: true });
        }, 60);
    };

    // (removed legacy individual picker handlers — inline selection is used)

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
    const paddingHorizontal = responsive.spacing(16);
    const cellSize = (screenWidth - paddingHorizontal * 2) / 7;
    // Fixed cell height: consistent calendar size regardless of picker state (like Google Calendar)
    const cellHeight = cellSize * 1.5;
    // Fixed calendar container height: always stable layout, no flex resizing
    const FIXED_CALENDAR_HEIGHT = cellSize * 1.5 * 6; // 6 rows of calendar days

    return (
        <View style={styles.container}>
            {/* Header with month and month picker */}
            <View style={styles.header}>
                <TouchableOpacity onPress={goToToday} style={styles.monthSelector}>
                    <Text style={styles.monthText}>
                        {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => {
                    const willOpen = !showMonthPicker;
                    setShowMonthPicker(willOpen);
                    if (willOpen) {
                        // scroll picker to show current month near center for faster UX
                        const years = generateYears(currentMonth.getFullYear(), 2);
                        const yearIdx = years.indexOf(selectedDate.getFullYear());
                        const monthIdx = selectedDate.getMonth();
                        const itemsPerYear = 13; // 1 label + 12 months
                        const itemIndex = Math.max(0, yearIdx * itemsPerYear + 1 + monthIdx);
                        // wait for layout then scroll the FlatList to center the current month
                        setTimeout(() => {
                            monthPickerScrollRef.current?.scrollToIndex({ index: itemIndex, viewPosition: 0.5 });
                        }, 50);
                    }
                }} style={styles.monthPickerButton}>
                    <Feather name="calendar" size={20} color={Colors.light.text} />
                </TouchableOpacity>
            </View>

            {showMonthPicker && (
                // Inline picker: rendered in-flow so it pushes the calendar down
                <View style={[styles.pickerInlineContainer, { height: PICKER_HEIGHT }] as any}>
                    <View style={[styles.monthPickerContainer, { height: PICKER_HEIGHT }]}>
                        <FlatList
                            ref={monthPickerScrollRef as any}
                            horizontal
                            data={pickerItems}
                            keyExtractor={(_, idx) => String(idx)}
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.monthPickerScrollContent}
                            style={[styles.monthPickerContainer, { height: PICKER_HEIGHT }]}
                            getItemLayout={(_, index) => ({ length: PICKER_ITEM_WIDTH, offset: PICKER_ITEM_WIDTH * index, index })}
                            renderItem={({ item }) => {
                                if (item.type === 'year') {
                                    return (
                                        <View style={[styles.inlineYearLabelContainer, { width: PICKER_ITEM_WIDTH }]}>
                                            <Text style={styles.inlineYearLabel}>{item.year}</Text>
                                        </View>
                                    );
                                }

                                // month item
                                const isSelectedMonth = selectedDate.getFullYear() === item.year && selectedDate.getMonth() === item.idx;
                                return (
                                    <View style={{ width: PICKER_ITEM_WIDTH, alignItems: 'center', justifyContent: 'center' }}>
                                        <TouchableOpacity
                                            style={[styles.monthButtonInline, isSelectedMonth && styles.selectedMonthButton]}
                                            onPress={() => {
                                                // When selecting a month, highlight today's date if it's in that month,
                                                // otherwise highlight the 1st day of the selected month (like Google Calendar).
                                                const today = new Date();
                                                let newDate: Date;
                                                if (today.getFullYear() === item.year && today.getMonth() === item.idx) {
                                                    newDate = new Date(today);
                                                } else {
                                                    newDate = new Date(item.year, item.idx, 1);
                                                }
                                                // Keep the inline month picker open when selecting a month.
                                                // Update the selected date and center the calendar immediately.
                                                onSelectDate(newDate);
                                                centerCalendar(newDate);
                                            }}
                                        >
                                            <Text style={[styles.monthButtonTextInline, isSelectedMonth && styles.selectedMonthText]}>{item.label}</Text>
                                        </TouchableOpacity>
                                    </View>
                                );
                            }}
                        />
                    </View>
                </View>
            )}

            {/* Day names header */}
            <View style={styles.dayNamesContainer}>
                {dayNames.map(day => (
                    <View key={day} style={[styles.dayNameCell, { width: cellSize }]}>
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
                style={[styles.gridContainer, { height: FIXED_CALENDAR_HEIGHT }]}
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
                                            selected && styles.selectedDayCell,
                                        ]}
                                        onPress={() => onViewEvents ? onViewEvents(date) : onSelectDate(date)}
                                    >
                                        <View style={[
                                            styles.dayNumberContainer,
                                            selected && styles.selectedDayNumberContainer,
                                            today && !selected && styles.todayDayNumberContainer
                                        ]}>
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
                                        </View>

                                        {/* Events list */}
                                        {dayEvents.length > 0 && (
                                            <View style={styles.eventsList}>
                                                {dayEvents.slice(0, 3).map((event) => (
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
                                                {dayEvents.length > 3 && (
                                                    <Text style={styles.moreEventsText}>
                                                        +{dayEvents.length - 3}
                                                    </Text>
                                                )}
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                );
                            }}
                            style={styles.grid}
                            contentContainerStyle={[styles.gridContent, { paddingHorizontal }]}
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
        flexDirection: 'column',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: responsive.spacing(16),
        paddingVertical: responsive.spacing(12),
        backgroundColor: Colors.light.background,
    },
    monthPickerButton: {
        padding: responsive.spacing(8),
        borderRadius: 8,
    },
    monthSelector: {
        flex: 1,
        alignItems: 'flex-start',
    },
    monthText: {
        fontSize: responsive.fontSize(18),
        fontWeight: '600',
        color: Colors.light.text,
    },
    dayNamesContainer: {
        flexDirection: 'row',
        paddingHorizontal: responsive.spacing(16),
        paddingVertical: responsive.spacing(8),
        backgroundColor: Colors.light.background,
    },
    dayNameCell: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    dayNameText: {
        fontSize: responsive.fontSize(12),
        fontWeight: '500',
        color: '#9ca3af',
        textTransform: 'uppercase',
    },
    gridContainer: {
        // Use fixed height instead of flex for stable layout
        overflow: 'hidden',
    },
    monthPage: {
        width: screenWidth,
        // Don't use flex; calendar height is controlled by parent
    },
    grid: {
        paddingVertical: responsive.spacing(8),
    },
    gridContent: {
        justifyContent: 'flex-start',
    },
    dayCell: {
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: responsive.spacing(4),
        borderRadius: 12,
    },
    selectedDayCell: {
        backgroundColor: '#fff7ed',
    },
    dayNumberContainer: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: responsive.spacing(4),
    },
    selectedDayNumberContainer: {
        backgroundColor: Colors.light.tint,
    },
    todayDayNumberContainer: {
        backgroundColor: '#f3f4f6',
    },
    dayNumber: {
        fontSize: responsive.fontSize(14),
        fontWeight: '600',
        color: Colors.light.text,
    },
    selectedText: {
        color: '#fff',
    },
    todayText: {
        color: Colors.light.tint,
        fontWeight: '700',
    },
    otherMonthText: {
        color: '#d1d5db',
    },
    eventsList: {
        width: '100%',
        alignItems: 'center',
        paddingHorizontal: 2,
    },
    eventItem: {
        width: '100%',
        paddingHorizontal: responsive.spacing(4),
        paddingVertical: responsive.spacing(2),
        borderRadius: 4,
        marginBottom: responsive.spacing(2),
        flexDirection: 'row',
        alignItems: 'center',
    },
    eventTitle: {
        fontSize: responsive.fontSize(9),
        color: '#fff',
        fontWeight: '600',
    },
    moreEventsText: {
        fontSize: responsive.fontSize(9),
        color: '#9ca3af',
        fontWeight: '600',
        marginTop: 2,
    },
    monthPickerContainer: {
        backgroundColor: '#ffffff',
        paddingHorizontal: responsive.spacing(8),
        paddingVertical: responsive.spacing(2),
        marginBottom: 0,
    },
    pickerInlineContainer: {
        width: '100%',
        backgroundColor: '#ffffff',
        paddingVertical: 0,
    },
    monthPickerScrollContent: {
        alignItems: 'flex-start',
        paddingHorizontal: responsive.spacing(8),
    },
    inlineYearLabelContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: responsive.spacing(8),
    },
    inlineYearLabel: {
        fontSize: responsive.fontSize(13),
        fontWeight: '700',
        color: Colors.light.text,
    },
    monthButtonInline: {
        paddingVertical: responsive.spacing(5),
        paddingHorizontal: responsive.spacing(10),
        borderRadius: 8,
        backgroundColor: '#f9fafb',
        borderWidth: 0,
        marginRight: responsive.spacing(6),
        elevation: 0,
    },
    monthButtonTextInline: {
        fontSize: responsive.fontSize(12),
        color: Colors.light.text,
        fontWeight: '500',
    },
    yearColumn: {
        width: responsive.width(60),
        paddingHorizontal: responsive.spacing(8),
        paddingVertical: responsive.spacing(6),
        borderRightWidth: 1,
        borderRightColor: '#f1f5f9',
    },
    monthsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: responsive.spacing(8),
        marginTop: responsive.spacing(8),
    },
    yearSection: {
        marginBottom: responsive.spacing(12),
    },
    yearLabel: {
        fontSize: responsive.fontSize(13),
        fontWeight: '700',
        color: Colors.light.text,
        marginBottom: responsive.spacing(8),
    },
    monthsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: responsive.spacing(8),
    },
    monthButton: {
        // reduce vertical padding for compact list
        paddingVertical: responsive.spacing(6),
        paddingHorizontal: responsive.spacing(12),
        borderRadius: 12,
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#eef2f6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 2,
        elevation: 1,
    },
    monthButtonText: {
        fontSize: responsive.fontSize(13),
        color: Colors.light.text,
        fontWeight: '600',
    },
    selectedMonthButton: {
        backgroundColor: Colors.light.tint,
        borderColor: Colors.light.tint,
    },
    selectedMonthText: {
        color: '#fff',
    },
});

export default MonthCalendar;