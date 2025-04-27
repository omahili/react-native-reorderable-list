import React, {useCallback, useState} from 'react';
import {Button, ListRenderItemInfo, StyleSheet, View} from 'react-native';

import ReorderableList, {
  ReorderableListReorderEvent,
  reorderItems,
} from 'react-native-reorderable-list';

import {
  ItemSeparator,
  SeedDataItem,
  usePanGesture,
  useSeedData,
} from '../common';
import {SwipeableListItem} from './SwipeableListItem';

export const SwipeableListScreen = () => {
  const seedData = useSeedData(5);
  const [data, setData] = useState(seedData);
  const panGesture = usePanGesture();

  const handleReorder = ({from, to}: ReorderableListReorderEvent) => {
    setData(value => reorderItems(value, from, to));
  };

  const handleDeletePress = useCallback((id: string) => {
    setData(value => value.filter(x => x.id !== id));
  }, []);

  const renderItem = ({item}: ListRenderItemInfo<SeedDataItem>) => (
    <SwipeableListItem {...item} onDeletePress={handleDeletePress} />
  );

  const handleResetPress = () => setData(seedData);

  return (
    <View style={styles.container}>
      <ReorderableList
        data={data}
        onReorder={handleReorder}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ItemSeparatorComponent={ItemSeparator}
        contentContainerStyle={styles.listContentContainer}
        panGesture={panGesture}
        cellAnimations={{
          // Disable opacity animation to avoid seeing the delete action underneath.
          opacity: 1,
        }}
      />
      <Button title="Reset" onPress={handleResetPress} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 32,
  },
  listContentContainer: {
    flexGrow: 1,
  },
});
