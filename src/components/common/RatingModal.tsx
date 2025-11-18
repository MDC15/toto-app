import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface RatingModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (rating: number) => void;
}

export default function RatingModal({ visible, onClose, onSubmit }: RatingModalProps) {
    const [selectedRating, setSelectedRating] = useState(0);

    const handleStarPress = (rating: number) => {
        setSelectedRating(rating);
    };

    const handleSubmit = () => {
        if (selectedRating > 0) {
            onSubmit(selectedRating);
            setSelectedRating(0);
        }
    };

    const handleClose = () => {
        setSelectedRating(0);
        onClose();
    };

    const renderStars = () => {
        return [1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity
                key={star}
                onPress={() => handleStarPress(star)}
                style={styles.starContainer}
            >
                <Ionicons
                    name={star <= selectedRating ? "star" : "star-outline"}
                    size={32}
                    color={star <= selectedRating ? "#FFD700" : "#DDD"}
                />
            </TouchableOpacity>
        ));
    };

    return (
        <Modal
            animationType="fade"
            transparent
            visible={visible}
            onRequestClose={handleClose}
        >
            <Pressable style={styles.overlay} onPress={handleClose}>
                <View style={styles.card} onTouchStart={(e) => e.stopPropagation()}>
                    <View style={styles.iconCircle}>
                        <Ionicons name="star" size={24} color="#FFD700" />
                    </View>

                    <Text style={styles.title}>Rate Our App</Text>
                    <Text style={styles.message}>
                        How would you rate your experience with TodoList App?
                    </Text>

                    <View style={styles.starsContainer}>
                        {renderStars()}
                    </View>

                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.submitButton, { opacity: selectedRating > 0 ? 1 : 0.5 }]}
                            onPress={handleSubmit}
                            disabled={selectedRating === 0}
                        >
                            <Text style={styles.submitText}>Submit & Rate</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.25)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        width: 320,
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingVertical: 28,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    iconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#FFF8DC',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    title: {
        fontWeight: '700',
        fontSize: 20,
        color: '#333',
        marginBottom: 8,
    },
    message: {
        color: '#666',
        textAlign: 'center',
        fontSize: 14,
        marginBottom: 20,
    },
    starsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 24,
    },
    starContainer: {
        padding: 4,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 20,
    },
    cancelButton: {
        backgroundColor: '#F3F4F6',
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 12,
    },
    submitButton: {
        backgroundColor: '#2563EB',
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 12,
    },
    cancelText: {
        color: '#6B7280',
        fontWeight: '600',
    },
    submitText: {
        color: '#fff',
        fontWeight: '600',
    },
});