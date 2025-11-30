import { getNow } from '@/utils/dateUtils';
import React, { createContext, ReactNode, useContext, useMemo, useState } from 'react';

type CalendarContextType = {
    selectedDate: Date;
    setSelectedDate: (d: Date) => void;
    displayedDate: Date;
    setDisplayedDate: (d: Date) => void;
};

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export function CalendarProvider({ children }: { children: ReactNode }) {
    const now = getNow();
    const [selectedDate, setSelectedDate] = useState<Date>(now);
    const [displayedDate, setDisplayedDate] = useState<Date>(now);

    const value = useMemo(() => ({ selectedDate, setSelectedDate, displayedDate, setDisplayedDate }), [selectedDate, displayedDate]);

    return <CalendarContext.Provider value={value}>{children}</CalendarContext.Provider>;
}

export function useCalendar() {
    const ctx = useContext(CalendarContext);
    if (!ctx) throw new Error('useCalendar must be used within a CalendarProvider');
    return ctx;
}

export default CalendarContext;
