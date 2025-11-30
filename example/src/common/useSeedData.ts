import {useMemo} from 'react';

import {faker} from '@faker-js/faker';

export interface SeedDataItem {
  id: string;
  image: string;
  imageWidth: number;
  title: string;
  description: string;
}

export const createDataItem = () => ({
  id: faker.string.uuid(),
  image: faker.image.urlPicsumPhotos({
    width: 50,
    height: 50,
  }),
  imageWidth: faker.number.int({
    min: 40,
    max: 120,
  }),
  title: faker.lorem.sentence(5).slice(0, -1),
  description: faker.lorem.paragraph({
    min: 1,
    max: 3,
  }),
});

export const useSeedData = (count = 20) =>
  useMemo(
    () =>
      faker.helpers.multiple(createDataItem, {
        count,
      }),
    [count],
  );
