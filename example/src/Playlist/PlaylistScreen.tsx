import React, {useMemo, useState} from 'react';
import {ListRenderItemInfo} from 'react-native';

import {faker} from '@faker-js/faker';
import {
  ReorderableListReorderEvent,
  reorderItems,
} from 'react-native-reorderable-list';

import {PlaylistItem} from './PlaylistItem';
import {PlaylistItemSeparator} from './PlaylistItemSeparator';
import {ReorderableList, usePanGesture} from '../common';

export interface PlaylistItemData {
  id: string;
  image: string;
  author: string;
  title: string;
}

export const PlaylistScreen = () => {
  const seedData = useMemo(
    () =>
      faker.helpers.multiple(
        () => ({
          id: faker.string.uuid(),
          image: faker.image.url(),
          title: faker.music.songName(),
          author: faker.music.artist(),
        }),
        {
          count: 20,
        },
      ),
    [],
  );
  const [data, setData] = useState(seedData);
  const panGesture = usePanGesture();

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
      panGesture={panGesture}
    />
  );
};
