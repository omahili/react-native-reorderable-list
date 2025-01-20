import {useMemo} from 'react';

import {faker} from '@faker-js/faker';

export interface SeedDataItem {
  id: string;
  image: string;
  title: string;
  description: string;
}

export const useSeedData = (count = 20) =>
  useMemo(
    () =>
      faker.helpers.multiple(
        () => ({
          id: faker.string.uuid(),
          image: faker.image.urlPicsumPhotos({
            width: 50,
            height: 50,
          }),
          title: faker.lorem.sentence(5).slice(0, -1),
          description: faker.lorem.paragraph({
            min: 1,
            max: 3,
          }),
        }),
        {
          count,
        },
      ),
    [count],
  );
