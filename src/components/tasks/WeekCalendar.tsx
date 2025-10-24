import {
    formatShortDate,
    getDayLabel,
    getDayNumber,
    getNow,
    getStartOfWeek,
    getWeekDays,
    isSameDay
} from '@/utils/dateUtils';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';

interface WeekCalendarProps {
    selectedDate: Date;
    onSelectDate: (date: Date) => void;
}

export default function WeekCalendar({ selectedDate, onSelectDate }: WeekCalendarProps) {
    const [currentWeekStart, setCurrentWeekStart] = useState(getStartOfWeek(getNow()));
    const [showCalendar, setShowCalendar] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            const now = getNow();
            const start = getStartOfWeek(now);
            setCurrentWeekStart(start);
        }, 60000);

        return () => clearInterval(timer);
    }, []);

    // Update current week when selected date changes
    useEffect(() => {
        const selectedWeekStart = getStartOfWeek(selectedDate);
        setCurrentWeekStart(selectedWeekStart);
    }, [selectedDate]);

    const days = getWeekDays(currentWeekStart);

    const handleDayPress = (day: DateData) => {
        const newDate = new Date(day.timestamp);
        onSelectDate(newDate);
        setCurrentWeekStart(getStartOfWeek(newDate));
        setShowCalendar(false);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => setCurrentWeekStart(new Date(currentWeekStart.setDate(currentWeekStart.getDate() - 7)))}>
                    <AntDesign name="left" size={24} color="#555" />
                </TouchableOpacity>

                <View style={styles.centerSection}>
                    <TouchableOpacity onPress={() => {
                        const now = getNow();
                        onSelectDate(now);
                        setCurrentWeekStart(getStartOfWeek(now));
                    }}>
                        <Text style={[styles.headerTitle, isSameDay(selectedDate, getNow()) && styles.todaySelected]}>
                            {isSameDay(selectedDate, getNow()) ? 'Today' : formatShortDate(selectedDate)}
                        </Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={() => setShowCalendar(true)} style={styles.calendarButton}>
                    <Ionicons name="calendar-outline" size={24} color="#111" />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setCurrentWeekStart(new Date(currentWeekStart.setDate(currentWeekStart.getDate() + 7)))}>
                    <AntDesign name="right" size={24} color="#555" />
                </TouchableOpacity>
            </View>

            <View style={styles.weekRow}>
                {days.map((day, index) => {
                    const isSelected = isSameDay(day, selectedDate);
                    return (
                        <TouchableOpacity
                            key={index}
                            style={[styles.dayItem, isSelected && styles.selectedDay]}
                            onPress={() => onSelectDate(day)}
                        >
                            <Text style={[styles.dayLabel, isSelected && styles.selectedText]}>
                                {getDayLabel(day)}
                            </Text>
                            <Text style={[styles.dayNumber, isSelected && styles.selectedText]}>
                                {getDayNumber(day)}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            <Modal
                transparent
                animationType="fade"
                visible={showCalendar}
                onRequestClose={() => setShowCalendar(false)}
            >
                <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowCalendar(false)}>
                    <View style={styles.modalContent}>
                        <Calendar
                            current={selectedDate.toISOString().split('T')[0]}
                            onDayPress={handleDayPress}
                            markingType="dot"
                            markedDates={{
                                [selectedDate.toISOString().split('T')[0]]: {
                                    selected: true,
                                    selectedColor: '#f97316',
                                    selectedTextColor: '#fff',
                                },
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
        backgroundColor: '#f7f7f8',
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginVertical: 10,
        width: '95%',
        alignSelf: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        justifyContent: 'space-between',
    },
    centerSection: {
        flex: 1,
        alignItems: 'center',
    },
    calendarButton: {
        marginRight: 16,
        marginLeft: 16,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111',
    },
    todaySelected: {
        color: '#f97316',
        fontWeight: '700',
    },
    weekRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    dayItem: {
        width: 48,
        height: 72,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
    },
    selectedDay: {
        backgroundColor: '#fba834',
    },
    dayLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#555',
    },
    dayNumber: {
        fontSize: 18,
        fontWeight: '700',
        color: '#444',
    },
    selectedText: {
        color: '#fff',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        width: 350,
        height: 420,
    },
});
