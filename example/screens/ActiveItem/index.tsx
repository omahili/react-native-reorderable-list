import React, {useState} from 'react';
import {ListRenderItemInfo, StyleSheet} from 'react-native';

import ReorderableList, {
  ReorderableListReorderEvent,
  reorderItems,
} from 'react-native-reorderable-list';

import {PlaylistItem} from './PlaylistItem';
import {PlaylistItemData} from '../Playlist';
import playlistData from '../Playlist/data.json';
import {PlaylistItemSeparator} from '../Playlist/PlaylistItemSeparator';

export const ActiveItemScreen = () => {
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
      shouldUpdateActiveItem
    />
  );
};

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: 'white',
  },
});
