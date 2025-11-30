import React, {useCallback, useState} from 'react';
import {Button, ListRenderItemInfo, StyleSheet, View} from 'react-native';

import {LinearTransition} from 'react-native-reanimated';
import {
  ReorderableListReorderEvent,
  reorderItems,
} from 'react-native-reorderable-list';

import {
  ItemSeparator,
  ReorderableList,
  SeedDataItem,
  createDataItem,
  usePanGesture,
  useSeedData,
} from '../common';
import {LayoutAnimationsItem} from './LayoutAnimationsItem';

export const LayoutAnimationsScreen = () => {
  const seedData = useSeedData(5);
  const [data, setData] = useState(seedData);
  const panGesture = usePanGesture();

  const handleReorder = useCallback(
    ({from, to}: ReorderableListReorderEvent) => {
      setData(value => reorderItems(value, from, to));
    },
    [],
  );

  const handleAddPress = useCallback(() => {
    setData(value => [createDataItem(), ...value]);
  }, []);

  const handleDeletePress = useCallback((id: string) => {
    setData(value => value.filter(x => x.id !== id));
  }, []);

  const renderItem = useCallback(
    ({item}: ListRenderItemInfo<SeedDataItem>) => (
      <LayoutAnimationsItem {...item} onDeletePress={handleDeletePress} />
    ),
    [handleDeletePress],
  );

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
        itemLayoutAnimation={LinearTransition}
        cellAnimations={{
          // Disable opacity animation to avoid seeing the delete action underneath.
          opacity: 1,
        }}
      />
      <Button title="Add" onPress={handleAddPress} />
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
