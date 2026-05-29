# Engine Source Map

Verified engine source

This reference was built by inspecting a local Cocos Creator 2.4.15 engine source folder.

Engine source paths are installation-specific. On first use in a new machine/workspace, ask the user to provide or confirm the active Cocos Creator 2.4.15 installation path before inspecting engine source or built-in default assets. Then inspect that installation's engine folder, commonly `Contents/Resources/engine` on packaged desktop installs. Do not assume macOS, Windows, Linux, or external-drive paths from another project.

If the user does not know the install path, offer to locate it with filesystem search using their approval when the search would scan outside the current workspace.

Do not edit engine source while working on a Cocos project. Use it as a verification source when an API is uncertain.

## Entry points

- `package.json`: confirms version `2.4.15`.
- `modules.json`: packaged feature modules such as `Sprite`, `Label`, `Action`, `Animation`, `Button`, `NodePool`, and `Spine Skeleton`.
- `api.d.ts`: global flags and `cc: any`; not a complete API reference.
- `cocos2d/index.js`: loads `core/CCGame` and `actions`.
- `cocos2d/core/index.js`: loads platform/assets/node/components/graphics/collider/physics/camera/mesh/3d/widget.

## Source Files by Task

- Decorator/class/property: `cocos2d/core/platform/CCClassDecorator.js`.
- Component lifecycle/schedule: `cocos2d/core/components/CCComponent.js`.
- Common render/UI components: `cocos2d/core/components/CCSprite.js`, `CCCanvas.js`, `CCWidget.js`, `CCLayout.js`, `CCButton.js`, `CCScrollView.js`, `CCPageView.js`, `CCPageViewIndicator.js`, `CCSlider.js`, `CCScrollBar.js`, `CCEditBox.js`, `CCToggle.js`, `CCToggleContainer.js`, `CCProgressBar.js`.
- Camera: `cocos2d/core/camera/CCCamera.js`.
- WebView: `cocos2d/webview/CCWebView.js`, `webview-impl.js`.
- Node properties/events/transforms/actions: `cocos2d/core/CCNode.js`.
- Node hierarchy/components: `cocos2d/core/utils/base-node.js`.
- EventTarget cleanup: `cocos2d/core/event/event-target.js`.
- Asset manager: `cocos2d/core/asset-manager/CCAssetManager.js`, `bundle.js`, `deprecated.js`.
- Tween: `cocos2d/actions/tween.js`.
- Instantiate: `cocos2d/core/platform/instantiate.js`.
- Value types: `cocos2d/core/value-types/vec2.ts`, `vec3.ts`.
- Spine: `extensions/spine/index.js`, `Skeleton.js`, `skeleton-data.js`.

## Public API Quick Reference

Use this section before opening engine source. These public methods and properties were collected from the Cocos Creator 2.4.15 engine source files listed above. If behavior or overload details are still unclear, then inspect the source file named in `Source Files by Task`.

### `cc.Component`

Lifecycle hooks:

- `__preload()`
- `onLoad()`
- `start()`
- `onEnable()`
- `onDisable()`
- `onDestroy()`
- `update(dt)`
- `lateUpdate(dt)`
- Editor-only hooks: `onFocusInEditor()`, `onLostFocusInEditor()`, `resetInEditor()`, `onRestore()`

Component and scheduler helpers:

- `addComponent(typeOrClassName)`
- `getComponent(typeOrClassName)`
- `getComponents(typeOrClassName)`
- `getComponentInChildren(typeOrClassName)`
- `getComponentsInChildren(typeOrClassName)`
- `destroy()`
- `schedule(callback, interval, repeat, delay)`
- `scheduleOnce(callback, delay)`
- `unschedule(callback)`
- `unscheduleAllCallbacks()`

### `cc.Node`

Hierarchy and component methods:

- `getParent()`
- `setParent(value)`
- `attr(attrs)`
- `getChildByUuid(uuid)`
- `getChildByName(name)`
- `addChild(child, zIndex, name)`
- `insertChild(child, siblingIndex)`
- `getSiblingIndex()`
- `setSiblingIndex(index)`
- `walk(prefunc, postfunc)`
- `removeFromParent(cleanup)`
- `removeChild(child, cleanup)`
- `removeAllChildren(cleanup)`
- `isChildOf(parent)`
- `getComponent(typeOrClassName)`
- `getComponents(typeOrClassName)`
- `getComponentInChildren(typeOrClassName)`
- `getComponentsInChildren(typeOrClassName)`
- `addComponent(typeOrClassName)`
- `destroy()`
- `destroyAllChildren()`

