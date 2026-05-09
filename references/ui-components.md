# UI Components

## Contents

- `cc.Sprite`
- `cc.Canvas`
- `cc.Camera`
- `cc.Widget`
- `cc.Layout`
- `cc.Button`
- `cc.ScrollView`
- `cc.PageView` and `cc.PageViewIndicator`
- `cc.Slider`
- `cc.Scrollbar`
- `cc.EditBox`
- `cc.Toggle` and `cc.ToggleContainer`
- `cc.ProgressBar`
- `cc.WebView`
- `cc.NodePool`

## cc.Sprite

Engine source: `cocos2d/core/components/CCSprite.js`.

`cc.Sprite` is the core 2D render component for images, icons, symbols, bars, buttons, masks, and many UI visuals. Bind it when the visual is part of a prefab or scene:

```typescript
@property(cc.Sprite) iconSprite: cc.Sprite = null;
@property(cc.SpriteFrame) normalFrame: cc.SpriteFrame = null;

setIcon(frame: cc.SpriteFrame): void {
    this.iconSprite.spriteFrame = frame;
}
```

Key properties:

- `spriteFrame`: the `cc.SpriteFrame` rendered by the component
- `type`: `cc.Sprite.Type.SIMPLE`, `SLICED`, `TILED`, `FILLED`, `MESH`
- `sizeMode`: `cc.Sprite.SizeMode.CUSTOM`, `TRIMMED`, `RAW`
- `fillType`: `cc.Sprite.FillType.HORIZONTAL`, `VERTICAL`, `RADIAL`; only used when `type` is `FILLED`
- `fillCenter`, `fillStart`, `fillRange`: fill controls for progress/radial visuals
- `trim`: affects simple/mesh rendering of trimmed sprite frames

Patterns:

```typescript
// Nine-slice panel or scalable button background
this.bgSprite.type = cc.Sprite.Type.SLICED;
this.bgSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
this.bgSprite.node.setContentSize(320, 80);

// Filled meter
this.meterSprite.type = cc.Sprite.Type.FILLED;
this.meterSprite.fillType = cc.Sprite.FillType.HORIZONTAL;
this.meterSprite.fillStart = 0;
this.meterSprite.fillRange = progress;
```

Use `cc.Sprite.State` and `setState()` only for maintaining legacy code; the engine marks them deprecated. For grayscale button states, prefer `cc.Button.enableAutoGrayEffect` or the host project's existing material/state pattern.

## cc.Canvas

Engine source: `cocos2d/core/components/CCCanvas.js`.

`cc.Canvas` is the root UI component for a scene. It owns design resolution and fit policy. Cocos expects only one active Canvas at a time; `cc.Canvas.instance` points to the active one.

Key properties:

- `designResolution`: scene design size, default engine value is `cc.size(960, 640)`
- `fitWidth`, `fitHeight`: drive the runtime resolution policy

Resolution policy mapping in engine:

- `fitWidth && fitHeight`: `cc.ResolutionPolicy.SHOW_ALL`
- `!fitWidth && !fitHeight`: `cc.ResolutionPolicy.NO_BORDER`
- `fitWidth`: `cc.ResolutionPolicy.FIXED_WIDTH`
- `fitHeight`: `cc.ResolutionPolicy.FIXED_HEIGHT`

Pattern:

```typescript
@property(cc.Canvas) canvas: cc.Canvas = null;

applyTabletLayout(): void {
    this.canvas.designResolution = cc.size(1920, 1080);
    this.canvas.fitWidth = true;
    this.canvas.fitHeight = true;
}
```

For most game code, do not create or destroy Canvas dynamically. Treat it as scene wiring. The engine auto-adds a full-stretch `cc.Widget` in Editor reset and creates a default Main Camera under Canvas at runtime when no main camera exists and the render type is not Canvas.

## cc.Camera

Engine source: `cocos2d/core/camera/CCCamera.js`.

`cc.Camera` controls view transform, culling, render order, target texture, and coordinate conversion. It is useful for follow-camera, zoom, render-to-texture effects, and selective rendering by group mask.

Key properties:

- `zoomRatio`: 2D camera zoom
- `cullingMask`: bitmask used to decide whether the camera renders a node
- `clearFlags`: `cc.Camera.ClearFlags.COLOR`, `DEPTH`, `STENCIL`
- `backgroundColor`
- `depth`: render order; higher depth renders later
- `targetTexture`: optional `cc.RenderTexture`
- `rect`: normalized viewport rect, values from `0` to `1`
- `ortho`, `orthoSize`, `fov`, `nearClip`, `farClip`
- `alignWithScreen`: auto-aligns camera viewport to screen

