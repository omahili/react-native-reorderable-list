import React, {useState} from 'react';
import {ListRenderItemInfo, Platform, StyleSheet, View} from 'react-native';

import ReorderableList, {
  ReorderableListReorderEvent,
  reorderItems,
} from 'react-native-reorderable-list';

import {
  ItemSeparator,
  ListItem,
  SeedDataItem,
  TitleHighlight,
  usePanGesture,
  useSeedData,
} from './common';

const TOP_HEIGHT = 150;
const BOTTOM_HEIGHT = 100;

const contentInset = {top: TOP_HEIGHT, bottom: BOTTOM_HEIGHT};
const autoscrollThresholdOffset = Platform.select({ios: contentInset});
const contentOffset = Platform.select({ios: {y: -TOP_HEIGHT, x: 0}});

export const FloatingHeaderFooterScreen = () => {
  const seedData = useSeedData();
  const [data, setData] = useState(seedData);
  const panGesture = usePanGesture();

  const handleReorder = ({from, to}: ReorderableListReorderEvent) => {
    setData(value => reorderItems(value, from, to));
  };

  const renderItem = ({item}: ListRenderItemInfo<SeedDataItem>) => (
    <ListItem {...item} />
  );

  return (
    <View style={styles.container}>
      <TitleHighlight
        title="Floating Top"
        style={[Platform.select({ios: styles.absoluteContainer}), styles.top]}
      />
      <ReorderableList
        data={data}
        onReorder={handleReorder}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ItemSeparatorComponent={ItemSeparator}
        autoscrollThresholdOffset={autoscrollThresholdOffset}
        contentInset={contentInset}
        contentOffset={contentOffset}
        panGesture={panGesture}
      />
      <TitleHighlight
        title="Floating Bottom"
        style={[
          Platform.select({ios: styles.absoluteContainer}),
          styles.bottom,
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
    right: 0,
    left: 0,
    zIndex: 1,
    opacity: 0.75,
  },
  top: {
    top: 0,
    height: TOP_HEIGHT,
  },
  bottom: {
    bottom: 0,
    height: BOTTOM_HEIGHT,
  },
});
