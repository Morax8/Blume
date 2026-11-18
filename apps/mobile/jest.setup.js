/**
 * Jest setup: mock modul native yang tidak tersedia di lingkungan test.
 * Di-load oleh jest.config.js via setupFiles.
 *
 * @format
 */

/* eslint-env jest */

// Ikon vector-icons -> host component dummy.
jest.mock('react-native-vector-icons/Ionicons', () => 'Ionicons');

// Vision camera -> komponen & hooks dummy.
jest.mock('react-native-vision-camera', () => ({
  Camera: 'Camera',
  useCameraDevice: () => undefined,
  useCameraPermission: () => ({
    hasPermission: true,
    requestPermission: jest.fn().mockResolvedValue(true),
  }),
}));

// AsyncStorage -> mock resmi dari package (dipakai zustand persist).
jest.mock(
  '@react-native-async-storage/async-storage',
  () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// Safe area context -> mock resmi dari package (default export berisi
// actual module + override; mencakup context internal yang dipakai
// @react-navigation/elements).
jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default,
);

// react-native-screens -> biarkan JS fallback aktif di test.
jest.mock('react-native-screens', () => {
  const actual = jest.requireActual('react-native-screens');
  return {
    ...actual,
    enableScreens: jest.fn(),
    screensEnabled: () => false,
  };
});
