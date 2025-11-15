import { getEvents, getHabits, getTasks } from '../db/database';
import { getDateString, getStartOfWeek } from './dateUtils';

// Types for analysis results
export interface SummaryStats {
    totalTasks: number;
    completedTasks: number;
    totalHabits: number;
    activeHabits: number;
    totalEvents: number;
    upcomingEvents: number;
    completionRate: number;
    productivityScore: number;
}

export interface TimeSeriesData {
    date: string;
    completed: number;
    total: number;
}

export interface ActivityBreakdown {
    tasks: number;
    habits: number;
    events: number;
}

// Utility functions
function calculateCompletionRate(completed: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
}

function calculateProductivityScore(
    taskCompletionRate: number,
    habitCompletionRate: number,
    eventAttendance: number,
    totalTasks: number = 0,
    totalEvents: number = 0,
    totalHabits: number = 0
): number {
    // Dynamic weighting based on activity volume
    const totalActivities = totalTasks + totalEvents + totalHabits;

    let taskWeight = 0.5, habitWeight = 0.3, eventWeight = 0.2;

    // Adjust weights based on activity distribution
    if (totalTasks > 0 && totalEvents > 0) {
        const taskRatio = totalTasks / totalActivities;
        const eventRatio = totalEvents / totalActivities;
        taskWeight = 0.4 + (taskRatio * 0.2);
        eventWeight = 0.3 + (eventRatio * 0.1);
        habitWeight = 0.3; // Keep habit weight constant
    }

    // Ensure weights sum to 1
    const totalWeight = taskWeight + habitWeight + eventWeight;
    taskWeight /= totalWeight;
    habitWeight /= totalWeight;
    eventWeight /= totalWeight;

    // Penalty for low activity
    const activityPenalty = totalActivities < 3 ? 0.8 : 1;

    const baseScore = (
        (taskCompletionRate * taskWeight) +
        (habitCompletionRate * habitWeight) +
        (eventAttendance * eventWeight)
    ) * activityPenalty;

    return Math.round(Math.max(0, Math.min(100, baseScore)));
}

// Core data fetching functions
export async function getTasksInPeriod(startDate: Date, endDate: Date): Promise<any[]> {
    try {
        return getTasks().filter(task => {
            if (!task.deadline) return false;
            const taskDate = new Date(task.deadline);
            return taskDate >= startDate && taskDate <= endDate;
        });
    } catch (error) {
        console.error('Error fetching tasks in period:', error);
        return [];
    }
}

export async function getEventsInPeriod(startDate: Date, endDate: Date): Promise<any[]> {
    try {
        return getEvents().filter(event => {
            if (!event.start_time) return false;
            const eventDate = new Date(event.start_time);
            return eventDate >= startDate && eventDate <= endDate;
        });
    } catch (error) {
        console.error('Error fetching events in period:', error);
        return [];
    }
}

export async function getHabitsInPeriod(startDate: Date, endDate: Date): Promise<any[]> {
    try {
        return getHabits().filter(habit => {
            const habitStart = habit.start_date ? new Date(habit.start_date) : new Date();
            const habitEnd = habit.end_date ? new Date(habit.end_date) : new Date();
            return habitStart <= endDate && habitEnd >= startDate;
        });
    } catch (error) {
        console.error('Error fetching habits in period:', error);
        return [];
    }
}

export async function calculateSummaryStats(period: 'daily' | 'weekly' | 'monthly'): Promise<SummaryStats> {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (period) {
        case 'daily':
            startDate = new Date(now);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(now);
            endDate.setHours(23, 59, 59, 999);
            break;
        case 'weekly':
            startDate = getStartOfWeek(now);
            endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 6);
            endDate.setHours(23, 59, 59, 999);
            break;
        case 'monthly':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            endDate.setHours(23, 59, 59, 999);
            break;
    }

    try {
        const [tasks, events, habits] = await Promise.all([
            getTasksInPeriod(startDate, endDate),
            getEventsInPeriod(startDate, endDate),
            getHabitsInPeriod(startDate, endDate)
        ]);

        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.completed === 1).length;

        const totalHabits = habits.length;
        const activeHabits = habits.filter(habit => {
            const completedDates = JSON.parse(habit.completed_dates || '[]');
            return completedDates.some((date: string) => {
                const completedDate = new Date(date);
                return completedDate >= startDate && completedDate <= endDate;
            });
        }).length;

        const totalEvents = events.length;
        const upcomingEvents = events.filter(event => {
            const eventDate = new Date(event.start_time);
            return eventDate >= startDate && eventDate <= endDate && !event.completed;
        }).length;

        const taskCompletionRate = calculateCompletionRate(completedTasks, totalTasks);
        const habitCompletionRate = totalHabits > 0 ? (activeHabits / totalHabits) * 100 : 0;
        const eventAttendanceRate = totalEvents > 0 ? calculateCompletionRate(
            events.filter(event => event.completed === 1).length,
            totalEvents
        ) : 0;

        const productivityScore = calculateProductivityScore(
            taskCompletionRate,
            habitCompletionRate,
            eventAttendanceRate,
            totalTasks,
            totalEvents,
            totalHabits
        );

        return {
            totalTasks,
            completedTasks,
            totalHabits,
            activeHabits,
            totalEvents,
            upcomingEvents,
            completionRate: taskCompletionRate,
            productivityScore
        };
    } catch (error) {
        console.error('Error calculating summary stats:', error);
        return {
            totalTasks: 0,
            completedTasks: 0,
            totalHabits: 0,
            activeHabits: 0,
            totalEvents: 0,
            upcomingEvents: 0,
            completionRate: 0,
            productivityScore: 0
        };
    }
}

