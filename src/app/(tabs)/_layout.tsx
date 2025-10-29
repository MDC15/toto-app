import { HapticTab } from '@/components/haptic-tab';
import { Colors, responsive } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { router, Tabs, useNavigation } from 'expo-router';
import React from 'react';
import { TouchableOpacity } from 'react-native';

export default function TabsLayout() {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const inactiveColor = isDark ? '#E5E5E5' : '#1C1C1C';

  // ✅ Nút Back chung cho các màn (trừ Home)
  const BackButton = () => (
    <TouchableOpacity
      style={{
        marginLeft: responsive.spacing(16),
        borderRadius: responsive.spacing(30),
        padding: responsive.spacing(8),
      }}
      activeOpacity={0.7}
      onPress={() => {
        if (navigation.canGoBack()) {
          navigation.goBack();
        } else {
          router.push('/(tabs)');
        }
      }}
    >
      <AntDesign name="left" size={responsive.fontSize(24)} color={isDark ? '#FFF' : '#171a1f'} />
    </TouchableOpacity>
  );

  // ✅ Nút Settings chung cho các màn (trừ Home)
  const SettingsButton = () => (
    <TouchableOpacity
      style={{
        marginRight: responsive.spacing(16),
        borderRadius: responsive.spacing(30),
        padding: responsive.spacing(8),
      }}
      activeOpacity={0.7}
      onPress={() => router.navigate('/pages/settings')}
    >
      <AntDesign name="setting" size={responsive.fontSize(24)} color={isDark ? '#FFF' : '#171a1f'} />
    </TouchableOpacity>
  );

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarInactiveTintColor: inactiveColor,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? '#1A1A1A' : '#FFF',
          borderTopColor: isDark ? '#333' : '#ddd',
          height: responsive.height(8), // Responsive tab bar height
          paddingBottom: responsive.spacing(5),
          paddingTop: responsive.spacing(5),
        },
        tabBarButton: HapticTab,
        tabBarLabelStyle: {
          fontSize: responsive.fontSize(12), // Responsive tab label font size
        },
        tabBarIconStyle: {
          marginTop: responsive.spacing(2),
        },
      }}
    >
      {/* ✅ Home Tab (index) */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) =>
            focused ? (
              <FontAwesome5 name="home" size={24} color={color} />
            ) : (
              <AntDesign name="home" size={24} color={inactiveColor} />
            ),
        }}
      />

      {/* ✅ Tasks Tab */}
      <Tabs.Screen
        name="tasks"
        options={{
          title: 'Tasks',
          headerShown: true,
          headerLeft: () => <BackButton />,
          headerRight: () => <SettingsButton />,
          tabBarIcon: ({ color, focused }) =>
            focused ? (
              <FontAwesome5 name="tasks" size={24} color={color} />
            ) : (
              <AntDesign name="bars" size={24} color={inactiveColor} />
            ),
        }}
      />

      {/* ✅ Events Tab */}
      <Tabs.Screen
        name="events"
        options={{
          title: 'Events',
          headerShown: true,
          headerLeft: () => <BackButton />,
          headerRight: () => <SettingsButton />,
          tabBarIcon: ({ color, focused }) =>
            focused ? (
              <FontAwesome5 name="calendar" size={24} color={color} />
            ) : (
              <FontAwesome5 name="calendar" size={24} color={inactiveColor} />
            ),
        }}
      />

      {/* ✅ Habits Tab */}
      <Tabs.Screen
        name="habits"
        options={{
          title: 'Habits',
          headerShown: true,
          headerLeft: () => <BackButton />,
          headerRight: () => <SettingsButton />,
          tabBarIcon: ({ color, focused }) =>
            focused ? (
              <FontAwesome5 name="ioxhost" size={24} color={color} />
            ) : (
              <FontAwesome5 name="ioxhost" size={24} color={inactiveColor} />
            ),
        }}
      />

      {/* ✅ Summary Tab */}
      <Tabs.Screen
        name="summary"
        options={{
          title: 'Summary',
          headerShown: true,
          headerLeft: () => <BackButton />,
          headerRight: () => <SettingsButton />,
          tabBarIcon: ({ color, focused }) =>
            focused ? (
              <FontAwesome5 name="chart-bar" size={24} color={color} />
            ) : (
              <AntDesign name="bar-chart" size={24} color={inactiveColor} />
            ),
        }}
      />
    </Tabs>
  );
}
