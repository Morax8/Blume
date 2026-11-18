/**
 * Bottom tabs utama: Home, Scan, Konsultasi, Profil.
 * Tiap tab menampung nested stack agar tiap section punya alur sendiri
 * (mis. Home -> HistoryDetail, Scan -> CameraScan -> ScanResult).
 *
 * @format
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { HomeScreen } from '../screens/home/HomeScreen';
import { HistoryDetailScreen } from '../screens/home/HistoryDetailScreen';
import { CameraScanScreen } from '../screens/scan/CameraScanScreen';
import { ScanResultScreen } from '../screens/scan/ScanResultScreen';
import { DoctorListScreen } from '../screens/consultation/DoctorListScreen';
import { ChatRoomScreen } from '../screens/consultation/ChatRoomScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { Colors, FontSize, Spacing } from '../utils/constants';
import type {
  ConsultationStackParamList,
  HomeStackParamList,
  MainTabParamList,
  MainTabRouteName,
  ProfileStackParamList,
  ScanStackParamList,
} from '../types/navigation';

const Tab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const ScanStack = createNativeStackNavigator<ScanStackParamList>();
const ConsultationStack = createNativeStackNavigator<ConsultationStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

const TAB_ICONS: Record<
  MainTabRouteName,
  React.ComponentProps<typeof Ionicons>['name']
> = {
  HomeTab: 'home-outline',
  ScanTab: 'camera-outline',
  ConsultationTab: 'chatbubble-ellipses-outline',
  ProfileTab: 'person-outline',
};

function HomeStackNavigator(): React.JSX.Element {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Home" component={HomeScreen} />
      <HomeStack.Screen name="HistoryDetail" component={HistoryDetailScreen} />
    </HomeStack.Navigator>
  );
}

function ScanStackNavigator(): React.JSX.Element {
  return (
    <ScanStack.Navigator screenOptions={{ headerShown: false }}>
      <ScanStack.Screen name="CameraScan" component={CameraScanScreen} />
      <ScanStack.Screen name="ScanResult" component={ScanResultScreen} />
    </ScanStack.Navigator>
  );
}

function ConsultationStackNavigator(): React.JSX.Element {
  return (
    <ConsultationStack.Navigator screenOptions={{ headerShown: false }}>
      <ConsultationStack.Screen name="DoctorList" component={DoctorListScreen} />
      <ConsultationStack.Screen name="ChatRoom" component={ChatRoomScreen} />
    </ConsultationStack.Navigator>
  );
}

function ProfileStackNavigator(): React.JSX.Element {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="Profile" component={ProfileScreen} />
    </ProfileStack.Navigator>
  );
}

export const MainTabNavigator: React.FC = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: Colors.textLink,
      tabBarInactiveTintColor: Colors.textSecondary,
      tabBarLabelStyle: { fontSize: FontSize.xs, fontWeight: '600' },
      tabBarStyle: {
        paddingTop: Spacing.xs,
        backgroundColor: Colors.surface,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: Colors.border,
      },
      // eslint-disable-next-line react/no-unstable-nested-components
      tabBarIcon: ({ color, size }) => (
        <Ionicons name={TAB_ICONS[route.name]} size={size} color={color} />
      ),
    })}>
    <Tab.Screen
      name="HomeTab"
      component={HomeStackNavigator}
      options={{ title: 'Home' }}
    />
    <Tab.Screen
      name="ScanTab"
      component={ScanStackNavigator}
      options={{ title: 'Scan' }}
    />
    <Tab.Screen
      name="ConsultationTab"
      component={ConsultationStackNavigator}
      options={{ title: 'Konsultasi' }}
    />
    <Tab.Screen
      name="ProfileTab"
      component={ProfileStackNavigator}
      options={{ title: 'Profil' }}
    />
  </Tab.Navigator>
);
