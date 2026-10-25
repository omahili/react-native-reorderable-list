import React, {useCallback, useMemo, useState} from 'react';
import {ListRenderItemInfo, StyleSheet, View} from 'react-native';

import {Gesture} from 'react-native-gesture-handler';
import {
  ReorderableListReorderEvent,
  reorderItems,
} from 'react-native-reorderable-list';

import {
  ItemSeparator,
  ListItem,
  ReorderableList,
  SeedDataItem,
  useSeedData,
} from './common';

// Positions that stay put: they can't be dragged, and no dragged item can be
// moved across them. Non-contiguous on purpose, to show a wall can sit anywhere.
const LOCKED_INDICES = [0, 4, 9];

export const LockedItemsScreen = () => {
  const seedData = useSeedData();
  const [data, setData] = useState(seedData);

  // Allows for navigation gestures.
  const panGesture = useMemo(
    () => Gesture.Pan().activeOffsetX([-20, 20]).activeOffsetY([0, 0]),
    [],
  );

  const handleReorder = useCallback(
    ({from, to}: ReorderableListReorderEvent) => {
      setData(value => reorderItems(value, from, to));
    },
    [],
  );

  const renderItem = useCallback(
    ({item, index}: ListRenderItemInfo<SeedDataItem>) => {
      const locked = LOCKED_INDICES.includes(index);

      return (
        <ListItem
          dragMode="press-in"
          {...item}
          title={locked ? `🔒 ${item.title}` : item.title}
          style={locked && styles.lockedItem}
        />
      );
    },
    [],
  );

  return (
    <View style={styles.container}>
      <ReorderableList
        data={data}
        onReorder={handleReorder}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ItemSeparatorComponent={ItemSeparator}
        panGesture={panGesture}
        lockedIndices={LOCKED_INDICES}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  lockedItem: {
    backgroundColor: '#f0f0f0',
    opacity: 0.6,
  },
});
