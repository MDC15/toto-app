import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ColorPickProps {
    selectedColor: string;
    onColorSelect: (color: string) => void;
    label?: string;
}

const colors = [
    '#67E8F9', // Soft cyan
    '#A5B4FC', // Soft indigo
    '#FCA5A5', // Soft red
    '#86EFAC', // Soft green
    '#FCD34D', // Soft amber
    '#C084FC', // Soft purple
    '#FDA4AF', // Soft rose
    '#7DD3FC', // Soft sky blue
    '#D8B4FE', // Soft violet
];

export default function ColorPick({
    selectedColor,
    onColorSelect,
    label = 'Color',
}: ColorPickProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.colorRow}>
                {colors.map((c, i) => (
                    <TouchableOpacity
                        key={i}
                        style={[
                            styles.colorDot,
                            { backgroundColor: c },
                            selectedColor === c && styles.selectedDot,
                        ]}
                        onPress={() => onColorSelect(c)}
                    />
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 10,
        marginBottom: 20,
        paddingHorizontal: 12, // căn đều hai bên
        backgroundColor: '#fff',
        paddingVertical: 16,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
    },
    label: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
        paddingHorizontal: 8,
        textAlign: 'left',
        paddingVertical: 4,
        borderRadius: 4,
        overflow: 'hidden',

    },
    colorRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between', // căn đều hai bên
        rowGap: 12,
    },
    colorDot: {
        width: 32,
        height: 32,
        borderRadius: 16,
    },
    selectedDot: {
        borderWidth: 2,
        borderColor: '#333',
        transform: [{ scale: 1.1 }],
    },
});
