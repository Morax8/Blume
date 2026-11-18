/**
 * Room chat konsultasi dengan dokter.
 *
 * Alur yang benar (backend membuat room UUID sendiri):
 *  1. POST /chat/rooms {doctorId} -> dapat roomId asli (UUID)
 *  2. GET  /chat/{roomId}/messages -> riwayat pesan (sudah membawa isMine)
 *  3. socket.connect() + joinRoom(roomId) + onMessage(handler)
 *  4. kirim: socket.sendMessage({ roomId, content }) — pesan BALIK lewat
 *     broadcast 'receiveMessage', jadi tidak di-append manual.
 *  5. unmount: leaveRoom(roomId) + offMessage/offConnectError + disconnect
 *
 * @format
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MessageBubble } from '../../components/cards/MessageBubble';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { chatService } from '../../services/chatService';
import { socketService } from '../../services/socketService';
import { useAuthStore } from '../../store/useAuthStore';
import { pesanError } from '../../utils/apiError';
import { BorderRadius, Colors, FontFamily, FontSize, Spacing } from '../../utils/constants';
import type { ChatMessage } from '../../types/user';
import type { ConsultationStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<ConsultationStackParamList, 'ChatRoom'>;

export const ChatRoomScreen: React.FC<Props> = ({ route, navigation }) => {
  const { doctorId, doctorName } = route.params;
  const currentUser = useAuthStore((state) => state.user);
  const insets = useSafeAreaInsets();

  const [roomId, setRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const listRef = useRef<FlatList<ChatMessage>>(null);

  useEffect(() => {
    let cancelled = false;
    // Simpan roomId hasil resolve untuk cleanup (leaveRoom) saat unmount.
    let activeRoomId: string | null = null;

    const setup = async (): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        // 1. Ambil roomId asli (UUID) dari backend — bukan doctorId.
        const room = await chatService.getOrCreateRoom(doctorId);
        if (cancelled) {
          return;
        }
        activeRoomId = room.id;
        setRoomId(room.id);

        // 2. Muat riwayat pesan lama (sudah membawa isMine dari backend).
        const history = await chatService.getMessages(room.id);
        if (cancelled) {
          return;
        }
        setMessages(history);

        // 3. Buka socket, masuk room, pasang listener.
        socketService.connect();
        socketService.joinRoom(room.id);
        socketService.onMessage((message: ChatMessage) => {
          if (cancelled) {
            return;
          }
          setMessages((prev) => [
            ...prev,
            { ...message, isMine: message.senderId === currentUser?.id },
          ]);
        });
        socketService.onConnectError(() => {
          if (cancelled) {
            return;
          }
          setError('Koneksi chat gagal. Periksa koneksi lalu coba lagi.');
        });
      } catch (err) {
        if (!cancelled) {
          setError(pesanError(err));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    setup();

    return () => {
      cancelled = true;
      if (activeRoomId) {
        socketService.leaveRoom(activeRoomId);
      }
      socketService.offMessage();
      socketService.offConnectError();
      socketService.disconnect();
    };
  }, [doctorId, currentUser?.id]);

  const handleSend = (): void => {
    const content = input.trim();
    if (!content || !roomId) {
      return;
    }
    // Pesan akan balik lewat broadcast 'receiveMessage' — jangan append manual.
    socketService.sendMessage({ roomId, content });
    setInput('');
  };

  const renderItem = ({ item }: { item: ChatMessage }): React.JSX.Element => (
    <MessageBubble message={item} isMine={item.isMine === true} />
  );

  const renderBody = (): React.JSX.Element => {
    if (loading) {
      return (
        <View style={styles.centerWrap}>
          <LoadingSpinner />
          <Text style={styles.centerText}>Membuka ruang chat…</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerWrap}>
          <Ionicons name="alert-circle-outline" size={40} color={Colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    return (
      <>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Ionicons
                name="chatbubbles-outline"
                size={40}
                color={Colors.textSecondary}
              />
              <Text style={styles.emptyText}>Mulai percakapan dengan dokter.</Text>
            </View>
          }
        />

        {/* Input bar */}
        <View
          style={[styles.inputBar, { paddingBottom: insets.bottom + Spacing.sm }]}>
          <TextInput
            style={styles.input}
            placeholder="Tulis pesan…"
            placeholderTextColor={Colors.textPlaceholder}
            value={input}
            onChangeText={setInput}
            multiline
          />
          <Pressable
            onPress={handleSend}
            disabled={!input.trim()}
            style={[styles.sendButton, !input.trim() && styles.sendDisabled]}>
            <Ionicons name="send" size={18} color={Colors.textOnPrimary} />
          </Pressable>
        </View>
      </>
    );
  };

  return (
    <View style={styles.flex}>
      {/* Judul + back di atas latar hijau */}
      <Pressable
        onPress={() => navigation.goBack()}
        hitSlop={8}
        style={styles.backButton}>
        <Ionicons name="chevron-back" size={24} color={Colors.text} />
      </Pressable>
      <View style={styles.titleWrap}>
        <Text style={styles.title} numberOfLines={1}>
          {doctorName ?? 'Chat Dokter'}
        </Text>
      </View>

      {/* Sheet putih: loading / error / pesan + input */}
      <KeyboardAvoidingView
        style={styles.sheet}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top + 48}>
        {renderBody()}
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  backButton: {
    position: 'absolute',
    left: 12,
    top: 40,
    width: 45,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  titleWrap: {
    position: 'absolute',
    top: 45,
    left: 64,
    right: 31,
    zIndex: 1,
  },
  title: {
    fontSize: 24,
    fontFamily: FontFamily.semiBold,
    letterSpacing: -0.5,
    color: Colors.text,
  },
  sheet: {
    flex: 1,
    marginTop: 136,
    backgroundColor: Colors.sheet,
    borderTopLeftRadius: BorderRadius.sheet,
    borderTopRightRadius: BorderRadius.sheet,
    paddingHorizontal: 30,
    paddingTop: 24,
  },
  listContent: {
    paddingVertical: Spacing.md,
    flexGrow: 1,
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl * 2,
  },
  emptyText: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.regular,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  centerWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  centerText: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.regular,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  errorText: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.regular,
    color: Colors.error,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
    backgroundColor: Colors.sheet,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    minHeight: 40,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.surfaceMuted,
    fontSize: FontSize.sm,
    fontFamily: FontFamily.regular,
    color: Colors.text,
    marginRight: Spacing.sm,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: {
    opacity: 0.4,
  },
});
