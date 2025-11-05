// utils/dateUtils.ts
/**
 * Trả về thời gian hiện tại theo múi giờ thiết bị
 */
export function getNow(): Date {
    return new Date();
}

/**
 * Lấy ngày đầu tuần (chủ nhật là ngày đầu)
 */
export function getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay(); // 0: Sunday
    const diff = d.getDate() - day;
    d.setDate(diff);
    return new Date(d.setHours(0, 0, 0, 0));
}

/**
 * Lấy danh sách 7 ngày trong tuần (Chủ nhật -> Thứ bảy)
 */
export function getWeekDays(start: Date): Date[] {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        days.push(new Date(d));
    }
    return days;
}

/**
 * Format ngày sang dạng "Sunday, October 5, 2025"
 */
export function formatFullDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
}


/**
 * Format ngày sang dạng "October 5, 2025"
 */
export function formatShortDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
}

/**
 * Kiểm tra xem hai ngày có cùng ngày/tháng/năm không
 */
export function isSameDay(a: Date, b: Date): boolean {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
}

/**
 * Lấy text rút gọn ngày: ví dụ "Sun", "Mon"
 */
export function getDayLabel(date: Date): string {
    return date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
}

/**
 * Lấy số ngày: ví dụ 5, 6, 7
 */
export function getDayNumber(date: Date): number {
    return date.getDate();
}

/**
 * Trả về tên tháng + năm: ví dụ "October 2025"
 */
export function getMonthYearLabel(date: Date): string {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

/**
 * Chuyển đổi Date thành string YYYY-MM-DD với timezone local
 * Tránh lỗi timezone offset như toISOString().split('T')[0]
 */
export function getDateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
