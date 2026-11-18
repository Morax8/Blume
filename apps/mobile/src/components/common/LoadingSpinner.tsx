/**
 * Spinner loading reusabel. Mode fullScreen menutupi seluruh layar.
 *
 * @format
 */

import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Colors } from '../../utils/constants';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  /** Jika true, spinner dipusatkan memenuhi layar. */
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  color = Colors.textLink,
  fullScreen = false,
}) => {
  const indicator = <ActivityIndicator size={size} color={color} />;

  if (fullScreen) {
    return <View style={styles.fullScreen}>{indicator}</View>;
  }
  return indicator;
};

const styles = StyleSheet.create({
  fullScreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
});
