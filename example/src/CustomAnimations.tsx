import React, {useMemo, useState} from 'react';
import {ListRenderItemInfo, Platform} from 'react-native';

import {Easing, useSharedValue, withTiming} from 'react-native-reanimated';
import {
  ReorderableListCellAnimations,
  ReorderableListDragEndEvent,
  ReorderableListDragStartEvent,
  ReorderableListReorderEvent,
  reorderItems,
} from 'react-native-reorderable-list';

import {
  ItemSeparator,
  ListItem,
  ReorderableList,
  SeedDataItem,
  usePanGesture,
  useSeedData,
} from './common';

export const CustomAnimationsScreen = () => {
  const seedData = useSeedData();
  const [data, setData] = useState(seedData);
  const scale = useSharedValue(1);
  const shadowOpacity = useSharedValue(0);
  const shadowRadius = useSharedValue(0);
  const panGesture = usePanGesture();

  const handleReorder = ({from, to}: ReorderableListReorderEvent) => {
    setData(value => reorderItems(value, from, to));
  };

  const handleDragStart = (_: ReorderableListDragStartEvent) => {
    'worklet';

    scale.value = withTiming(1.05, {
      easing: Easing.in(Easing.elastic(5)),
      duration: 150,
    });

    shadowOpacity.value = withTiming(0.2, {
      easing: Easing.in(Easing.elastic(5)),
      duration: 150,
    });

    shadowRadius.value = withTiming(8, {
      easing: Easing.in(Easing.elastic(5)),
      duration: 150,
    });
  };

  const handleDragEnd = (_: ReorderableListDragEndEvent) => {
    'worklet';

    scale.value = withTiming(1, {
      easing: Easing.in(Easing.elastic(3)),
      duration: 200,
    });

    shadowOpacity.value = withTiming(0, {
      easing: Easing.in(Easing.elastic(5)),
      duration: 200,
    });

    shadowRadius.value = withTiming(0, {
      easing: Easing.in(Easing.elastic(5)),
      duration: 200,
    });
  };

  const renderItem = ({item}: ListRenderItemInfo<SeedDataItem>) => (
    <ListItem {...item} />
  );

  const cellAnimations: ReorderableListCellAnimations = useMemo(
    () => ({
      opacity: 1,
      transform: [{scale}],
      ...Platform.select({
        ios: {
          shadowOpacity,
          shadowRadius,
          shadowColor: '#555',
          shadowOffset: {width: 0, height: 0},
        },
        android: {
          elevation: 4,
          // background is necessary for android to render the shadow
          backgroundColor: 'white',
        },
      }),
    }),
    [scale, shadowOpacity, shadowRadius],
  );

  return (
    <ReorderableList
      data={data}
      onReorder={handleReorder}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      ItemSeparatorComponent={ItemSeparator}
      cellAnimations={cellAnimations}
      panGesture={panGesture}
    />
  );
};
