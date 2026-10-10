/**
 * Layar registrasi akun baru. Setelah sukses, langsung login otomatis.
 *
 * @format
 */

import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/useAuthStore';
import { Colors, FontSize, Spacing } from '../../utils/constants';
import type { AuthStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
}

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const login = useAuthStore((state) => state.login);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!name.trim()) {
      next.name = 'Nama wajib diisi';
    }
    if (!email.trim()) {
      next.email = 'Email wajib diisi';
    }
    if (password.length < 6) {
      next.password = 'Password minimal 6 karakter';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleRegister = async (): Promise<void> => {
    if (!validate()) {
      return;
    }
    setLoading(true);
    try {
      const { token, user } = await authService.register({
        name: name.trim(),
        email: email.trim(),
        password,
      });
      // Registrasi sukses -> langsung masuk aplikasi.
      login(token, user);
    } catch {
      // TODO: tangani error email sudah terdaftar dari response backend.
      Alert.alert('Registrasi Gagal', 'Coba periksa kembali data kamu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Buat Akun</Text>
          <Text style={styles.subtitle}>
            Daftar untuk mulai merawat tanamanmu
          </Text>
        </View>

        <Input
          label="Nama Lengkap"
          placeholder="Nama kamu"
          autoCapitalize="words"
          value={name}
          error={errors.name}
          onChangeText={setName}
        />
        <Input
          label="Email"
          placeholder="nama@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          value={email}
          error={errors.email}
          onChangeText={setEmail}
        />
        <Input
          label="Password"
          placeholder="Minimal 6 karakter"
          secureTextEntry
          value={password}
          error={errors.password}
          onChangeText={setPassword}
        />

        <Button
          title="Daftar"
          loading={loading}
          onPress={handleRegister}
          style={styles.submitButton}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Sudah punya akun? </Text>
          <Pressable onPress={() => navigation.navigate('Login')} hitSlop={8}>
            <Text style={styles.link}>Masuk</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.text,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginTop: Spacing.xs + 2,
  },
  submitButton: {
    marginTop: Spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.lg,
  },
  footerText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  link: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.primary,
  },
});
