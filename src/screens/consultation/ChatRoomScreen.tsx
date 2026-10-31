/**
 * Room chat konsultasi dengan dokter via Socket.io.
 * - Connect & joinRoom saat mount
 * - Kirim pesan dengan optimistic UI
 * - Cleanup listener saat unmount
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
import { socketService } from '../../services/socketService';
import { useAuthStore } from '../../store/useAuthStore';
import { BorderRadius, Colors, FontSize, Spacing } from '../../utils/constants';
import type { ChatMessage } from '../../types/user';
import type { ConsultationStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<ConsultationStackParamList, 'ChatRoom'>;

export const ChatRoomScreen: React.FC<Props> = ({ route, navigation }) => {
  const { doctorId, doctorName } = route.params;
  const currentUser = useAuthStore((state) => state.user);
  const insets = useSafeAreaInsets();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const listRef = useRef<FlatList<ChatMessage>>(null);

  useEffect(() => {
    socketService.connect(doctorId);
    socketService.joinRoom(doctorId);

    const handleMessage = (message: ChatMessage): void => {
      setMessages((prev) => [
        ...prev,
        { ...message, isMine: message.senderId === currentUser?.id },
      ]);
    };
    socketService.onMessage(handleMessage);

    return () => {
      socketService.offMessage();
      socketService.leaveRoom(doctorId);
      // TODO: pertahankan koneksi jika masih dibutuhkan screen lain.
      socketService.disconnect();
    };
  }, [doctorId, currentUser?.id]);

  const handleSend = (): void => {
    const content = input.trim();
    if (!content) {
      return;
    }
    // Optimistic UI: tampilkan pesan lokal, status diperbarui dari server.
    const optimistic: ChatMessage = {
      id: `local-${Date.now()}`,
      roomId: doctorId,
      senderId: currentUser?.id ?? 'me',
      content,
      createdAt: new Date().toISOString(),
      isMine: true,
      status: 'sending',
    };
    setMessages((prev) => [...prev, optimistic]);
    socketService.sendMessage({ roomId: doctorId, content });
    setInput('');
  };

  const renderItem = ({ item }: { item: ChatMessage }): React.JSX.Element => (
    <MessageBubble message={item} isMine={item.isMine === true} />
  );

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

      {/* Sheet putih: pesan + input */}
      <KeyboardAvoidingView
        style={styles.sheet}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top + 48}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() =>
            listRef.current?.scrollToEnd({ animated: true })
          }
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Ionicons
                name="chatbubbles-outline"
                size={40}
                color={Colors.textSecondary}
              />
              <Text style={styles.emptyText}>
                Mulai percakapan dengan dokter.
              </Text>
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
    fontWeight: '600',
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
    color: Colors.textSecondary,
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
