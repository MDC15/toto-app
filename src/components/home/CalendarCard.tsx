import { responsive } from "@/constants/theme";
import { getNow } from "@/utils/dateUtils";
import { FontAwesome5 } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useMemo, useState } from "react";
import {
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { Calendar, DateData, LocaleConfig } from "react-native-calendars";

// 📅 Locale setup
LocaleConfig.locales["en"] = {
    monthNames: [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
    ],
    monthNamesShort: [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ],
    dayNames: [
        "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
    ],
    dayNamesShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
};
LocaleConfig.defaultLocale = "en";

const TODAY = getNow();
const TODAY_STRING = TODAY.toISOString().split("T")[0];
const { width } = Dimensions.get("window");

interface CalendarCardProps {
    onDateSelect?: (date: Date) => void;
    markedData?: { date: string; color?: string }[];
}

export default function CalendarCard({ onDateSelect, markedData = [] }: CalendarCardProps) {
    const [selectedDate, setSelectedDate] = useState(TODAY_STRING);
    const [displayedDate, setDisplayedDate] = useState<Date>(TODAY);
    const [showPicker, setShowPicker] = useState(false);

    // 🎯 Chọn ngày
    const handleDayPress = (day: DateData) => {
        setSelectedDate(day.dateString);
        onDateSelect?.(new Date(day.dateString));
    };

    // 🎯 Quay lại hôm nay
    const handleToday = () => {
        setSelectedDate(TODAY_STRING);
        setDisplayedDate(TODAY);
        onDateSelect?.(TODAY);
    };

    // 🎯 Mở chọn tháng (DateTimePicker)
    const handleMonthPicker = () => {
        setShowPicker(true);
    };

    // 🎯 Khi chọn tháng
    const handleMonthChange = (event: any, date?: Date) => {
        setShowPicker(false);
        if (date) {
            const newDate = new Date(date);
            newDate.setDate(1);
            setDisplayedDate(newDate);
        }
    };

    // 🎯 Đánh dấu ngày
    const markedDates = useMemo(() => {
        const marks: { [key: string]: any } = {};
        markedData.forEach((item) => {
            marks[item.date] = { marked: true, dotColor: item.color || "#3b82f6" };
        });
        marks[selectedDate] = {
            ...(marks[selectedDate] || {}),
            selected: true,
            selectedColor: "#f97316",
            selectedTextColor: "#fff",
        };
        return marks;
    }, [markedData, selectedDate]);

    return (
        <View style={[styles.container, { width: width - responsive.spacing(24) }]}>
            {/* Header: Calendar title + Month picker + Today button */}
            <View style={styles.header}>
                <Text style={styles.monthText}>
                    <FontAwesome5 name="calendar-alt" size={24} color="#f97f2b" /> Calendar
                </Text>

                <View style={styles.headerRight}>
                    <TouchableOpacity onPress={handleMonthPicker} style={styles.iconBtn}>
                        <FontAwesome5 name="calendar" size={18} color="#111" />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleToday} style={styles.todayBtn}>
                        <Text style={styles.todayText}>Today</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Calendar */}
            <Calendar
                key={displayedDate.toISOString()}
                current={displayedDate.toISOString().split("T")[0]}
                onDayPress={handleDayPress}
                markedDates={markedDates}
                markingType="dot"
                hideExtraDays={false}
                enableSwipeMonths={true}
                theme={{
                    backgroundColor: "#fff",
                    calendarBackground: "#fff",
                    todayTextColor: "#e76f51",
                    selectedDayBackgroundColor: "#f97316",
                    textDayFontSize: 15,
                    textMonthFontSize: 18,
                    textDayHeaderFontSize: 13,
                    arrowColor: "#111827",
                    monthTextColor: "#111827",
                    textMonthFontWeight: "700",
                    textDayFontWeight: "500",
                }}
                style={styles.calendar}
            />

            {/* Month picker modal */}
            {showPicker && (
                <DateTimePicker
                    value={displayedDate}
                    mode="date"
                    display="spinner"
                    onChange={handleMonthChange}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#fff",
        marginTop: responsive.spacing(16),
        padding: responsive.spacing(16),
        borderRadius: responsive.spacing(16),
        elevation: 3,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        alignSelf: "center",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: responsive.spacing(8),
    },
    monthText: {
        fontSize: responsive.fontSize(18),
        fontWeight: "600",
        color: "#374151",
    },
    headerRight: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    iconBtn: {
        backgroundColor: "#f3f4f6",
        padding: 8,
        borderRadius: 8,
    },
    todayBtn: {
        backgroundColor: "#f97316",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    todayText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: responsive.fontSize(14),
    },
    calendar: {
        borderRadius: responsive.spacing(12),
    },
});
