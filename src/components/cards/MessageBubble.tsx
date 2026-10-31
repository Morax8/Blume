/**
 * Bubble pesan chat. Posisi kanan (pink primer) untuk pesan sendiri,
 * kiri (surface muted) untuk pesan lawan bicara.
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
      <Text style={styles.time}>{formatTime(message.createdAt)}</Text>
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
    borderBottomRightRadius: BorderRadius.lg,
  },
  bubbleMine: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleTheirs: {
    backgroundColor: Colors.surfaceMuted,
    borderBottomLeftRadius: 4,
  },
  text: {
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
  textMine: {
    color: Colors.textOnPrimary,
  },
  textTheirs: {
    color: Colors.textBody,
  },
  time: {
    fontSize: 11,
    marginTop: 2,
    alignSelf: 'flex-end',
    color: Colors.textSecondary,
  },
});
