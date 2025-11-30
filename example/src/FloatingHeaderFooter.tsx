import React, {useState} from 'react';
import {ListRenderItemInfo, Platform, StyleSheet, View} from 'react-native';

import {
  ReorderableListReorderEvent,
  reorderItems,
} from 'react-native-reorderable-list';

import {
  ItemSeparator,
  ListItem,
  ReorderableList,
  SeedDataItem,
  TitleHighlight,
  useHorizontal,
  usePanGesture,
  useSeedData,
} from './common';

const START_SIZE = 70;
const END_SIZE = 60;

const contentInsetVertical = {top: START_SIZE, bottom: END_SIZE};
const contentInsetHorizontal = {left: START_SIZE, right: END_SIZE};
const autoscrollThresholdOffset = Platform.select({
  ios: {start: START_SIZE, end: END_SIZE},
});
const contentOffsetVertical = Platform.select({ios: {y: -START_SIZE, x: 0}});
const contentOffsetHorizontal = Platform.select({ios: {y: 0, x: -START_SIZE}});

export const FloatingHeaderFooterScreen = () => {
  const seedData = useSeedData();
  const [data, setData] = useState(seedData);
  const panGesture = usePanGesture();
  const {horizontal} = useHorizontal();

  const handleReorder = ({from, to}: ReorderableListReorderEvent) => {
    setData(value => reorderItems(value, from, to));
  };

  const renderItem = ({item}: ListRenderItemInfo<SeedDataItem>) => (
    <ListItem {...item} />
  );

  return (
    <View style={styles.container}>
      <TitleHighlight
        title="Start"
        style={[
          Platform.select({ios: styles.absoluteContainer}),
          horizontal ? styles.left : styles.top,
        ]}
      />
      <ReorderableList
        data={data}
        onReorder={handleReorder}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ItemSeparatorComponent={ItemSeparator}
        autoscrollThresholdOffset={autoscrollThresholdOffset}
        contentInset={
          horizontal ? contentInsetHorizontal : contentInsetVertical
        }
        contentOffset={
          horizontal ? contentOffsetHorizontal : contentOffsetVertical
        }
        panGesture={panGesture}
      />
      <TitleHighlight
        title="End"
        style={[
          Platform.select({ios: styles.absoluteContainer}),
          horizontal ? styles.right : styles.bottom,
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  absoluteContainer: {
    position: 'absolute',
    zIndex: 1,
    opacity: 0.75,
  },
  top: {
    top: 0,
    right: 0,
    left: 0,
    height: START_SIZE,
  },
  bottom: {
    bottom: 0,
    right: 0,
    left: 0,
    height: END_SIZE,
  },
  left: {
    top: 0,
    left: 0,
    width: START_SIZE,
    height: '100%',
  },
  right: {
    top: 0,
    right: 0,
    width: END_SIZE,
    height: '100%',
  },
});
