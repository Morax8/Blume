/**
 * Type definitions untuk React Navigation param lists.
 * Menjaga type-safety antar screen & navigator.
 *
 * @format
 */

import type { NavigatorScreenParams } from '@react-navigation/native';

/**
 * Root stack: switcher antara Auth flow dan Main (authenticated) flow.
 */
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};

/**
 * Stack untuk flow autentikasi (belum login).
 */
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

/**
 * Bottom tabs utama (sudah login). Tiap tab menampung nested stack.
 * Params optional (| undefined) agar navigate('ScanTab') tanpa params valid.
 */
export type MainTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList> | undefined;
  ScanTab: NavigatorScreenParams<ScanStackParamList> | undefined;
  ConsultationTab: NavigatorScreenParams<ConsultationStackParamList> | undefined;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList> | undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  HistoryDetail: { detectionId: string };
};

export type ScanStackParamList = {
  CameraScan: undefined;
  /** imageUri hasil jepret kamera, dipakai ScanResultScreen untuk upload. */
  ScanResult: { imageUri: string };
};

export type ConsultationStackParamList = {
  DoctorList: undefined;
  ChatRoom: { doctorId: string; doctorName?: string };
};

export type ProfileStackParamList = {
  Profile: undefined;
};

/**
 * Nama-nama route tab, dipakai untuk mapping ikon tab bar.
 */
export type MainTabRouteName = keyof MainTabParamList;
