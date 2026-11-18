/**
 * Layar verifikasi kode OTP 6 digit setelah register.
 * Belum aktif di flow (lihat ENABLE_OTP di constants) karena backend
 * belum punya endpoint POST /auth/verify-otp.
 *
 * @format
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../../components/common/Button';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/useAuthStore';
import {
  BorderRadius,
  Colors,
  FontFamily,
  FontSize,
  Spacing,
} from '../../utils/constants';
import type { AuthStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<AuthStackParamList, 'Otp'>;

/** Jumlah kotak digit OTP. */
const OTP_LENGTH = 6;

/** Durasi countdown kirim ulang kode (detik). */
const RESEND_SECONDS = 60;

export const OtpScreen: React.FC<Props> = ({ navigation, route }) => {
  const { email } = route.params;
  const login = useAuthStore((state) => state.login);
  const insets = useSafeAreaInsets();

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_SECONDS);

  const inputRefs = useRef<(React.ComponentRef<typeof TextInput> | null)[]>([]);

  // Hitung mundur untuk tombol "Kirim ulang kode".
  useEffect(() => {
    if (countdown <= 0) {
      return;
    }
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const code = digits.join('');
  const isComplete = code.length === OTP_LENGTH;

  const handleChangeDigit = (index: number, value: string): void => {
    // Ambil karakter terakhir kalau user paste lebih dari satu digit.
    const digit = value.slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
    // Auto-focus ke kotak berikutnya saat terisi.
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (index: number, key: string): void => {
    // Backspace pada kotak kosong -> mundur ke kotak sebelumnya.
    if (key === 'Backspace' && !digits[index] && index > 0) {
      setDigits((prev) => {
        const next = [...prev];
        next[index - 1] = '';
        return next;
      });
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = (): void => {
    if (countdown > 0) {
      return;
    }
    // TODO: panggil endpoint kirim ulang OTP saat backend tersedia.
    setDigits(Array(OTP_LENGTH).fill(''));
    inputRefs.current[0]?.focus();
    setCountdown(RESEND_SECONDS);
  };

  const handleVerify = async (): Promise<void> => {
    if (!isComplete || loading) {
      return;
    }
    setLoading(true);
    try {
      const { token, user } = await authService.verifyOtp({ email, code });
      login(token, user);
    } catch {
      Alert.alert('Verifikasi Gagal', 'Kode salah atau sudah kedaluwarsa.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        {/* Brand di atas latar hijau layar */}
        <View style={[styles.hero, { paddingTop: insets.top + 42 }]}>
          <Text style={styles.brandTitle}>Blume</Text>
          <Text style={styles.brandTagline}>
            Deteksi penyakit kulit lebih awal
          </Text>
        </View>

        {/* Sheet putih berisi form OTP, menumpuk latar hijau */}
        <View style={styles.sheet}>
          <Text style={styles.title}>Verifikasi Email</Text>
          <Text style={styles.subtitle}>Kode 6 digit dikirim ke {email}</Text>

          <View style={styles.otpRow}>
            {digits.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                style={[
                  styles.otpBox,
                  focusedIndex === index && styles.otpBoxFocused,
                ]}
                value={digit}
                onChangeText={(value) => handleChangeDigit(index, value)}
                onKeyPress={({ nativeEvent }) =>
                  handleKeyPress(index, nativeEvent.key)
                }
                onFocus={() => setFocusedIndex(index)}
                keyboardType="number-pad"
                maxLength={1}
                caretHidden
                accessibilityLabel={`Digit OTP ke-${index + 1}`}
              />
            ))}
          </View>

          <Button
            title="Verifikasi"
            loading={loading}
            disabled={!isComplete}
            onPress={handleVerify}
            style={styles.submitButton}
          />

          <Pressable onPress={handleResend} hitSlop={8} style={styles.resendLink}>
            <Text
              style={[styles.link, countdown > 0 && styles.linkDisabled]}>
              {countdown > 0
                ? `Kirim ulang kode (${countdown}s)`
                : 'Kirim ulang kode'}
            </Text>
          </Pressable>

          <View style={styles.footer}>
            <Pressable
              onPress={() => navigation.navigate('Login')}
              hitSlop={8}>
              <Text style={styles.link}>Kembali ke Login</Text>
            </Pressable>
          </View>
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
  scrollContent: {
    flexGrow: 1,
  },
  hero: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl + Spacing.lg,
  },
  brandTitle: {
    fontSize: FontSize.xxl,
    fontFamily: FontFamily.extraBold,
    color: Colors.textOnHero,
  },
  brandTagline: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.regular,
    color: Colors.textOnHero,
    marginTop: Spacing.xs,
  },
  sheet: {
    flexGrow: 1,
    minHeight: 677,
    backgroundColor: Colors.sheet,
    borderTopLeftRadius: BorderRadius.sheet,
    borderTopRightRadius: BorderRadius.sheet,
    marginTop: -BorderRadius.sheet,
    paddingHorizontal: 30,
    paddingTop: 110,
    paddingBottom: Spacing.xl,
  },
  title: {
    fontSize: FontSize.xxl,
    fontFamily: FontFamily.extraBold,
    color: Colors.text,
  },
  subtitle: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.regular,
    color: Colors.textSecondary,
    marginTop: Spacing.xs + 2,
    marginBottom: Spacing.xl,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  otpBox: {
    width: 48,
    height: 56,
    borderWidth: 1.5,
    borderColor: Colors.borderInput,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.offWhite,
    fontSize: FontSize.lg,
    fontFamily: FontFamily.semiBold,
    color: Colors.text,
    textAlign: 'center',
  },
  otpBoxFocused: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  submitButton: {
    marginTop: Spacing.sm,
  },
  resendLink: {
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  link: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.bold,
    color: Colors.textLink,
  },
  linkDisabled: {
    color: Colors.textPlaceholder,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.lg,
  },
});
