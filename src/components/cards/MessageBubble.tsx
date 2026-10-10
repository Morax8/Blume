/**
 * Bubble pesan chat. Posisi kanan (warna primer) untuk pesan sendiri,
 * kiri (warna netral) untuk pesan lawan bicara.
 *
 * @format
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BorderRadius, Colors, FontSize, Spacing } from '../../utils/constants';
import { formatTime } from '../../utils/formatters';
import type { ChatMessage } from '../../types/user';

interface MessageBubbleProps {
  message: ChatMessage;
  /** True jika pesan dikirim oleh user yang sedang login. */
  isMine: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isMine,
}) => (
  <View style={[styles.wrapper, isMine ? styles.wrapperMine : styles.wrapperTheirs]}>
    <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
      <Text style={[styles.text, isMine ? styles.textMine : styles.textTheirs]}>
        {message.content}
      </Text>
      <Text style={[styles.time, isMine ? styles.timeMine : styles.timeTheirs]}>
        {formatTime(message.createdAt)}
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    marginVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
  },
  wrapperMine: {
    justifyContent: 'flex-end',
  },
  wrapperTheirs: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    borderBottomLeftRadius: BorderRadius.lg,
    borderBottomRightRadius: BorderRadius.sm,
  },
  bubbleMine: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: BorderRadius.lg,
    borderBottomLeftRadius: BorderRadius.sm,
  },
  bubbleTheirs: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  text: {
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
  textMine: {
    color: Colors.textOnPrimary,
  },
  textTheirs: {
    color: Colors.text,
  },
  time: {
    fontSize: 10,
    marginTop: 2,
    alignSelf: 'flex-end',
  },
  timeMine: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  timeTheirs: {
    color: Colors.textSecondary,
  },
});
