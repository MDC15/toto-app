import { responsive } from '@/constants/theme';
import { CakeProvider } from '@/contexts/CakeContext';
import { CalendarProvider } from '@/contexts/CalendarContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { TasksProvider } from '@/contexts/TasksContext';
import { UserProvider } from '@/contexts/UserContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider
} from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { initDatabase } from '../db/database';

// Set the initial route to the (tabs) layout
export const unstable_settings = {
  // Start app at the index loading screen so we can perform startup work
  anchor: 'index',
};

// Root layout component that wraps the entire app
export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    initDatabase();
  }, [colorScheme]);

  // Thêm style cho GestureHandlerRootView để phù hợp với edge-to-edge
  const rootViewStyle = {
    flex: 1,
    backgroundColor: colorScheme === 'dark' ? '#000' : '#fff',
  };

  return (
    <GestureHandlerRootView style={rootViewStyle}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <UserProvider>
          <NotificationProvider>
            <CalendarProvider>
              <TasksProvider>
                <CakeProvider>
                  <Stack
                    screenOptions={{
                      headerTitleAlign: 'center',
                      headerStyle: {
                        backgroundColor: colorScheme === 'dark' ? '#000' : '#fff',
                      },
                      headerTintColor: colorScheme === 'dark' ? '#fff' : '#000',
                      headerTitleStyle: {
                        fontWeight: '600',
                        fontSize: responsive.fontSize(24)
                      },
                      // Thêm padding cho content để tránh bị navigation bar che
                      contentStyle: {
                        paddingBottom: Platform.OS === 'android' ? 16 : 0,
                      }
                    }}
                  >
                    <Stack.Screen name="index" options={{ headerShown: false }} />
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    <Stack.Screen name="pages/permission" options={{ headerShown: false, title: 'Add New Task Template', headerLeft: () => null }} />
                    <Stack.Screen name="pages/addtask" options={{ headerShown: true, title: 'Add New Task', headerLeft: () => null }} />
                    <Stack.Screen name="pages/edittask" options={{ headerShown: true, title: 'Edit Task', headerLeft: () => null }} />
                    <Stack.Screen name="pages/templates" options={{ headerShown: true, title: 'Templates', headerLeft: () => null }} />
                    <Stack.Screen name="pages/createevent" options={{ headerShown: true, title: 'Create Event', headerLeft: () => null }} />
                    <Stack.Screen name="pages/editevent" options={{ headerShown: true, title: 'Edit Event', headerLeft: () => null }} />
                    <Stack.Screen name="pages/eventlist" options={{ headerShown: true, title: 'Event Details', headerLeft: () => null }} />
                    <Stack.Screen name="pages/createhabit" options={{ headerShown: true, title: 'Create Habits', headerLeft: () => null }} />
                    <Stack.Screen name="pages/viewhabit" options={{ headerShown: true, title: 'Habit Details', headerLeft: () => null }} />
                    <Stack.Screen name="pages/edithabit" options={{ headerShown: true, title: 'Edit Habit', headerLeft: () => null }} />
                    <Stack.Screen name="pages/cakes" options={{ headerShown: true, title: 'Cake Collection', headerLeft: () => null }} />
                    <Stack.Screen name="pages/settings" options={{ headerShown: true, title: 'Settings' }} />
                    <Stack.Screen name="pages/premium" options={{ headerShown: false, presentation: 'modal' }} />
                  </Stack>
                  {/* Đảm bảo StatusBar phù hợp với theme */}
                  <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
                </CakeProvider>
              </TasksProvider>
            </CalendarProvider>
          </NotificationProvider>
        </UserProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}