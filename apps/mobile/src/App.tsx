/**
 * Blume - aplikasi deteksi penyakit kulit.
 * Entry point (AppRegistry) ada di index.js;
 * komponen ini merender root navigator.
 *
 * @format
 */

import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DisclaimerModal } from './components/common/DisclaimerModal';
import { RootNavigator } from './navigation/RootNavigator';

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <RootNavigator />
      {/* Disclaimer AI sekali pakai — tampil di atas seluruh navigasi. */}
      <DisclaimerModal />
    </SafeAreaProvider>
  );
}

export default App;