Useful statics and methods:

- `cc.Camera.main`: active camera with lowest depth
- `cc.Camera.cameras`: enabled cameras
- `cc.Camera.findCamera(node)`: first enabled camera whose `cullingMask` contains the node
- `containsNode(node)`
- `getWorldToScreenPoint(worldPosition, out?)`
- `getScreenToWorldPoint(screenPosition, out?)`
- `render(rootNode?)`: manual render

Pattern:

```typescript
@property(cc.Camera) worldCamera: cc.Camera = null;
@property(cc.Node) target: cc.Node = null;

lateUpdate(): void {
    this.worldCamera.node.setPosition(this.target.x, this.target.y);
}

setZoom(value: number): void {
    this.worldCamera.zoomRatio = value;
}
```

For 2D UI/game code, keep coordinate conversion outputs as `cc.Vec2` unless the node is intentionally 3D. Do not use deprecated camera conversion methods such as `getCameraToWorldPoint()` in new code.

## cc.Widget

Engine source: `cocos2d/core/components/CCWidget.js`.

`cc.Widget` auto-adjusts node position and size relative to its parent. It is the Cocos 2.4.x layout anchor system.

Bind with:

```typescript
@property(cc.Widget) widget: cc.Widget = null;
```

Key properties:

- `isAlignTop`, `isAlignBottom`, `isAlignLeft`, `isAlignRight`, `isAlignVerticalCenter`, `isAlignHorizontalCenter`
- `top`, `bottom`, `left`, `right`
- `isAbsoluteTop`, `isAbsoluteBottom`, `isAbsoluteLeft`, `isAbsoluteRight` (pixel vs percent)
- `alignMode`: `cc.Widget.AlignMode.ONCE`, `ON_WINDOW_RESIZE`, `ALWAYS`
- `target`: widget aligns to this node instead of its parent when set

Call `widget.updateAlignment()` to force recalculation immediately.

## cc.Layout

Engine source: `cocos2d/core/components/CCLayout.js`.

`cc.Layout` auto-arranges children using grid, horizontal, or vertical flow.

Key properties:

- `type`: `cc.Layout.Type.NONE`, `HORIZONTAL`, `VERTICAL`, `GRID`
- `resizeMode`: `NONE`, `CONTAINER`, `CHILDREN`
- `paddingLeft`, `paddingRight`, `paddingTop`, `paddingBottom`
- `spacingX`, `spacingY`
- `verticalDirection`, `horizontalDirection`
- `startAxis` (for grid)
- `affectedByScale`

Call `layout.updateLayout()` to force re-layout.

## cc.Button

Engine source: `cocos2d/core/components/CCButton.js`.

Bind with:

```typescript
@property(cc.Button) spinBtn: cc.Button = null;
```

Key properties:

- `interactable`
- `enableAutoGrayEffect`
- `transition`: `cc.Button.Transition.NONE`, `COLOR`, `SPRITE`, `SCALE`
- For color transition: `normalColor`, `pressedColor`, `hoverColor`, `disabledColor`, `duration`
- For sprite transition: `normalSprite`, `pressedSprite`, `hoverSprite`, `disabledSprite`
- For scale transition: `zoomScale`, `duration`
- `target`: the node to apply visual transition to; defaults to the button node
- `clickEvents`: `cc.Component.EventHandler[]`

Listen to clicks:

```typescript
this.spinBtn.node.on('click', this.onSpinClick, this);
```

Note: `'click'` is emitted by `cc.Button`; it is not a built-in `cc.Node` event. The listener goes on the button's node, not on a parent.

## cc.ScrollView

Engine source: `cocos2d/core/components/CCScrollView.js`.

Key properties:

- `content`: the scrollable content node (required)
- `horizontal`, `vertical`: enable scrolling axes
- `inertia`, `brake`: inertia scrolling behavior
- `elastic`, `bounceDuration`: bounce-back at edges
- `horizontalScrollBar`, `verticalScrollBar`: `cc.Scrollbar` references
- `cancelInnerEvents`: cancel touch events on content children while scrolling

Useful methods:

- `scrollToOffset(offset, timeInSecond?, attenuated?)`
- `scrollToBottom(timeInSecond?)`, `scrollToTop(timeInSecond?)`
- `getScrollOffset()`: returns `cc.Vec2`
- `scrollToPercentHorizontal(percent, timeInSecond?)`

Events:

- `'scroll-to-top'`, `'scroll-to-bottom'`, `'scrolling'`, `'bounce-top'`, `'bounce-bottom'`, etc.

```typescript
scrollView.node.on('scrolling', this.onScrolling, this);
```

