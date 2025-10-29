import { Ionicons } from '@expo/vector-icons';
import { router } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import { Animated, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";

// Components
import FloatingAddButton from "@/components/tasks/FloatingAddButton";
import ProgressCard from "@/components/tasks/ProgressCard";
import RecommendedTaskCard from "@/components/tasks/RecommendedTaskCard";
import TaskCard from "@/components/tasks/TaskCard";
import TaskFilterTabs from "@/components/tasks/TaskFilterTabs";
import WeekCalendar from "@/components/tasks/WeekCalendar";
import { useTasks } from '@/contexts/TasksContext';
import { formatFullDate, getNow } from "@/utils/dateUtils";

const recommendedTasks = [
  {
    title: 'Plan Your Day',
    description: 'Set 3 key priorities for today to stay focused and productive.',
  },
  {
    title: 'Review Goals',
    description: 'Spend 10 minutes reviewing your weekly or monthly goals.',
  },
  {
    title: 'Learn a New Skill',
    description: 'Dedicate 30 minutes to learning something that improves your career or personal growth.',
  },
  {
    title: 'Exercise or Stretch',
    description: 'Do at least 15 minutes of physical activity to boost energy and focus.',
  },
  {
    title: 'Organize Workspace',
    description: 'Clean up your desk or digital workspace to reduce clutter and distractions.',
  },
  {
    title: 'Reflect on the Day',
    description: 'Write down what went well and what can be improved for tomorrow.',
  },
];


export default function TasksScreen() {
  const [selectedDate, setSelectedDate] = React.useState(getNow());
  const [filter, setFilter] = React.useState("All Tasks");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

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

  const openModal = () => {
    setIsModalVisible(true);
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setIsModalVisible(false));
  };

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
      <FloatingAddButton onPress={openModal} />

      {/* Modal */}
      <Modal
        visible={isModalVisible}
        animationType="none"
        transparent
        onRequestClose={closeModal}
      >
        {/* Vùng overlay bên ngoài modal */}
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={styles.modalOverlay}>
            {/* Ngăn chặn touch xuyên modal nội dung */}
            <TouchableWithoutFeedback>
              <Animated.View
                style={[
                  styles.modalContent,
                  {
                    transform: [
                      {
                        translateY: slideAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [600, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Add New Task</Text>
                  <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                    <Ionicons name="close" size={24} color="#000" />
                  </TouchableOpacity>
                </View>

                <View style={styles.centerButton}>
                  <TouchableOpacity style={styles.addButton} onPress={() => {
                    closeModal();
                    router.push("/pages/addtask");
                  }}>
                    <Ionicons name="add" size={48} color="#fff" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.sectionTitle}>Recommended Tasks</Text>
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={styles.grid}>
                    {recommendedTasks.map((t, i) => (
                      <RecommendedTaskCard key={i} {...t} onPress={() => {
                        closeModal();
                        router.push({ pathname: "/pages/addtask", params: { title: t.title, description: t.description } });
                      }} />
                    ))}
                  </View>
                </ScrollView>

                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.quickActions}>
                  <TouchableOpacity style={styles.quickActionButton} onPress={() => {
                    closeModal();
                    router.push({ pathname: "/pages/addtask", params: { reminder: "true" } });
                  }}>
                    <Ionicons name="time-outline" size={24} color="#666" />
                    <Text style={styles.quickActionText}>Set Reminder</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.quickActionButton} onPress={() => {
                    closeModal();
                    router.push("/pages/templates");
                  }}>
                    <Ionicons name="list-outline" size={24} color="#666" />
                    <Text style={styles.quickActionText}>View Templates</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  closeButton: {
    padding: 5,
  },
  centerButton: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  addButton: {
    width: 100,
    height: 100,
    backgroundColor: '#f97316',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 20,
    marginBottom: 12,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  quickActionButton: {
    alignItems: 'center',
    padding: 10,
  },
  quickActionText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    marginTop: 8,
    paddingBottom: 40,
  },
});
