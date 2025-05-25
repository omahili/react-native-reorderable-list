import React, {memo, useMemo, useState} from 'react';
import {ListRenderItemInfo} from 'react-native';

import {faker} from '@faker-js/faker';
import ReorderableList, {
  ReorderableListReorderEvent,
  reorderItems,
  useIsActive,
} from 'react-native-reorderable-list';

import {
  ItemSeparator,
  ListItem,
  ListItemProps,
  SeedDataItem,
  usePanGesture,
} from './common';

export const ActiveItem: React.FC<ListItemProps> = memo(props => {
  const isActive = useIsActive();

  return (
    <ListItem
      {...props}
      description={isActive ? 'ACTIVE' : props.description}
    />
  );
});

export const ActiveItemScreen = () => {
  const seedData: SeedDataItem[] = useMemo(
    () =>
      faker.helpers.multiple(
        () => ({
          id: faker.string.uuid(),
          image: faker.image.urlPicsumPhotos({
            width: 50,
            height: 50,
          }),
          title: faker.book.title(),
          description: faker.book.genre(),
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

  const renderItem = ({item}: ListRenderItemInfo<SeedDataItem>) => (
    <ActiveItem {...item} />
  );

  return (
    <ReorderableList
      data={data}
      onReorder={handleReorder}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      ItemSeparatorComponent={ItemSeparator}
      panGesture={panGesture}
      shouldUpdateActiveItem
    />
  );
};