Events and actions:

- `on(type, callback, target, useCapture)`
- `once(type, callback, target, useCapture)`
- `off(type, callback, target, useCapture)`
- `targetOff(target)`
- `hasEventListener(type)`
- `emit(type, ...args)`
- `dispatchEvent(event)`
- `pauseSystemEvents(recursive)`
- `resumeSystemEvents(recursive)`
- `runAction(action)`
- `pauseAllActions()`
- `resumeAllActions()`
- `stopAllActions()`
- `stopAction(action)`
- `stopActionByTag(tag)`
- `getActionByTag(tag)`
- `getNumberOfRunningActions()`

Transforms and geometry:

- `getPosition(out)`
- `setPosition(newPosOrX, y, z)`
- `getScale(out)`
- `setScale(newScaleOrX, y, z)`
- `getRotation(out)`
- `setRotation(rotation, y, z, w)`
- `getContentSize()`
- `setContentSize(sizeOrWidth, height)`
- `getAnchorPoint()`
- `setAnchorPoint(pointOrX, y)`
- `getWorldPosition(out)`
- `setWorldPosition(pos)`
- `getWorldRotation(out)`
- `setWorldRotation(val)`
- `getWorldScale(out)`
- `setWorldScale(scale)`
- `lookAt(pos, up)`
- `getLocalMatrix(out)`
- `getWorldMatrix(out)`
- `convertToNodeSpaceAR(worldPoint, out)`
- `convertToWorldSpaceAR(nodePoint, out)`
- `convertToNodeSpace(worldPoint)`
- `convertToWorldSpace(nodePoint)`
- `convertTouchToNodeSpace(touch)`
- `convertTouchToNodeSpaceAR(touch)`
- `getBoundingBox()`
- `getBoundingBoxToWorld()`

### Core Render And UI Components

`cc.Sprite` commonly uses serialized properties instead of many imperative methods:

- `spriteFrame`
- `type`
- `sizeMode`
- `fillType`
- `fillCenter`
- `fillStart`
- `fillRange`
- `trim`
- `srcBlendFactor`
- `dstBlendFactor`

`cc.Canvas`:

- `alignWithScreen`
- `designResolution`
- `fitWidth`
- `fitHeight`
- `instance`

`cc.Camera`:

- `cc.Camera.findCamera(node)`
- `containsNode(node)`
- `getScreenToWorldMatrix2D(out)`
- `getWorldToScreenMatrix2D(out)`
- `getScreenToWorldPoint(screenPosition, out)`
- `getWorldToScreenPoint(worldPosition, out)`
- `getRay(screenPos)`
- `render(rootNode)`

Avoid new code with deprecated camera methods such as `getNodeToCameraTransform`, `getCameraToWorldPoint`, `getWorldToCameraPoint`, `getCameraToWorldMatrix`, and `getWorldToCameraMatrix`.

`cc.Widget`:

- `updateAlignment()`

`cc.Layout`:

- `updateLayout()`

`cc.Button` commonly uses serialized properties and click events:

- `interactable`
- `transition`
- `target`
- `clickEvents`
- `normalColor`
- `pressedColor`
- `hoverColor`
- `disabledColor`
- `normalSprite`
- `pressedSprite`
- `hoverSprite`
- `disabledSprite`
- `duration`
- `zoomScale`

`cc.Toggle`:

- `toggle(event)`
- `check()`
- `uncheck()`
- `isChecked`
- `toggleGroup`
- `checkEvents`

`cc.ToggleContainer`:

- `allowSwitchOff`
- `checkEvents`

`cc.ProgressBar`:

- `barSprite`
- `mode`
- `totalLength`
- `progress`
- `reverse`

`cc.EditBox`:

- `setFocus()`
- `focus()`
- `blur()`
- `isFocused()`

### Scrolling And Paging

`cc.ScrollView`:

