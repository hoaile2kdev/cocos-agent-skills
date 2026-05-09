# Node, Events, Transform, Actions

## Node active state

`active` is a `Node` property from `_BaseNode`, not a `Component` property. Use:

```typescript
this.node.active = false;
```

Use `node.activeInHierarchy` only when you need the effective scene-active state including inactive parents.

## Hierarchy

- `node.children` and `childrenCount` are read-only accessors over `_children`.
- `getChildByName(name)` searches direct children by name and returns `null` when missing.
- `addChild(child)`, `insertChild(child, index)`, `removeFromParent(cleanup)`, `removeChild(child, cleanup)`, `removeAllChildren(cleanup)` are available.
- For static prefab UI, prefer `@property` binding over runtime name lookup.

## Components on nodes

- `node.getComponent(ClassOrName)` returns first matching component or `null`.
- `node.getComponents(ClassOrName)` returns all matching components on the node.
- `node.getComponentInChildren` and `getComponentsInChildren` search depth-first.
- `node.addComponent(ClassOrName)` creates a component, assigns `component.node`, activates it if the node is active, and honors `@requireComponent`.
- `node.removeComponent` is deprecated; prefer `component.destroy()`.

## Events

Node supports built-in touch/mouse and property events:

- Touch: `touchstart`, `touchmove`, `touchend`, `touchcancel`.
- Mouse: `mousedown`, `mousemove`, `mouseenter`, `mouseleave`, `mouseup`, `mousewheel`.
- Property/hierarchy: `position-changed`, `rotation-changed`, `scale-changed`, `size-changed`, `anchor-changed`, `color-changed`, `child-added`, `child-removed`, `child-reorder`, `group-changed`, `sibling-order-changed`.

Use:

```typescript
this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
this.node.emit('custom-event', payload);
```

For custom events emitted with `emit`, there is no capture/bubble phase. Touch/mouse events use dispatch with capture/target/bubble phases.

## Event cleanup

`EventTarget.on(type, callback, target)` records the event target in `target.__eventTargets`. Component destruction calls `targetOff(this)` on those targets. This is a safety net, not a reason to hide ownership; still remove long-lived or cross-system listeners explicitly in `onDestroy` when practical.

## Transform

`node.setPosition` supports `(x, y)`, `cc.Vec2`, `(x, y, z)`, or `cc.Vec3`. Engine notes:

- Passing two numbers is efficient and keeps existing `z`.
- Passing `cc.v2(x, y)` sets `z` to `0`.
- `cc.v3` is for 3D node use.

For 2D game/UI code, prefer `node.setPosition(x, y)` or `node.setPosition(cc.v2(x, y))`; use `cc.v3` only when `is3DNode`/3D transform is intended.

`skewX` and `skewY` are deprecated since v2.2.1; avoid new use.

## Tween and actions

`cc.tween(target)` is defined in `cocos2d/actions/tween.js` and starts by adding an action to `cc.director.getActionManager()`. It supports `to`, `by`, `set`, `delay`, `call`, `hide`, `show`, `removeSelf`, `sequence`, `parallel`, `repeat`, `repeatForever`, `reverseTime`.

Use:

```typescript
cc.tween(this.node)
    .to(0.2, { opacity: 255 })
    .call(this.onFadeComplete, this)
    .start();
```

Avoid mutating an action after `runAction`; engine comments note it will not take effect.
