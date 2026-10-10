/**
 * Deklarasi modul untuk react-native-vector-icons.
 * Package ini tidak menyertakan type definitions bawaan (hanya .js + .flow).
 *
 * Alternatif lebih kaya (union type nama ikon): hapus file ini lalu
 * install `@types/react-native-vector-icons` sebagai devDependency.
 *
 * @format
 */

declare module 'react-native-vector-icons/Ionicons' {
  import type { Component } from 'react';
  import type { TextProps } from 'react-native';

  export interface IconProps extends TextProps {
    name: string;
    size?: number;
    color?: string;
  }

  export default class Ionicons extends Component<IconProps> {}
}
