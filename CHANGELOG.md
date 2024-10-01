

# [0.5.0](https://github.com/omahili/react-native-reorderable-list/compare/v0.4.0...v0.5.0) (2024-10-01)


### Features

* refactor and introduce new api ([cffcd7e](https://github.com/omahili/react-native-reorderable-list/commit/cffcd7e7fcd0beac692b73151b7b6336b1d7fdd9))

# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.4.0] - 2022-05-01
### Changed
- Fixed autoscroll not working on iOS
- Fixed problems when rendering big lists due to cell onLayout not called
- Omitted unsupported `numColumns` from props

## [0.3.0] - 2021-12-05
### Added
- Reorderable list component with draggable items
- Property `isDragged` provided to `renderItem` in order to identify a dragged item
- Function `drag` provided to `renderItem` in order to enable a drag gesture
- Prop `onReorder` called on list reorder
- Autoscroll when dragging an item to the extremeties of the list, based on `scrollAreaSize` and `scrollSpeed` props
- Item scale animation on drag start and drag end, based on `dragScale` prop
- Items animation when moving a dragged item
- Animation to position a dragged item on release

[Unreleased]: https://github.com/omahili/react-native-reorderable-list/compare/v0.4.0...HEAD
[0.4.0]: https://github.com/omahili/react-native-reorderable-list/releases/tag/v0.4.0
[0.3.0]: https://github.com/omahili/react-native-reorderable-list/releases/tag/v0.3.0