## cc.PageView and cc.PageViewIndicator

Engine sources:

- `cocos2d/core/components/CCPageView.js`
- `cocos2d/core/components/CCPageViewIndicator.js`

`cc.PageView` extends `cc.ScrollView` and constrains scrolling to pages. Use it for paged help screens, onboarding panels, item pages, or page-style menus.

Key properties:

- `content`: inherited from `cc.ScrollView`; must contain the page nodes
- `sizeMode`: `cc.PageView.SizeMode.Unified` or `Free`
- `direction`: `cc.PageView.Direction.Horizontal` or `Vertical`
- `scrollThreshold`: drag distance threshold from `0` to `1`
- `autoPageTurningThreshold`: velocity threshold for quick swipes
- `pageTurningEventTiming`
- `pageTurningSpeed`
- `indicator`: optional `cc.PageViewIndicator`
- `pageEvents`: `cc.Component.EventHandler[]`

Useful methods:

- `getCurrentPageIndex()`
- `setCurrentPageIndex(index)`
- `getPages()`
- `addPage(page)`, `insertPage(page, index)`
- `removePage(page)`, `removePageAtIndex(index)`, `removeAllPages()`
- `scrollToPage(index, timeInSecond?)`

Events:

```typescript
this.pageView.node.on('page-turning', this.onPageTurning, this);
```

Pattern:

```typescript
@property(cc.PageView) pageView: cc.PageView = null;

showPage(index: number): void {
    this.pageView.scrollToPage(index, 0.25);
}

onPageTurning(pageView: cc.PageView): void {
    cc.log('[HelpPages] page:', pageView.getCurrentPageIndex());
}
```

`cc.PageViewIndicator` creates indicator nodes with `cc.Sprite`, owns a `cc.Layout`, and is normally bound through `PageView.indicator`. Configure `spriteFrame`, `direction`, `cellSize`, and `spacing` in the Editor.

## cc.Slider

Engine source: `cocos2d/core/components/CCSlider.js`.

`cc.Slider` is a draggable value control. Use it for volume, progress selection, scrubbers, or any bounded `0..1` value.

Key properties:

- `handle`: `cc.Button` used as the draggable knob
- `direction`: `cc.Slider.Direction.Horizontal` or `Vertical`
- `progress`: current value from `0` to `1`
- `slideEvents`: `cc.Component.EventHandler[]`

Events:

```typescript
this.volumeSlider.node.on('slide', this.onVolumeSlide, this);
```

Pattern:

```typescript
@property(cc.Slider) volumeSlider: cc.Slider = null;

onVolumeSlide(slider: cc.Slider): void {
    cc.audioEngine.setMusicVolume(slider.progress);
}

setVolume(value: number): void {
    this.volumeSlider.progress = Math.max(0, Math.min(1, value));
}
```

The engine updates the handle position when `progress` changes. If the handle is missing, touch handling and handle positioning do nothing.

## cc.Scrollbar

Engine source: `cocos2d/core/components/CCScrollBar.js`.

`cc.Scrollbar` is a visual scroll indicator normally driven by `cc.ScrollView`. Bind it to `ScrollView.horizontalScrollBar` or `ScrollView.verticalScrollBar`; do not manually drive private scroll callbacks in gameplay code.

Key properties:

- `handle`: `cc.Sprite` used as the moving/resizeable bar
- `direction`: `cc.Scrollbar.Direction.HORIZONTAL` or `VERTICAL`
- `enableAutoHide`
- `autoHideTime`

Useful methods:

- `hide()`
- `show()`
- `setTargetScrollView(scrollView)`: called by `cc.ScrollView` when assigned

Pattern:

```typescript
@property(cc.ScrollView) scrollView: cc.ScrollView = null;
@property(cc.Scrollbar) verticalBar: cc.Scrollbar = null;

onLoad(): void {
    this.scrollView.verticalScrollBar = this.verticalBar;
    this.verticalBar.enableAutoHide = true;
    this.verticalBar.autoHideTime = 0.8;
}
```

If the content is not larger than the ScrollView in the scrollbar direction, the engine disables useful scrollbar movement for that direction.

## cc.EditBox

Engine source: `cocos2d/core/components/CCEditBox.js`.

Bind with:

```typescript
@property(cc.EditBox) betInput: cc.EditBox = null;
```

Key properties:

