import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Radius, Shadows, Spacing, Typography } from '../constants/theme';

const { width } = Dimensions.get('window');

interface PostProps {
  username: string;
  location: string;
  imageUrl: string;
  caption: string;
  likes: number;
}

export default function FeedPost({ username, location, imageUrl, caption, likes }: PostProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [currentLikes, setCurrentLikes] = useState(likes);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setCurrentLikes(prev => isLiked ? prev - 1 : prev + 1);
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userRow}>
          <View style={styles.avatar} />
          <View>
            <Text style={styles.usernameText}>{username}</Text>
            <Text style={styles.locationText}>{location}</Text>
          </View>
        </View>
        <TouchableOpacity activeOpacity={0.7}>
          <Ionicons name="ellipsis-horizontal" size={20} color={Colors.ui.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Image */}
      <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />

      {/* Actions */}
      <View style={styles.actionBar}>
        <View style={styles.leftActions}>
          <TouchableOpacity 
            style={styles.iconBtn}
            onPress={handleLike}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={isLiked ? "heart" : "heart-outline"} 
              size={26} 
              color={isLiked ? Colors.claire.primary : Colors.ui.text} 
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
            <Ionicons name="chatbubble-outline" size={24} color={Colors.ui.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
            <Ionicons name="paper-plane-outline" size={24} color={Colors.ui.text} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity activeOpacity={0.7}>
          <Ionicons name="bookmark-outline" size={24} color={Colors.ui.text} />
        </TouchableOpacity>
      </View>

      {/* Caption */}
      <View style={styles.textArea}>
        <Text style={styles.likes}>{currentLikes} likes</Text>
        <Text style={styles.caption}>
          <Text style={styles.username}>{username}</Text> {caption}
        </Text>
        <Text style={styles.time}>2 hours ago</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1A1A1A', // Fully opaque - no transparency
    marginBottom: Spacing.lg,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    ...Shadows.md,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.claire.primary,
    marginRight: Spacing.sm,
  },
  usernameText: {
    ...Typography.bodyBold,
    color: Colors.ui.text,
  },
  locationText: {
    ...Typography.caption,
    color: Colors.ui.textSecondary,
    marginTop: 2,
  },
  image: {
    width: width - Spacing.md * 2,
    height: (width - Spacing.md * 2) * 1.2,
    backgroundColor: '#252525', // Fully opaque
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    marginRight: Spacing.md,
  },
  textArea: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  likes: {
    ...Typography.bodyBold,
    color: Colors.ui.text,
    marginBottom: Spacing.xs,
  },
  caption: {
    ...Typography.body,
    color: Colors.ui.text,
    lineHeight: 22,
    marginBottom: Spacing.xs,
  },
  username: {
    ...Typography.bodyBold,
    color: Colors.ui.text,
  },
  time: {
    ...Typography.caption,
    color: Colors.ui.textTertiary,
    marginTop: Spacing.xs,
  },
});