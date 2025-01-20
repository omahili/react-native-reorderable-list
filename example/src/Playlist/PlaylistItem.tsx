import React, {memo} from 'react';
import {Image, Pressable, StyleSheet, Text, View} from 'react-native';

import {useReorderableDrag} from 'react-native-reorderable-list';

interface PlaylistItemProps {
  image: string;
  title: string;
  author: string;
}

export const PlaylistItem: React.FC<PlaylistItemProps> = memo(
  ({image, title, author}) => {
    const drag = useReorderableDrag();

    return (
      <Pressable style={styles.container} onLongPress={drag}>
        <Image
          style={styles.image}
          source={{
            uri: image,
          }}
        />
        <View style={styles.details}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.author}>{author}</Text>
        </View>
      </Pressable>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
  },
  image: {
    height: 50,
    width: 50,
    borderRadius: 4,
  },
  details: {
    paddingHorizontal: 12,
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: 'black',
  },
  author: {
    fontSize: 14,
    color: 'gray',
  },
});
