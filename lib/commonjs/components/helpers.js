"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.applyAnimatedStyles = void 0;
/**
 * Flattens an object containing `SharedValue`s by extracting their underlying values.
 *
 * @param target - An object to which the flattened shared values and every other field will be mapped to.
 * @param source - The object containing, possibly among others, the shared values.
 * @param excludedKeys - The keys to exclude from flattening and mapping.
 *
 * @returns The object to which the fields where flattened and mapped to.
 */
const applyAnimatedStyles = (target, source, excludedKeys = []
// eslint-disable-next-line @typescript-eslint/no-explicit-any
) => {
  'worklet';

  let keys = Object.keys(source);
  for (let key of keys) {
    if (excludedKeys.includes(key)) {
      continue;
    }
    let value = source[key];
    target[key] = value !== null && typeof value === 'object' && 'value' in value ? value.value : value;
  }
  return target;
};
exports.applyAnimatedStyles = applyAnimatedStyles;
//# sourceMappingURL=helpers.js.map