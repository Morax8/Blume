module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['./jest.setup.js'],
  // Transform package yang shipping ESM (React Navigation, screens, dll)
  // agar bisa di-parse Jest.
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|react-native-vector-icons|react-native-screens|react-native-safe-area-context|react-native-vision-camera|@react-native-async-storage|zustand|axios|socket.io-client)/)',
  ],
};
