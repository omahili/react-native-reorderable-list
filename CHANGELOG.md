

## [0.6.1](https://github.com/omahili/react-native-reorderable-list/compare/v0.6.0...v0.6.1) (2024-12-12)


### Bug Fixes

* use a more stable drag end handling ([1035e08](https://github.com/omahili/react-native-reorderable-list/commit/1035e0815fd12d339ab9a1e0c57418396852653e))

# [0.6.0](https://github.com/omahili/react-native-reorderable-list/compare/v0.5.1...v0.6.0) (2024-12-12)


### Bug Fixes

* drag end not triggered if pressed only ([45a689e](https://github.com/omahili/react-native-reorderable-list/commit/45a689efbacc77547d347898c72091cbc86aef1d)), closes [#14](https://github.com/omahili/react-native-reorderable-list/issues/14)


### Features

* add drag end event to root list ([d7c19ed](https://github.com/omahili/react-native-reorderable-list/commit/d7c19eddd11aa0b760f3da4765acae612126951c)), closes [#10](https://github.com/omahili/react-native-reorderable-list/issues/10)

# [0.5.1](https://github.com/omahili/react-native-reorderable-list/compare/v0.5.0...v0.5.1) (2024-12-09)


### Bug Fixes

* drag end hook not called ([bffbe0b](https://github.com/omahili/react-native-reorderable-list/commit/bffbe0b6d5137a63f50a89cf7c6bd36b045b4278)), closes [#13](https://github.com/omahili/react-native-reorderable-list/issues/13)
* unstable cell causing remounts ([62145dd](https://github.com/omahili/react-native-reorderable-list/commit/62145dd5b1b4cd1af1332bbe37398608b0852af8))

# [0.5.0](https://github.com/omahili/react-native-reorderable-list/compare/v0.4.0...v0.5.0) (2024-10-01)


### Features

* refactor and introduce new api ([cffcd7e](https://github.com/omahili/react-native-reorderable-list/commit/cffcd7e7fcd0beac692b73151b7b6336b1d7fdd9))


# [0.4.0](https://github.com/omahili/react-native-reorderable-list/releases/tag/v0.4.0) (2022-05-01)


### Changed

- Fixed autoscroll not working on iOS
- Fixed problems when rendering big lists due to cell onLayout not called
- Omitted unsupported `numColumns` from props


# [0.3.0](https://github.com/omahili/react-native-reorderable-list/releases/tag/v0.4.0) (2021-12-05)


### Added

- Reorderable list component with draggable items
- Property `isDragged` provided to `renderItem` in order to identify a dragged item
- Function `drag` provided to `renderItem` in order to enable a drag gesture
- Prop `onReorder` called on list reorder
- Autoscroll when dragging an item to the extremeties of the list, based on `scrollAreaSize` and `scrollSpeed` props
- Item scale animation on drag start and drag end, based on `dragScale` prop
- Items animation when moving a dragged item
- Animation to position a dragged item on release
