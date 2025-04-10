import React, {memo} from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {useReorderableDrag} from 'react-native-reorderable-list';

interface PlaylistItemProps {
  image: string;
  title: string;
  author: string;
  id: string;
  deleteItem: (id: string) => void;
}

export const PlaylistItem: React.FC<PlaylistItemProps> = memo(
  ({image, title, author, deleteItem, id}) => {
    const drag = useReorderableDrag();

    const handleDelete = () => {
      deleteItem(id);
    };

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
        <TouchableOpacity onPress={handleDelete} style={styles.delete}>
          <Text>X</Text>
        </TouchableOpacity>
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
  delete: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'lightgrey',
    color: 'white',
    borderRadius: 4,
    fontWeight: 'bold',
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
