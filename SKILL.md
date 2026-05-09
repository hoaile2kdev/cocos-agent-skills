---
name: cocos-creator-2415
description: Use when Codex needs Cocos Creator 2.4.x/2.4.15 engine-specific guidance for TypeScript cc.Component scripts, cc._decorator/@property editor bindings, serialized .prefab/.fire scene authoring, prefabs/scenes, cc.Node hierarchy/events/transforms, cc.assetManager/resources/bundles, cc.tween/actions, Spine sp.Skeleton, web-mobile builds, or fixes that must avoid newer Cocos APIs.
---

# Cocos Creator 2.4.15

## Goal

Keep Codex inside the constraints of the Cocos Creator 2.4.15 engine and the host project's TypeScript conventions. Preserve Editor bindings, follow the engine's serialized asset rules, and only use APIs compatible with Cocos 2.4.x.

This skill was verified against a local Cocos Creator 2.4.15 engine source checkout. The common app path is `~/Applications/Cocos/Creator/2.4.15/CocosCreator.app`, and the common engine source path is `~/Applications/Cocos/Creator/2.4.15/CocosCreator.app/Contents/Resources/engine`. On another machine, ask for or locate that machine's own Cocos Creator 2.4.15 `Contents/Resources/engine` path. Do not edit engine source unless the user explicitly asks; read it only to verify API behavior.

## Quick Workflow

1. Confirm the file is Cocos 2.4.x TypeScript; do not apply Cocos 3.x patterns.
2. Read nearby scripts only to match local component style; keep this skill's reasoning grounded in Cocos engine behavior.
3. For TypeScript component skeletons, export style, imports, logging, or API choices, read `references/api-and-ts-rules.md`.
4. If an API is uncertain for Cocos 2.4.15, read `references/engine-source-map.md` to find the engine source file to inspect.
5. For `cc.Component`, decorators, lifecycle, or `@property`, read `references/component-decorator-lifecycle.md`.
6. For node hierarchy, events, transforms, tweens, or actions, read `references/node-event-transform-action.md`.
7. For asset loading, resources, bundles, or release behavior, read `references/asset-manager-2-4.md`.
8. For Spine, read `references/spine-runtime.md`.
9. For static UI binding, prefabs, or scenes, read `references/scene-binding-rules.md`.
10. When directly creating or editing `.prefab`, `.fire`, or `.meta` files without the Editor, read `references/scene-prefab-authoring.md` and use `scripts/cocos_serialization_tools.js`.
11. For common UI/render components such as Sprite, Canvas, Camera, Widget, Button, ScrollView, PageView, Slider, Scrollbar, WebView, or NodePool, read `references/ui-components.md`.
12. For audio playback, scene management, platform detection, or networking, read `references/audio-scene-platform.md`.
13. For drawing shapes, win lines, or clipping/masking nodes, read `references/graphics-mask.md`.
14. For frame animations, particle effects, input blocking, or rich text, read `references/animation-particles.md`.
15. After edits, review public API, class signatures, and imports first; typecheck only when the change has meaningful blast radius.

## Baseline Rules

- Use `cc.Component`, `cc.Node`, `cc.Sprite`, and `cc.Label`; do not use bare `Component` or `Node`.
- Use `cc.assetManager`; do not use `cc.loader`.
- Use `cc.v2`; do not use `cc.v3` for 2D positions in Cocos 2.4.x.
- Use `cc.tween(node).to(...).start()` for tweens.
- Do not create components with `new`; use `node.addComponent(...)`.
- `active` is on the node: use `this.node.active`, not `this.active`.
- Use `cc.log`, `cc.warn`, and `cc.error`; do not use `console.log`.
- Follow the project's export style. Both `export default class` and `export class` work; match whichever the host project uses.
- Always use `{}` for `if`, `else`, `for`, and `while`.
- For 2D game/UI code, use `cc.v2` or pass `(x, y)` to `node.setPosition`; use `cc.v3` only when the node or logic is intentionally 3D.
- Do not use Cocos 3.x APIs such as `import { _decorator, Component, Node } from 'cc'`.

## Binding and Runtime Failures

Distinguish required bindings from optional runtime data. For required Editor bindings, managers/singletons, or required prefab/scene components, access directly so wiring mistakes fail loudly. Use `if`, `?.`, or `&&` only when optionality is part of the runtime design.

## Verification

Do not run heavy builds by reflex. For a small change in one script, import/signature/API review is usually enough. For changes across multiple classes, shared interfaces, public APIs, runtime flow, or build behavior, run the host project's standard TypeScript/build validation when available.
