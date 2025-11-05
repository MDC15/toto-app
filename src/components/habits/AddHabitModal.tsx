
import FloatingAddButton from '@/components/tasks/FloatingAddButton';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    Animated,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';

export default function AddHabitModal() {
    const router = useRouter();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const slideAnim = useRef(new Animated.Value(0)).current;

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
        <>
            <FloatingAddButton onPress={openModal} />

            <Modal
                visible={isModalVisible}
                animationType="none"
                transparent
                onRequestClose={closeModal}
            >
                {/* Overlay bên ngoài */}
                <TouchableWithoutFeedback onPress={closeModal}>
                    <View style={styles.modalOverlay}>
                        {/* Nội dung modal */}
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
                                    <Text style={styles.modalTitle}>Create New Habit</Text>
                                    <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                                        <Ionicons name="close" size={24} color="#000" />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.centerButton}>
                                    <TouchableOpacity
                                        style={styles.addButton}
                                        onPress={() => {
                                            closeModal();
                                            router.push('/pages/createhabit');
                                        }}
                                    >
                                        <Ionicons name="add" size={48} color="#fff" />
                                    </TouchableOpacity>
                                </View>

                                <Text style={styles.sectionTitle}>Quick Actions</Text>
                                <View style={styles.quickActions}>
                                    <TouchableOpacity
                                        style={styles.quickActionButton}
                                        onPress={() => {
                                            closeModal();
                                            router.push({
                                                pathname: '/pages/createhabit',
                                                params: { reminder: 'true' },
                                            });
                                        }}
                                    >
                                        <Ionicons name="time-outline" size={24} color="#666" />
                                        <Text style={styles.quickActionText}>Set Reminder</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.quickActionButton}
                                        onPress={() => {
                                            closeModal();
                                            router.push({
                                                pathname: '/pages/templates',
                                                params: { type: 'habit' },
                                            });
                                        }}
                                    >
                                        <Ionicons name="list-outline" size={24} color="#666" />
                                        <Text style={styles.quickActionText}>View Templates</Text>
                                    </TouchableOpacity>
                                </View>
                            </Animated.View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
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
});
