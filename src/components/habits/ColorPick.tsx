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

export default function ColorPick({ selectedColor, onColorSelect, label = "Color" }: ColorPickProps) {
    return (
        <View>
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
    label: {
        fontSize: 15,
        fontWeight: '600',
        color: '#444',
        marginBottom: 6,
        paddingTop: 10,
    },
    colorRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
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
});