- `string`: current text value
- `placeholder`: placeholder text
- `maxLength`: max character count (-1 for unlimited)
- `inputMode`: `cc.EditBox.InputMode.ANY`, `EMAIL_ADDR`, `NUMERIC`, `PHONE_NUMBER`, `URL`, `DECIMAL`, `SINGLE_LINE`
- `inputFlag`: `cc.EditBox.InputFlag.PASSWORD`, `SENSITIVE`, `INITIAL_CAPS_WORD`, `INITIAL_CAPS_SENTENCE`, `INITIAL_CAPS_ALL_CHARACTERS`
- `returnType`: `cc.EditBox.KeyboardReturnType.DEFAULT`, `DONE`, `SEND`, `SEARCH`, `GO`

Events:

```typescript
this.betInput.node.on('editing-did-began', this.onEditStart, this);
this.betInput.node.on('text-changed', this.onTextChanged, this);
this.betInput.node.on('editing-did-ended', this.onEditEnd, this);
this.betInput.node.on('editing-return', this.onEditReturn, this);
```

Input validation pattern:

```typescript
onTextChanged(editBox: cc.EditBox): void {
    const value: number = parseFloat(editBox.string);
    if (isNaN(value) || value < this._minBet) {
        editBox.string = this._minBet.toString();
    } else if (value > this._maxBet) {
        editBox.string = this._maxBet.toString();
    }
}
```

## cc.Toggle and cc.ToggleContainer

`cc.Toggle` extends `cc.Button` and adds `isChecked`.

Bind with:

```typescript
@property(cc.Toggle) soundToggle: cc.Toggle = null;
```

Listen to toggle changes:

```typescript
this.soundToggle.node.on('toggle', this.onSoundToggle, this);

onSoundToggle(toggle: cc.Toggle): void {
    if (toggle.isChecked) {
        cc.audioEngine.resumeAll();
    } else {
        cc.audioEngine.pauseAll();
    }
}
```

`cc.ToggleContainer` manages mutual exclusion across a group of toggles (radio button behavior). Attach it to the parent node of the toggles. Set `allowSwitchOff` to `true` if all toggles can be unchecked.

```typescript
@property(cc.ToggleContainer) betGroup: cc.ToggleContainer = null;

getSelectedBet(): number {
    const checked: cc.Toggle[] = this.betGroup.toggleItems.filter(t => t.isChecked);
    if (checked.length > 0) {
        return checked[0].node.getComponent(BetItemComp).betValue;
    }
    return this._defaultBet;
}
```

## cc.ProgressBar

Engine source: `cocos2d/core/components/CCProgressBar.js`.

Key properties:

- `barSprite`: the sprite used as the bar visual
- `mode`: `cc.ProgressBar.Mode.HORIZONTAL`, `VERTICAL`, `FILLED`
- `totalLength`
- `progress`: `0` to `1`
- `reverse`

## cc.WebView

Engine source: `cocos2d/webview/CCWebView.js`.

`cc.WebView` displays a web page over the game. The engine notes platform support is Web, iOS, and Android, and behavior depends on platform-level WebView rules.

Key properties:

- `url`: must be an `http` or `https` URL for normal page loading
- `webviewEvents`: `cc.Component.EventHandler[]`

Events:

```typescript
this.webView.node.on('loaded', this.onWebLoaded, this);
this.webView.node.on('loading', this.onWebLoading, this);
this.webView.node.on('error', this.onWebError, this);
```

Useful methods:

- `setJavascriptInterfaceScheme(scheme)`: Android/iOS JavaScript bridge scheme
- `setOnJSCallback(callback)`: callback for JavaScript interface scheme
- `evaluateJS(code)`: execute JavaScript in the page context

Pattern:

```typescript
@property(cc.WebView) webView: cc.WebView = null;

openHistory(url: string): void {
    this.webView.url = url;
    this.webView.node.active = true;
}

closeHistory(): void {
    this.webView.node.active = false;
}
```

On Web, WebView uses a DOM element over the canvas. If a WebView node is removed from the running scene and no longer needed, destroy the node/component explicitly so the DOM element is removed.

## cc.NodePool

Engine source: `cocos2d/core/node-pool.js`.

Use `cc.NodePool` for object pooling, especially for slot symbol nodes:

```typescript
private _symbolPool: cc.NodePool = new cc.NodePool('SymbolComp');

getSymbol(): cc.Node {
    if (this._symbolPool.size() > 0) {
        return this._symbolPool.get();
    }
    return cc.instantiate(this.symbolPrefab);
}

recycleSymbol(symbol: cc.Node): void {
    this._symbolPool.put(symbol);
}
```

When a pooled component name is passed to the constructor, `cc.NodePool` calls `reuse()` on get and `unuse()` on put for the named component. Implement `reuse(...args)` and `unuse()` on the component for reset logic.

Release pool in `onDestroy`:

```typescript
onDestroy(): void {
    this._symbolPool.clear();
}
```
