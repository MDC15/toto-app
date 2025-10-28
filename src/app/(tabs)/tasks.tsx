import { router } from "expo-router";
import React, { useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

// Components
import FloatingAddButton from "@/components/tasks/FloatingAddButton";
import ProgressCard from "@/components/tasks/ProgressCard";
import TaskCard from "@/components/tasks/TaskCard";
import TaskFilterTabs from "@/components/tasks/TaskFilterTabs";
import WeekCalendar from "@/components/tasks/WeekCalendar";
import { useTasks } from '@/contexts/TasksContext';
import { formatFullDate, getNow } from "@/utils/dateUtils";

export default function TasksScreen() {
  const [selectedDate, setSelectedDate] = React.useState(getNow());
  const [filter, setFilter] = React.useState("All Tasks");

  const { tasks, deleteTask, toggleComplete } = useTasks();

  const tasksForDate = useMemo(() => {
    const dateString = selectedDate.toDateString();
    return tasks.filter((t) => {
      const taskDate = new Date(t.deadline).toDateString();
      return taskDate === dateString;
    });
  }, [tasks, selectedDate]);

  // 🧮 Tính tiến độ hoàn thành
  const progress = useMemo(() => {
    const done = tasksForDate.filter((t) => t.completed).length;
    return tasksForDate.length ? done / tasksForDate.length : 0;
  }, [tasksForDate]);

  // 🧩 Lọc task theo filter (All hoặc theo Priority)
  const filteredTasks = useMemo(() => {
    if (filter === "All Tasks") return tasksForDate;
    return tasksForDate.filter((t) => t.priority === filter);
  }, [tasksForDate, filter]);

  return (
    <View style={styles.container}>
      {/* 🗓️ Tiến độ và ngày */}
      <ProgressCard
        date={formatFullDate(selectedDate)}
        progress={progress}
        completed={tasksForDate.filter(t => t.completed).length}
        total={tasksForDate.length}
      />

      {/* 📅 Lịch tuần */}
      <WeekCalendar
        selectedDate={new Date(selectedDate)}
        onSelectDate={(date) => setSelectedDate(date)}
      />

      {/* 🔍 Tabs lọc */}
      <TaskFilterTabs selectedFilter={filter} onChangeFilter={setFilter} />

      {/* 📋 Danh sách Task */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: 16, marginTop: 10 }}>
          {filteredTasks.map((task) => {
            const deadline = new Date(task.deadline);
            const todayString = new Date().toDateString();
            const taskDateString = deadline.toDateString();
            const due = `${taskDateString === todayString ? 'Today' : deadline.toLocaleDateString()}, ${deadline.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
            return (
              <TaskCard
                key={task.id}
                title={task.title}
                due={due}
                description={task.description}
                priority={task.priority}
                completed={task.completed}
                onToggleComplete={() => toggleComplete(task.id)}
                onDelete={() => deleteTask(task.id)}
                onEdit={() => router.push({ pathname: "/pages/edittask", params: { id: String(task.id) } })}
              />
            );
          })}
        </View>
      </ScrollView>

      {/* ➕ Nút thêm task */}
      <FloatingAddButton onPress={() => router.push("/pages/addtask")} />
    </View >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
