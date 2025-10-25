import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';

const colors = [
    '#FFD93D', '#FF7F3F', '#FF6F91', '#6BCB77', '#4D96FF',
    '#845EC2', '#B55400', '#FFB830', '#3CCF4E',
];

export default function CreateHabit() {
    const [habitName, setHabitName] = useState('');
    const [selectedColor, setSelectedColor] = useState('#FFD93D');
    const [reminder, setReminder] = useState(true);

    return (
        <View style={styles.container}>
            {/* Habit name */}
            <Text style={styles.label}>Habit Name</Text>
            <TextInput
                value={habitName}
                onChangeText={setHabitName}
                placeholder="Enter habit name"
                style={styles.input}
            />

            {/* Color Picker */}
            <Text style={styles.label}>Custom</Text>
            <View style={styles.colorRow}>
                {colors.map((c, i) => (
                    <TouchableOpacity
                        key={i}
                        style={[
                            styles.colorDot,
                            { backgroundColor: c },
                            selectedColor === c && styles.selectedDot,
                        ]}
                        onPress={() => setSelectedColor(c)}
                    />
                ))}
            </View>

            {/* Options Card */}
            <View style={styles.optionsCard}>
                <View style={styles.optionRow}>
                    <Ionicons name="repeat" size={20} color="#E16A00" />
                    <Text style={styles.optionText}>Repeat</Text>
                </View>

                <View style={styles.optionRow}>
                    <Ionicons name="calendar" size={20} color="#E16A00" />
                    <Text style={styles.optionText}>Start Date</Text>
                </View>

                <View style={styles.optionRow}>
                    <Ionicons name="calendar-outline" size={20} color="#E16A00" />
                    <Text style={styles.optionText}>End Date</Text>
                </View>

                <View style={styles.optionRow}>
                    <Ionicons name="notifications-outline" size={20} color="#E16A00" />
                    <Text style={styles.optionText}>Reminder</Text>
                    <Switch
                        trackColor={{ false: '#ccc', true: '#FF8C42' }}
                        thumbColor={'#fff'}
                        value={reminder}
                        onValueChange={setReminder}
                        style={{ marginLeft: 'auto' }}
                    />
                </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>Promis</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
    },
    label: {
        fontSize: 15,
        fontWeight: '600',
        color: '#444',
        marginBottom: 6,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 10,
        fontSize: 14,
        marginBottom: 20,
    },
    colorRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 25,
    },
    colorDot: {
        width: 28,
        height: 28,
        borderRadius: 14,
    },
    selectedDot: {
        borderWidth: 2,
        borderColor: '#333',
    },
    optionsCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        marginBottom: 40,
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
    },
    optionText: {
        fontSize: 15,
        color: '#333',
        marginLeft: 10,
    },
    button: {
        backgroundColor: '#FF8C42',
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