export async function getTimeSeriesData(
    period: 'daily' | 'weekly' | 'monthly',
    periods: number = 7
): Promise<TimeSeriesData[]> {
    const now = new Date();
    const data: TimeSeriesData[] = [];

    if (period === 'monthly') {
        // Show last 12 months from current month
        for (let i = periods - 1; i >= 0; i--) {
            const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const startDate = new Date(targetDate);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);
            endDate.setHours(23, 59, 59, 999);

            try {
                const [tasks, habits, events] = await Promise.all([
                    getTasksInPeriod(startDate, endDate),
                    getHabitsInPeriod(startDate, endDate),
                    getEventsInPeriod(startDate, endDate)
                ]);

                const completedTasks = tasks.filter(task => task.completed === 1).length;
                const activeHabits = habits.filter(habit => {
                    const completedDates = JSON.parse(habit.completed_dates || '[]');
                    return completedDates.some((date: string) => {
                        const completedDate = new Date(date);
                        return completedDate >= startDate && completedDate <= endDate;
                    });
                }).length;
                const completedEvents = events.filter(event => event.completed === 1).length;

                // Weighted completion score: tasks (50%), habits (30%), events (20%)
                const totalActivities = tasks.length + habits.length + events.length;
                const weightedScore = totalActivities > 0 ?
                    Math.round(((completedTasks * 0.5) + (activeHabits * 0.3) + (completedEvents * 0.2)) / totalActivities * 100) : 0;

                data.push({
                    date: getDateString(startDate),
                    completed: weightedScore,
                    total: 100 // 100% as baseline for percentage
                });
            } catch (error) {
                console.error('Error fetching time series data for month:', targetDate, error);
                data.push({
                    date: getDateString(startDate),
                    completed: 0,
                    total: 100
                });
            }
        }
    } else if (period === 'weekly') {
        // Show last 8 weeks
        for (let i = periods - 1; i >= 0; i--) {
            const weekStart = new Date(now);
            weekStart.setDate(weekStart.getDate() - (i * 7));
            weekStart.setHours(0, 0, 0, 0);

            // Get start of week (Monday)
            const dayOfWeek = weekStart.getDay();
            const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust for Monday start
            weekStart.setDate(weekStart.getDate() + diff);

            const endDate = new Date(weekStart);
            endDate.setDate(endDate.getDate() + 6);
            endDate.setHours(23, 59, 59, 999);

            try {
                const [tasks, habits, events] = await Promise.all([
                    getTasksInPeriod(weekStart, endDate),
                    getHabitsInPeriod(weekStart, endDate),
                    getEventsInPeriod(weekStart, endDate)
                ]);

                const completedTasks = tasks.filter(task => task.completed === 1).length;
                const activeHabits = habits.filter(habit => {
                    const completedDates = JSON.parse(habit.completed_dates || '[]');
                    return completedDates.some((date: string) => {
                        const completedDate = new Date(date);
                        return completedDate >= weekStart && completedDate <= endDate;
                    });
                }).length;
                const completedEvents = events.filter(event => event.completed === 1).length;

                // Weekly completion rate
                const totalActivities = tasks.length + habits.length + events.length;
                const weeklyScore = totalActivities > 0 ?
                    Math.round(((completedTasks * 0.5) + (activeHabits * 0.3) + (completedEvents * 0.2)) / totalActivities * 100) : 0;

                data.push({
                    date: getDateString(weekStart),
                    completed: weeklyScore,
                    total: 100
                });
            } catch (error) {
                console.error('Error fetching time series data for week:', weekStart, error);
                data.push({
                    date: getDateString(weekStart),
                    completed: 0,
                    total: 100
                });
            }
        }
    } else {
        // Daily: Show last 7 days
        for (let i = periods - 1; i >= 0; i--) {
            const dayDate = new Date(now);
            dayDate.setDate(dayDate.getDate() - i);
            dayDate.setHours(0, 0, 0, 0);

            const endDate = new Date(dayDate);
            endDate.setHours(23, 59, 59, 999);

            try {
                const [tasks, habits, events] = await Promise.all([
                    getTasksInPeriod(dayDate, endDate),
                    getHabitsInPeriod(dayDate, endDate),
                    getEventsInPeriod(dayDate, endDate)
                ]);

                const completedTasks = tasks.filter(task => task.completed === 1).length;
                const activeHabits = habits.filter(habit => {
                    const completedDates = JSON.parse(habit.completed_dates || '[]');
                    return completedDates.some((dateStr: string) => {
                        const completedDate = new Date(dateStr);
                        return completedDate >= dayDate && completedDate <= endDate;
                    });
                }).length;
                const completedEvents = events.filter(event => event.completed === 1).length;

                // Daily completion rate
                const totalActivities = tasks.length + habits.length + events.length;
                const dailyScore = totalActivities > 0 ?
                    Math.round(((completedTasks * 0.5) + (activeHabits * 0.3) + (completedEvents * 0.2)) / totalActivities * 100) : 0;

                data.push({
                    date: getDateString(dayDate),
                    completed: dailyScore,
                    total: 100
                });
            } catch (error) {
                console.error('Error fetching time series data for date:', dayDate, error);
                data.push({
                    date: getDateString(dayDate),
                    completed: 0,
                    total: 100
                });
            }
        }
    }

    return data;
}

