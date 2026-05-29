# Scene Binding Rules

## Contents

- Required bindings
- Optional runtime data
- Static UI lookup
- Cocos meta
- Prefab binding and instantiation
- Dynamic list items
- Load order between components
- Cross-component references
- Singleton / manager access

## Required Bindings

For required nodes, components, or prefabs bound from the Cocos Editor, declare them with `@property` and access them directly. Do not add null guards just to hide wiring errors.

```typescript
@property(cc.Label) totalWinLabel: cc.Label = null;

updateTotalWin(value: number): void {
    this.totalWinLabel.string = value.toFixed(2);
}
```

## Optional runtime data

Guard only when a field is optional by runtime design, such as API fields that may be omitted, effect layers that can be disabled by config, or callbacks that are not required.

```typescript
if (this.optionalBadgeNode) {
    this.optionalBadgeNode.active = true;
}
```

## Static UI lookup

Do not use `node.getChildByName()` to find static UI in a hierarchy when it can be exposed with `@property`. `getChildByName` is suitable for dynamic data, runtime-created nodes, or a clearly documented temporary fallback.

The engine provides `getChildByName(name)` in `_BaseNode`, but it is a linear lookup over direct children and returns `null` when no name matches. For fixed UI/prefabs, `@property` is more stable and exposes wiring errors more clearly.

## Static UI authoring

For static UI, panels, popups, HUD controls, buttons, toggles, labels, and reusable visual groups, create or update the hierarchy in `.prefab` / `.fire` files and expose required nodes/components through `@property`.

Do not build fixed UI in gameplay code with `new cc.Node()` plus `addComponent(cc.Sprite)`, `addComponent(cc.Label)`, `addComponent(cc.Button)`, or `addComponent(cc.Toggle)`. That hides Editor wiring, makes asset UUIDs implicit, and makes prefab review harder.

Runtime creation is acceptable for genuinely dynamic objects such as object pools, temporary particles/effects, generated list items, or data-driven debug overlays. In those cases, state why runtime creation is intentional and use verified assets/components rather than null or fabricated references.

When a user asks to create a UI/prefab from a screenshot or mockup, read `prefab-ui-workflow.md` before editing serialized files.

## Cocos meta

When moving scripts/assets in a Cocos project, keep the `.meta` file with the asset to avoid changing UUIDs and breaking prefab/scene references.

## Prefab binding and instantiation

Bind prefabs with `@property(cc.Prefab)` and instantiate at runtime:

```typescript
@property(cc.Prefab) symbolPrefab: cc.Prefab = null;
@property(cc.Node) symbolContainer: cc.Node = null;

createSymbol(parentNode: cc.Node): cc.Node {
    const symbolNode: cc.Node = cc.instantiate(this.symbolPrefab);
    symbolNode.parent = parentNode || this.symbolContainer;
    return symbolNode;
}
```

Do not load prefabs inline with `cc.resources.load` when the prefab is always needed. Use `@property` binding and fail loud if it is missing.

## Dynamic list items

When a list of nodes is dynamically generated from data (for example, payline symbols or reel strips), use object pooling and index access instead of `@property` or `getChildByName`:

```typescript
// Pool + data-driven: correct for dynamic lists
for (let i = 0; i < data.length; i++) {
    const item: cc.Node = this.pool.get() || cc.instantiate(this.itemPrefab);
    item.parent = this.listContainer;
    item.getComponent(ItemComp).setup(data[i]);
}
```

Use `@property` only when the list size is fixed and known at edit time. Use `getChildByName` only for one-off lookups in runtime-generated hierarchies where index is unreliable.

## Load order between components

`onLoad` runs when a node is first activated. If component A depends on component B on the same node, both `onLoad` methods run in the order their components appear in the node's `_components` array — which is the order they were added in the Editor.

To enforce order:

- Use `@executionOrder(n)` decorator. Lower values run first.
- Move dependent initialization to `start()`, which runs after all `onLoad` calls.
- Never assume cross-component initialization is done in `onLoad` unless order is explicitly set.

```typescript
const { ccclass, property, executionOrder } = cc._decorator;

@ccclass
@executionOrder(-1)  // Runs onLoad before default (0)
export default class ManagerComp extends cc.Component {
    onLoad(): void {
        // Initialize before other components
    }
}
```

## Cross-component references

For referencing a component on the same node:

```typescript
// Preferred: bind in Editor
@property(cc.Sprite) bgSprite: cc.Sprite = null;

// Acceptable: runtime lookup when binding is impractical
const sprite: cc.Sprite = this.node.getComponent(cc.Sprite);
```

For referencing a component on a different node:

```typescript
// Preferred: bind the target node, then get component
@property(cc.Node) hudNode: cc.Node = null;

start(): void {
    const hudComp: HudComp = this.hudNode.getComponent(HudComp);
    hudComp.updateScore(0);
}
```

Do not use `cc.find('Canvas/HUD/ScoreLabel')` for production references. `cc.find` is a global path lookup that is fragile and breaks when the hierarchy changes. Reserve it for debug/prototyping only.

## Singleton / manager access

For singleton managers that exist as persist root nodes:

```typescript
// In the manager class
private static _instance: GameManager = null;
static get instance(): GameManager { return GameManager._instance; }

onLoad(): void {
    if (GameManager._instance) {
        this.node.destroy();
        return;
    }
    GameManager._instance = this;
    cc.game.addPersistRootNode(this.node);
}

onDestroy(): void {
    if (GameManager._instance === this) {
        GameManager._instance = null;
    }
}
```

Access without null guards (fail loud if the singleton is missing):

```typescript
GameManager.instance.doSomething();
```
