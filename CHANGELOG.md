

## [0.16.2](https://github.com/omahili/react-native-reorderable-list/compare/v0.16.1...v0.16.2) (2025-06-26)


### Bug Fixes

* cell translating on reorder ([#58](https://github.com/omahili/react-native-reorderable-list/issues/58)) ([1d07821](https://github.com/omahili/react-native-reorderable-list/commit/1d07821ba78297d41d46a9c4948c5d9ce466f919)), closes [#56](https://github.com/omahili/react-native-reorderable-list/issues/56)

## [0.16.1](https://github.com/omahili/react-native-reorderable-list/compare/v0.16.0...v0.16.1) (2025-06-14)


### Bug Fixes

* set native props not available on web ([1f3c07d](https://github.com/omahili/react-native-reorderable-list/commit/1f3c07dc4b6fc078724b4eff8e0fcef020d849ef))

# [0.16.0](https://github.com/omahili/react-native-reorderable-list/compare/v0.15.0...v0.16.0) (2025-06-01)


### Features

* add support for layout animations ([dcdf76a](https://github.com/omahili/react-native-reorderable-list/commit/dcdf76a7508a950ce1341b95b580bd0e57f2cab3)), closes [#23](https://github.com/omahili/react-native-reorderable-list/issues/23)

# [0.15.0](https://github.com/omahili/react-native-reorderable-list/compare/v0.14.1...v0.15.0) (2025-05-25)


### Bug Fixes

* improve scroll enable ([ffb0343](https://github.com/omahili/react-native-reorderable-list/commit/ffb0343370bfa9f882f0ab695f3d61a29f5d6d6a))


### Features

* add dragEnabled prop ([53d9c76](https://github.com/omahili/react-native-reorderable-list/commit/53d9c7687032b7c59b497fe95b14c404e836e5b9)), closes [#52](https://github.com/omahili/react-native-reorderable-list/issues/52)

## [0.14.1](https://github.com/omahili/react-native-reorderable-list/compare/v0.14.0...v0.14.1) (2025-05-12)


### Bug Fixes

* autoscroll on nested list layout change ([6072c06](https://github.com/omahili/react-native-reorderable-list/commit/6072c06cc10db5530df4c11505fcfadbac3d60ff)), closes [#49](https://github.com/omahili/react-native-reorderable-list/issues/49)

# [0.14.0](https://github.com/omahili/react-native-reorderable-list/compare/v0.13.1...v0.14.0) (2025-04-27)


### Bug Fixes

* persisted layout data of deleted items ([943f1ec](https://github.com/omahili/react-native-reorderable-list/commit/943f1ec16e061425333d9c0b12956935eadc21be)), closes [#47](https://github.com/omahili/react-native-reorderable-list/issues/47)
* remove unnecessary unstable batching ([d3e1b29](https://github.com/omahili/react-native-reorderable-list/commit/d3e1b297b7c685fe0e8caf185aa4ad4fc1ca592d))


### Features

* add pan gesture prop ([a249fc9](https://github.com/omahili/react-native-reorderable-list/commit/a249fc99ca5e0bceba686a878dc100852d5f2f3d))
* forward ref to scroll view container ([c3edee8](https://github.com/omahili/react-native-reorderable-list/commit/c3edee8b07942eee1cda1c274697c38ca5470e7b)), closes [#50](https://github.com/omahili/react-native-reorderable-list/issues/50)

## [0.13.1](https://github.com/omahili/react-native-reorderable-list/compare/v0.13.0...v0.13.1) (2025-03-23)


### Bug Fixes

* autoscroll area size in scroll container ([bffb44d](https://github.com/omahili/react-native-reorderable-list/commit/bffb44d31acd6219e52060fa8ea5037f8d16ffff))
* autoscroll when wrapping nested lists ([e66a699](https://github.com/omahili/react-native-reorderable-list/commit/e66a6991e57804adf37a9974c7c13d8385c0bcce))

# [0.13.0](https://github.com/omahili/react-native-reorderable-list/compare/v0.12.0...v0.13.0) (2025-03-16)


### Bug Fixes

* disable default scale animation if overridden ([a977cc8](https://github.com/omahili/react-native-reorderable-list/commit/a977cc8ac41bb09f058b37c17a62c821bd17de1a))


### Features

* use closest center algorithm for items reorder ([8f39644](https://github.com/omahili/react-native-reorderable-list/commit/8f396447cfae5684f70110d666cbd6bca0eb04fd)), closes [#34](https://github.com/omahili/react-native-reorderable-list/issues/34)


### BREAKING CHANGES

* dragReorderThreshold prop is no longer supported and is
removed from the API. The closest center algorithm provides a better
experience, it fixes the current issues when swapping short and tall items
and is more efficient.

# [0.12.0](https://github.com/omahili/react-native-reorderable-list/compare/v0.11.0...v0.12.0) (2025-03-09)


### Bug Fixes

* autoscroll activation on drag ([#41](https://github.com/omahili/react-native-reorderable-list/issues/41)) ([1189917](https://github.com/omahili/react-native-reorderable-list/commit/1189917ddfe2cc9848e6ea49f9d0cab349ba0384)), closes [#33](https://github.com/omahili/react-native-reorderable-list/issues/33)


### Features

* add autoscroll activation delta ([181c308](https://github.com/omahili/react-native-reorderable-list/commit/181c308f0f6933507e48c13480804d89d02674ff)), closes [#41](https://github.com/omahili/react-native-reorderable-list/issues/41)

# [0.11.0](https://github.com/omahili/react-native-reorderable-list/compare/v0.10.0...v0.11.0) (2025-01-27)


### Features

* add onIndexChange event ([5ea588b](https://github.com/omahili/react-native-reorderable-list/commit/5ea588bf75a2603425f54cfb932df663eef5d83a))

# [0.10.0](https://github.com/omahili/react-native-reorderable-list/compare/v0.9.0...v0.10.0) (2025-01-26)


### Bug Fixes

* remove console log ([b66e306](https://github.com/omahili/react-native-reorderable-list/commit/b66e30673ecb872c7ec69db5b2cfa54c8397487d))


### Features

* add autoscrollThresholdOffset prop ([0d2a889](https://github.com/omahili/react-native-reorderable-list/commit/0d2a88947801b4bfe4c63daa42746ee43420433d))
* support all view style animations for cell ([f019ab1](https://github.com/omahili/react-native-reorderable-list/commit/f019ab19254011166982a43c2c8e7113bda0450f))


### BREAKING CHANGES

* The scale style animation is now part of the transform
property. The default scale animation can be disabled by overriding
transform. Similarly, the default opacity animation can be disabled by
overriding its value, instead of setting it to false.
cellAnimations properties can be either a value or shared value.

# [0.9.0](https://github.com/omahili/react-native-reorderable-list/compare/v0.8.0...v0.9.0) (2025-01-19)


### Features

* add panEnabled and panActivateAfterLongPress ([47803d2](https://github.com/omahili/react-native-reorderable-list/commit/47803d2aaf07c06d2febbcff438e457ce313523b))
* add useIsActive hook ([6e45ada](https://github.com/omahili/react-native-reorderable-list/commit/6e45ada8e4e0c4db1691f1b97a79447a2528ce4e))

# [0.8.0](https://github.com/omahili/react-native-reorderable-list/compare/v0.7.1...v0.8.0) (2025-01-16)


### Features

* bump peer dependency RNGH ([64dcbad](https://github.com/omahili/react-native-reorderable-list/commit/64dcbadadef6c6eee54586dd5000e52fd0d56040))
* improve performance and add new props ([05626ef](https://github.com/omahili/react-native-reorderable-list/commit/05626efa86b108c3f0a0bfcd841c036a1c24c7fc)), closes [#18](https://github.com/omahili/react-native-reorderable-list/issues/18)
* support animated scroll handlers ([e40dfae](https://github.com/omahili/react-native-reorderable-list/commit/e40dfae03f0716a0fbcb32b6a59d52e9c0935c41)), closes [#21](https://github.com/omahili/react-native-reorderable-list/issues/21)


### BREAKING CHANGES

* updated peer dependency requirement for
react-native-gesture-handler to a minimum of 2.12.0
* onScroll event handlers of ReorderableList and
ScrollViewContainer now require animated scroll handlers. For this api
to work Reanimated minimum version is bumped to 3.12.0.
* items are optimized by reducing shared values in the
parent cells and reducing the animated styles. ReorderableListItem
animations have moved to the cell itself and are attached to the active
cell only. A new prop cellAnimations and onDragStart were added to allow
customizing opacity and scale, while ReorderableListItem is removed from
the api.

## [0.7.1](https://github.com/omahili/react-native-reorderable-list/compare/v0.7.0...v0.7.1) (2025-01-15)


### Bug Fixes

* **android:** slow autoscroll with fabric ([0f0f3e4](https://github.com/omahili/react-native-reorderable-list/commit/0f0f3e4872f631e728f1a8cf90786d5b4e0b734e))
* reading shared value during render ([ac43fad](https://github.com/omahili/react-native-reorderable-list/commit/ac43fadc3f6fc44cf41ac16a39c9fb6bcb4c6d5d)), closes [#20](https://github.com/omahili/react-native-reorderable-list/issues/20)

# [0.7.0](https://github.com/omahili/react-native-reorderable-list/compare/v0.6.1...v0.7.0) (2024-12-15)


### Features

* support nested lists ([005dd07](https://github.com/omahili/react-native-reorderable-list/commit/005dd0766ba2f09a0c0e20d6c96039a02f4612c2))

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