export async function getActivityBreakdown(): Promise<ActivityBreakdown> {
    try {
        const [tasks, events, habits] = await Promise.all([
            getTasks(),
            getEvents(),
            getHabits()
        ]);

        return {
            tasks: tasks.length,
            events: events.length,
            habits: habits.length
        };
    } catch (error) {
        console.error('Error fetching activity breakdown:', error);
        return {
            tasks: 0,
            events: 0,
            habits: 0
        };
    }
}

export async function calculatePercentageChange(
    current: number,
    period: 'daily' | 'weekly' | 'monthly',
    type: 'tasks' | 'events' | 'habits' | 'productivity' = 'tasks'
): Promise<number> {
    const now = new Date();
    let previousStart: Date;
    let previousEnd: Date;

    switch (period) {
        case 'daily':
            previousStart = new Date(now);
            previousStart.setDate(previousStart.getDate() - 1);
            previousStart.setHours(0, 0, 0, 0);
            previousEnd = new Date(previousStart);
            previousEnd.setHours(23, 59, 59, 999);
            break;
        case 'weekly':
            previousStart = getStartOfWeek(now);
            previousStart.setDate(previousStart.getDate() - 7);
            previousEnd = new Date(previousStart);
            previousEnd.setDate(previousEnd.getDate() + 6);
            break;
        case 'monthly':
            previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            previousEnd = new Date(now.getFullYear(), now.getMonth(), 0);
            break;
    }

    try {
        let previousCount = 0;

        switch (type) {
            case 'tasks':
                const [currentTasks, previousTasks] = await Promise.all([
                    getTasksInPeriod(new Date(now.getFullYear(), now.getMonth(), 1), now),
                    getTasksInPeriod(previousStart, previousEnd)
                ]);
                const currentCompleted = currentTasks.filter(task => task.completed === 1).length;
                previousCount = previousTasks.filter(task => task.completed === 1).length;
                if (previousCount === 0) return currentCompleted > 0 ? 100 : 0;
                return Math.round(((currentCompleted - previousCount) / previousCount) * 100);

            case 'events':
                const [currentEvents, previousEvents] = await Promise.all([
                    getEventsInPeriod(new Date(now.getFullYear(), now.getMonth(), 1), now),
                    getEventsInPeriod(previousStart, previousEnd)
                ]);
                const currentCount = currentEvents.length;
                previousCount = previousEvents.length;
                if (previousCount === 0) return currentCount > 0 ? 100 : 0;
                return Math.round(((currentCount - previousCount) / previousCount) * 100);

            case 'habits':
                const [currentHabits, previousHabits] = await Promise.all([
                    getHabitsInPeriod(new Date(now.getFullYear(), now.getMonth(), 1), now),
                    getHabitsInPeriod(previousStart, previousEnd)
                ]);
                const currentActiveHabits = currentHabits.filter(habit => {
                    const completedDates = JSON.parse(habit.completed_dates || '[]');
                    return completedDates.some((date: string) => {
                        const completedDate = new Date(date);
                        return completedDate >= new Date(now.getFullYear(), now.getMonth(), 1) && completedDate <= now;
                    });
                }).length;
                previousCount = previousHabits.filter(habit => {
                    const completedDates = JSON.parse(habit.completed_dates || '[]');
                    return completedDates.some((date: string) => {
                        const completedDate = new Date(date);
                        return completedDate >= previousStart && completedDate <= previousEnd;
                    });
                }).length;
                if (previousCount === 0) return currentActiveHabits > 0 ? 100 : 0;
                return Math.round(((currentActiveHabits - previousCount) / previousCount) * 100);

            case 'productivity':
                // For productivity score, we'll return 0 as it's calculated differently
                // In a real app, you'd want to calculate the previous period's productivity score
                return 0;

            default:
                return 0;
        }
    } catch (error) {
        console.error('Error calculating percentage change:', error);
        return 0;
    }
}