import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React, { useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { IconSymbol } from './ui/icon-symbol';

interface CommentModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (content: string) => Promise<void>;
}

export function CommentModal({ visible, onClose, onSubmit }: CommentModalProps) {
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme();

  const handleSend = async () => {
    if (!comment.trim()) return;

    setLoading(true);
    try {
      await onSubmit(comment);
      setComment('');
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <ThemedView style={styles.content}>
          <View style={styles.header}>
            <ThemedText type="defaultSemiBold">Add Comment</ThemedText>
            <TouchableOpacity onPress={onClose}>
              <IconSymbol name="xmark" size={20} color="#888" />
            </TouchableOpacity>
          </View>

          <TextInput
            style={[styles.input, { color: colorScheme === 'dark' ? '#fff' : '#000', borderColor: colorScheme === 'dark' ? '#444' : '#ccc' }]}
            placeholder="Write a comment..."
            placeholderTextColor="#888"
            multiline
            value={comment}
            onChangeText={setComment}
            maxLength={300}
            autoFocus
          />

          <TouchableOpacity
            style={[styles.button, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}
            onPress={handleSend}
            disabled={loading || !comment.trim()}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.buttonText}>Post Comment</ThemedText>
            )}
          </TouchableOpacity>
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    minHeight: 100,
    fontSize: 16,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  button: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
