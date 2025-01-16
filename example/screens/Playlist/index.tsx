import React, {useState} from 'react';
import {ListRenderItemInfo, StyleSheet} from 'react-native';

import ReorderableList, {
  ReorderableListReorderEvent,
  reorderItems,
} from 'react-native-reorderable-list';

import playlistData from './data.json';
import {PlaylistItem} from './PlaylistItem';
import {PlaylistItemSeparator} from './PlaylistItemSeparator';

export interface PlaylistItemData {
  id: string;
  image: string;
  author: string;
  title: string;
}

export const PlaylistScreen = () => {
  const [data, setData] = useState(playlistData);

  const handleReorder = ({from, to}: ReorderableListReorderEvent) => {
    setData(value => reorderItems(value, from, to));
  };

  const renderItem = ({item}: ListRenderItemInfo<PlaylistItemData>) => (
    <PlaylistItem {...item} />
  );

  return (
    <ReorderableList
      data={data}
      onReorder={handleReorder}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      ItemSeparatorComponent={PlaylistItemSeparator}
      style={styles.list}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: 'white',
  },
});
