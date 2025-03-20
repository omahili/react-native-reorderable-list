import React, {useState} from 'react';
import {ListRenderItemInfo, LogBox, StyleSheet, View} from 'react-native';

import {
  NestedReorderableList,
  ReorderableListReorderEvent,
  ScrollViewContainer,
  reorderItems,
} from 'react-native-reorderable-list';

import {ListItem, SeedDataItem, TitleHighlight, useSeedData} from './common';

LogBox.ignoreLogs([
  'VirtualizedLists should never be nested inside plain ScrollViews',
]);

interface NestedListProps {
  index: number;
}

const NestedList: React.FC<NestedListProps> = ({index}) => {
  const seedData = useSeedData();
  const [data, setData] = useState(seedData);

  const handleReorder = ({from, to}: ReorderableListReorderEvent) => {
    setData(value => reorderItems(value, from, to));
  };

  const renderItem = ({item}: ListRenderItemInfo<SeedDataItem>) => (
    <ListItem {...item} />
  );

  return (
    <NestedReorderableList
      data={data}
      onReorder={handleReorder}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      scrollEnabled={false}
      ListHeaderComponent={<TitleHighlight title={`Nested List ${index}`} />}
    />
  );
};

export const NestedListsScreen = () => (
  <ScrollViewContainer style={styles.container}>
    <NestedList index={0} />
    {/* Test nested list in a nested view */}
    <View>
      <NestedList index={1} />
    </View>
    <NestedList index={2} />
  </ScrollViewContainer>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
