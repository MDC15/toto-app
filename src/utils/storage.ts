import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_NAME_KEY = 'user_name';

export const saveUserName = async (name: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(USER_NAME_KEY, name);
  } catch (error) {
    console.error('Error saving user name:', error);
  }
};

export const getUserName = async (): Promise<string | null> => {
  try {
    const name = await AsyncStorage.getItem(USER_NAME_KEY);
    return name;
  } catch (error) {
    console.error('Error retrieving user name:', error);
    return null;
  }
};