import { getNow } from '@/utils/dateUtils';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import AntDesign from '@expo/vector-icons/AntDesign';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Calendar, DateData, LocaleConfig } from 'react-native-calendars';
import { responsive } from '@/constants/theme';

// English locale configuration
LocaleConfig.locales['en'] = {
    monthNames: [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ],
    monthNamesShort: [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ],
    dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
};
LocaleConfig.defaultLocale = 'en';

const TODAY = getNow();
const TODAY_STRING = TODAY.toISOString().split('T')[0];

interface CalendarCardProps {
    onDateSelect?: (date: Date) => void;
}

export default function CalendarCard({ onDateSelect }: CalendarCardProps) {
    const [selectedDate, setSelectedDate] = useState(TODAY_STRING);
    const [currentDate, setCurrentDate] = useState<Date>(TODAY);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const handleDayPress = (day: DateData) => {
        const newDate = new Date(day.dateString);
        setSelectedDate(day.dateString);
        setCurrentDate(newDate);
        if (onDateSelect) {
            onDateSelect(newDate);
        }
    };

    const handleDatePickerChange = (_event: any, newDate?: Date) => {
        if (Platform.OS === 'android') setShowDatePicker(false);
        if (newDate) {
            setCurrentDate(newDate);
            setSelectedDate(newDate.toISOString().split('T')[0]);
            if (onDateSelect) {
                onDateSelect(newDate);
            }
        }
    };

    const handleDatePickerClose = () => setShowDatePicker(false);

    const markedDates: { [key: string]: any } = {
        [selectedDate]: {
            selected: true,
            selectedColor: '#f97316',
            selectedTextColor: '#fff',
        },
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.monthText}>
                    <FontAwesome5 name="calendar-alt" size={24} color="#111" />
                    {" "} Calendar</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                    <Ionicons name="calendar-number-outline" size={24} color="#111" />
                </TouchableOpacity>
            </View>

            {/* Date Picker */}
            {showDatePicker && (
                Platform.OS === 'ios' ? (
                    <Modal
                        transparent
                        animationType="slide"
                        visible={showDatePicker}
                        onRequestClose={handleDatePickerClose}
                    >
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContent}>
                                <View style={styles.modalHeader}>
                                    <TouchableOpacity onPress={handleDatePickerClose}>
                                        <Text style={styles.modalButton}>Done</Text>
                                    </TouchableOpacity>
                                </View>
                                <DateTimePicker
                                    value={currentDate}
                                    mode="date"
                                    display="spinner"
                                    onChange={handleDatePickerChange}
                                    locale="en"
                                    textColor="#000"
                                />
                            </View>
                        </View>
                    </Modal>
                ) : (
                    <DateTimePicker
                        value={currentDate}
                        mode="date"
                        display="spinner"
                        onChange={handleDatePickerChange}
                        locale="en"
                    />
                )
            )}

            {/* Calendar */}
            <Calendar
                current={selectedDate}
                onDayPress={handleDayPress}
                markingType="dot"
                markedDates={markedDates}
                enableSwipeMonths
                hideExtraDays={false}
                renderArrow={(direction) => (
                    <AntDesign
                        name={direction === 'left' ? 'left' : 'right'}
                        size={18}
                        color="#111827"
                    />
                )}
                theme={{
                    backgroundColor: '#fff',
                    calendarBackground: '#fff',
                    selectedDayBackgroundColor: '#f97316',
                    todayTextColor: '#e76f51',
                    arrowColor: '#111827',
                    monthTextColor: '#111827',
                    textDayFontSize: 16,
                    textMonthFontSize: 18,
                    textMonthFontWeight: 'bold',
                }}
                style={styles.calendar}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: responsive.height(50), // Responsive height
        backgroundColor: '#fff',
        padding: responsive.spacing(16),
        borderRadius: responsive.spacing(16),
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        marginVertical: responsive.spacing(16),
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: responsive.spacing(12),
    },
    monthText: {
        fontSize: responsive.fontSize(20),
        fontWeight: '600',
        color: '#374151',
    },
    calendar: {
        borderRadius: responsive.spacing(12),
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: responsive.spacing(20),
        borderTopRightRadius: responsive.spacing(20),
        paddingBottom: responsive.spacing(20),
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: responsive.spacing(16),
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    modalButton: {
        fontSize: responsive.fontSize(17),
        fontWeight: '600',
        color: '#f97316',
    },
});