- `scrollToBottom(timeInSecond, attenuated)`
- `scrollToTop(timeInSecond, attenuated)`
- `scrollToLeft(timeInSecond, attenuated)`
- `scrollToRight(timeInSecond, attenuated)`
- `scrollToTopLeft(timeInSecond, attenuated)`
- `scrollToTopRight(timeInSecond, attenuated)`
- `scrollToBottomLeft(timeInSecond, attenuated)`
- `scrollToBottomRight(timeInSecond, attenuated)`
- `scrollToOffset(offset, timeInSecond, attenuated)`
- `getScrollOffset()`
- `getMaxScrollOffset()`
- `scrollToPercentHorizontal(percent, timeInSecond, attenuated)`
- `scrollToPercentVertical(percent, timeInSecond, attenuated)`
- `scrollTo(anchor, timeInSecond, attenuated)`
- `stopAutoScroll()`
- `setContentPosition(position)`
- `getContentPosition()`
- `isScrolling()`
- `isAutoScrolling()`
- `getScrollEndedEventTiming()`

`cc.PageView`:

- `getCurrentPageIndex()`
- `setCurrentPageIndex(index)`
- `getPages()`
- `addPage(page)`
- `insertPage(page, index)`
- `removePage(page)`
- `removePageAtIndex(index)`
- `removeAllPages()`
- `scrollToPage(index, timeInSecond)`

`cc.Slider`:

- `progress`
- `handle`
- `direction`
- The slider node emits the `slide` event.

`cc.Scrollbar`:

- `setTargetScrollView(scrollView)`
- `hide()`
- `show()`

### Assets And Bundles

`cc.assetManager`:

- `getBundle(name)`
- `removeBundle(bundle)`
- `loadAny(requests, options, onProgress, onComplete)`
- `preloadAny(requests, options, onProgress, onComplete)`
- `postLoadNative(asset, options, onComplete)`
- `loadRemote(url, options, onComplete)`
- `loadScript(url, options, onComplete)`
- `loadBundle(nameOrUrl, options, onComplete)`
- `releaseAsset(asset)`
- `releaseUnusedAssets()`
- `releaseAll()`

`cc.AssetManager.Bundle`:

- `getInfoWithPath(path, type)`
- `getDirWithPath(path, type, out)`
- `getAssetInfo(uuid)`
- `getSceneInfo(name)`
- `load(paths, type, onProgress, onComplete)`
- `preload(paths, type, onProgress, onComplete)`
- `loadDir(dir, type, onProgress, onComplete)`
- `preloadDir(dir, type, onProgress, onComplete)`
- `loadScene(sceneName, options, onProgress, onComplete)`
- `preloadScene(sceneName, options, onProgress, onComplete)`
- `get(path, type)`
- `release(path, type)`
- `releaseUnusedAssets()`
- `releaseAll()`

### Audio

`cc.audioEngine`:

- `play(clip, loop, volume)`
- `setLoop(id, loop)`
- `isLoop(id)`
- `setVolume(id, volume)`
- `getVolume(id)`
- `setCurrentTime(id, seconds)`
- `getCurrentTime(id)`
- `getDuration(id)`
- `getState(id)`
- `isPlaying(id)`
- `setFinishCallback(id, callback)`
- `pause(id)`
- `pauseAll()`
- `resume(id)`
- `resumeAll()`
- `stop(id)`
- `stopAll()`
- `getMaxAudioInstance()`
- `uncache(clip)`
- `uncacheAll()`

Legacy music/effect helpers still exist in 2.4.15:

- `playMusic(clip, loop)`
- `stopMusic()`
- `pauseMusic()`
- `resumeMusic()`
- `getMusicVolume()`
- `setMusicVolume(volume)`
- `isMusicPlaying()`
- `playEffect(clip, loop)`
- `setEffectsVolume(volume)`
- `getEffectsVolume()`
- `pauseEffect(id)`
- `pauseAllEffects()`
- `resumeEffect(id)`
- `resumeAllEffects()`
- `stopEffect(id)`
- `stopAllEffects()`

Avoid new code that depends on `setMaxAudioInstance(num)`: it exists but is deprecated and no-op since 2.4.0.

### Animation, Drawing, Pooling, WebView, Spine

`cc.Animation`:

- `play(name, startTime)`
- `playAdditive(name, startTime)`
- `stop(name)`
- `pause(name)`
- `resume(name)`
- `setCurrentTime(time, name)`
- `getAnimationState(name)`
- `addClip(clip, newName)`
- `removeClip(clip, force)`
- `sample(name)`

`cc.Graphics`:

