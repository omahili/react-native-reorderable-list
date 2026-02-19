"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.reorderItems = void 0;
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
const reorderItems = (data, from, to) => {
  const newData = [...data];
  newData.splice(to, 0, newData.splice(from, 1)[0]);
  return newData;
};
exports.reorderItems = reorderItems;
//# sourceMappingURL=utils.js.map