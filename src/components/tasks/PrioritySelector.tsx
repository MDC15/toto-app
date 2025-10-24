import * as React from "react";
import { View } from "react-native";
import { Button } from "react-native-paper";

export type PriorityType = "High" | "Medium" | "Low";

interface PrioritySelectorProps {
    value?: PriorityType;
    onChange: (value: PriorityType) => void;
}

const PrioritySelector: React.FC<PrioritySelectorProps> = ({ value, onChange }) => {
    const priorities = [
        { label: "High", color: "#ef4444" },
        { label: "Medium", color: "#f59e0b" },
        { label: "Low", color: "#3b82f6" },
    ];

    return (
        <View style={{ flexDirection: "row", justifyContent: "center" }}>
            {priorities.map((item) => {
                const isSelected = item.label === value;
                return (
                    <Button
                        key={item.label}
                        mode={isSelected ? "contained-tonal" : "outlined"}
                        buttonColor={isSelected ? item.color + "33" : "transparent"}
                        textColor={item.color}
                        style={{ marginHorizontal: 6, borderColor: item.color }}
                        onPress={() => onChange(item.label as PriorityType)}
                    >
                        {item.label}
                    </Button>
                );
            })}
        </View>
    );
};

export default PrioritySelector;