- `moveTo(x, y)`
- `lineTo(x, y)`
- `bezierCurveTo(c1x, c1y, c2x, c2y, x, y)`
- `quadraticCurveTo(cx, cy, x, y)`
- `arc(cx, cy, r, startAngle, endAngle, counterclockwise)`
- `ellipse(cx, cy, rx, ry)`
- `circle(cx, cy, r)`
- `rect(x, y, w, h)`
- `roundRect(x, y, w, h, r)`
- `fillRect(x, y, w, h)`
- `stroke()`
- `fill()`
- `clear()`
- `close()`
- Drawing state: `lineWidth`, `strokeColor`, `fillColor`, `lineJoin`, `lineCap`

`cc.NodePool`:

- `put(obj)`
- `get(...args)`
- `size()`
- `clear()`

`cc.WebView`:

- `setJavascriptInterfaceScheme(scheme)`
- `setOnJSCallback(callback)`
- `evaluateJS(str)`

`sp.Skeleton`:

- `setSkeletonData(skeletonData)`
- `setSlotsRange(startSlotIndex, endSlotIndex)`
- `setAnimationStateData(stateData)`
- `setAnimationCacheMode(cacheMode)`
- `isAnimationCached()`
- `setVertexEffectDelegate(effectDelegate)`
- `updateWorldTransform()`
- `setToSetupPose()`
- `setBonesToSetupPose()`
- `setSlotsToSetupPose()`
- `updateAnimationCache(animName)`
- `invalidAnimationCache()`
- `findBone(boneName)`
- `findSlot(slotName)`
- `setSkin(skinName)`
- `getAttachment(slotName, attachmentName)`
- `setAttachment(slotName, attachmentName)`
- `getTextureAtlas(regionAttachment)`
- `setMix(fromAnimation, toAnimation, duration)`
- `setAnimation(trackIndex, name, loop)`
- `addAnimation(trackIndex, name, loop, delay)`
- `findAnimation(name)`
- `getCurrent(trackIndex)`
- `clearTracks()`
- `clearTrack(trackIndex)`
- `setStartListener(listener)`
- `setInterruptListener(listener)`
- `setEndListener(listener)`
- `setDisposeListener(listener)`
- `setCompleteListener(listener)`
- `setEventListener(listener)`
- `setTrackStartListener(entry, listener)`
- `setTrackInterruptListener(entry, listener)`
- `setTrackEndListener(entry, listener)`
- `setTrackDisposeListener(entry, listener)`
- `setTrackCompleteListener(entry, listener)`
- `setTrackEventListener(entry, listener)`
- `getState()`

## Search patterns

- API availability: `rg -n "methodName|propertyName" <engine>/cocos2d <engine>/extensions`.
- Deprecated API: `rg -n "@deprecated|deprecated|removed" <engine>/cocos2d <engine>/extensions`.
- Node events: `rg -n "Node.EventType|TOUCH_START|POSITION_CHANGED|targetOff" <engine>/cocos2d/core`.
- Asset loading: `rg -n "loadBundle|loadRemote|resources|cc.loader|releaseAsset" <engine>/cocos2d/core/asset-manager`.

## Fallback when engine source is not available

If the local Cocos Creator 2.4.15 engine source directory does not exist on this machine:

1. Check the project's `creator.d.ts` or `api.d.ts` for type declarations and method signatures.
2. Check `node_modules` or `temp/quick-scripts` in the Cocos project for compiled engine stubs.
3. Search the Cocos Creator 2.4.x API documentation online at `https://docs.cocos.com/creator/2.4/api/`.
4. Use the other reference files in this skill as the primary source of truth — they were already verified against engine source.

Do not guess API behavior without at least one of these verification steps.

## Version Detection

To confirm a project is Cocos 2.4.x (not 3.x):

1. Check the project root for `creator.d.ts` or a compiled `api.d.ts`. Cocos 3.x projects use `cc.d.ts` or have no engine source bundled.
2. Check `settings/project.json`: the `engine` field (if present) specifies the engine version.
3. Open any `.ts` file: Cocos 2.4.x scripts use `const { ccclass, property } = cc._decorator`. Cocos 3.x uses `import { _decorator, Component } from 'cc'`.
4. Check the project's `package.json` (if present): Cocos 2.4.x may have `cocos-creator-js` as a dependency with version `2.4.x`.

The engine `package.json` (at `<engine>/package.json`) declares the exact version string such as `"version": "2.4.15"`.
