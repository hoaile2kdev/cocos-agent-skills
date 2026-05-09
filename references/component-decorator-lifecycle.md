# Component Decorator Lifecycle

## Decorators

`cc._decorator` is exported from `cocos2d/core/platform/CCClassDecorator.js` and includes:

- `ccclass`
- `property`
- `executeInEditMode`
- `requireComponent`
- `menu`
- `executionOrder`
- `disallowMultiple`
- `playOnFocus`
- `inspector`
- `icon`
- `help`
- `mixins`

Use this Cocos 2.x style:

```typescript
const { ccclass, property } = cc._decorator;

@ccclass
export class MyComp extends cc.Component {
    @property(cc.Node) target: cc.Node = null;
}
```

Do not use Cocos 3.x module imports.

## @property behavior

Engine supports:

- `@property(cc.Node) target = null`
- `@property({ type: cc.Node }) target = null`
- value types such as `cc.Vec2`
- arrays such as `@property(cc.Vec2) offsets = []`
- getter/setter properties
- editor options: `visible`, `displayName`, `tooltip`, `multiline`, `readonly`, `min`, `max`, `step`, `range`, `slide`, `serializable`, `editorOnly`, `override`, `animatable`, `formerlySerializedAs`

Default values are extracted from the class instance. Keep editor-exposed fields initialized, commonly `null`, `0`, `''`, `false`, `[]`, or a value type.

## Lifecycle order

From engine comments in `CCComponent.js`:

- `onLoad`: called when attached to an active node or first activation; always before `start`.
- `start`: called before first `update` after all `onLoad` methods have run.
- `onEnable`: called when component becomes enabled and node is active.
- `onDisable`: called when component becomes disabled or node becomes inactive.
- `update(dt)` and `lateUpdate(dt)`: called every frame when enabled.
- `onDestroy`: called when component will be destroyed.

Do not call lifecycle methods manually.

## Component creation

Engine creates components through `node.addComponent` and explicitly says Component subclasses must not rely on construction parameters. Use:

```typescript
const comp = node.addComponent(MyComp);
```

Do not use:

```typescript
const comp = new MyComp();
```

## Scheduler cleanup

`cc.Component` has `schedule`, `scheduleOnce`, `unschedule`, and `unscheduleAllCallbacks`. During `_onPreDestroy`, engine removes actions from the component, unschedules all callbacks, and calls `targetOff(this)` for registered event targets. Still prefer explicit cleanup in `onDestroy` for readability when the ownership is clear.
