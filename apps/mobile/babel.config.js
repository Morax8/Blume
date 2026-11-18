/**
 * Konfigurasi Babel — preset RN + plugin react-native-dotenv.
 *
 * @format
 */

module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    ['module:react-native-dotenv', {
      moduleName: '@env',
      path: '.env',
      allowUndefined: true,
    }],
  ],
};
