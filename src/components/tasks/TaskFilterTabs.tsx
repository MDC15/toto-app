import PrioritySelector, { PriorityType } from "@/components/tasks/PrioritySelector";
import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { Chip } from "react-native-paper";

interface TaskFilterTabsProps {
    selectedFilter: string;
    onChangeFilter: (filter: string) => void;
}

export default function TaskFilterTabs({
    selectedFilter,
    onChangeFilter,
}: TaskFilterTabsProps) {
    // Nếu chọn “All Tasks” thì Priority = undefined
    const priorityValue = useMemo(
        () =>
            selectedFilter === "All Tasks"
                ? undefined
                : (selectedFilter as PriorityType),
        [selectedFilter]
    );

    const isAllSelected = selectedFilter === "All Tasks";

    return (
        <View style={styles.container}>
            {/* Nút “All Tasks” */}
            <Chip
                onPress={() => onChangeFilter("All Tasks")}
                style={[styles.chip, isAllSelected && styles.chipActive]}
                textStyle={[styles.text, isAllSelected && styles.textActive]}
            >
                All Tasks
            </Chip>

            {/* Bộ lọc ưu tiên */}
            <PrioritySelector
                value={priorityValue}
                onChange={(v) => onChangeFilter(v)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 10,
        marginHorizontal: 8,
    },
    chip: {
        height: 40,
        marginHorizontal: 6,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 20,
        backgroundColor: "#fff",
        elevation: 1,
        justifyContent: "center",
    },
    chipActive: {
        backgroundColor: "#fce2b3",
        borderColor: "#f59e0b",
        elevation: 3,
    },
    text: {
        color: "#444",
        fontWeight: "600",
        fontSize: 14,
        textAlign: "center",
    },
    textActive: {
        color: "#000",
        fontWeight: "700",
    },
});
