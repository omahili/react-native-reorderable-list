/**
 * Moves an item in an array to a new index.
 *
 * @template T - The type of elements in the array.
 * @param data - The array of items.
 * @param from - The index of the item to move.
 * @param to - The index to move the item to.
 *
 * @returns A new array with the two items swapped.
 */
export const reorderItems = <T>(data: T[], from: number, to: number): T[] => {
  const newData = [...data];
  newData.splice(to, 0, newData.splice(from, 1)[0]);
  return newData;
};
