# Cocos 2.4.15 API and TypeScript Rules

Verified engine sources:

- `package.json`: engine `cocos-creator-js` version `2.4.15`.
- `tsconfig.json`: `target: es5`, `module: commonjs`, `allowJs: true`, `experimentalDecorators: true`.
- `api.d.ts`: declares only global build flags and `cc: any`; detailed API behavior lives in runtime source.

## Component skeleton

```typescript
const { ccclass, property } = cc._decorator;

@ccclass
export class MyComponentComp extends cc.Component {
    @property(cc.Label) label: cc.Label = null;
    @property text: string = 'hello';

    onLoad(): void {
        // Init local bindings.
    }

    start(): void {
        // Logic that needs other components initialized.
    }

    onDestroy(): void {
        // Unschedule and remove listeners.
    }
}
```

The `= null` editor-binding pattern matches common Cocos Creator 2.x project settings. If a host project enables `strictNullChecks`, use the project's nullable-binding convention and preserve fail-loud access for required editor wiring.

## Do / Don't

| Need | Use | Avoid |
|---|---|---|
| Component/base class | `cc.Component`, `cc.Node` | `Component`, `Node` |
| Asset loading | `cc.assetManager` | `cc.loader` |
| Position 2D | `cc.v2(x, y)` | `cc.v3(x, y, z)` |
| Animation | `cc.tween(node).to(duration, props).start()` | API Cocos 3.x |
| Instantiate | `cc.instantiate(prefab)` | `new PrefabClass()` |
| Component lookup | `node.getComponent(ClassName)` | `new MyComponent()` |
| Logging | `cc.log`, `cc.warn`, `cc.error` | `console.log` |
| Visibility | `node.active = false` | `component.active = false` |
| Cocos 2.x import | `const { ccclass, property } = cc._decorator` | `import { _decorator, Component } from 'cc'` |
| Instance component | `node.addComponent(MyComp)` | `new MyComp()` |
| Clone prefab/node | `cc.instantiate(prefabOrNode)` | `new cc.Node` when cloning prefab |
| Touch events | `cc.Node.EventType.TOUCH_START`, etc. | `node.on('touchstart', handler)` |
| Node lookup (production) | `@property(cc.Node)` bind in Editor | `cc.find('path/to/node')` |

## TypeScript rules

- Follow the host project's export style (`export default class` or `export class`). Match whichever convention the project already uses.
- Avoid implicit `any`; prefer existing project interfaces/types.
- Always use `{}` for control flow.
- Before changing a public interface or shared type, find all call sites with `rg`.
- When the project has an export bridge, import through the bridge instead of deep-importing directly.

## Common Build Flags

The engine declares these global flags: `CC_EDITOR`, `CC_PREVIEW`, `CC_DEV`, `CC_DEBUG`, `CC_BUILD`, `CC_JSB`, `CC_RUNTIME`, `CC_TEST`, `CC_WECHATGAME`. Do not invent new flags when runtime/editor branching is enough.
