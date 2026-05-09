# Gemini Adapter: Cocos Creator 2.4.15

Use this adapter when Gemini, Gemini CLI, or a Gemini-based agent is given the `cocos-creator-2415` skill directory.

## Load Order

1. Read `agents/agent.yaml` for the machine-readable manifest with conditional references.
2. Read `SKILL.md` for the primary workflow and baseline rules.
3. Load only the relevant `references/*.md` files listed in the manifest.
4. Run `scripts/cocos_serialization_tools.js` when the task involves serialized Cocos `.prefab`, `.fire`, `.meta`, UUID, or custom script component work.

## Reference Quick Index

| Task | Load |
|---|---|
| TypeScript, decorators, API choices | `api-and-ts-rules.md` |
| Component lifecycle, `@property` | `component-decorator-lifecycle.md` |
| Node hierarchy, events, transforms, tweens | `node-event-transform-action.md` |
| Asset loading, bundles, release | `asset-manager-2-4.md` |
| Spine animations, skins, events | `spine-runtime.md` |
| UI/render: Sprite, Canvas, Camera, Widget, Button, ScrollView, PageView, Slider, Scrollbar, WebView, NodePool | `ui-components.md` |
| Audio, scene management, platform, network | `audio-scene-platform.md` |
| Graphics drawing, win lines, masks | `graphics-mask.md` |
| Frame animation, particles, input blocking, rich text | `animation-particles.md` |
| Editor bindings, prefab wiring, singletons | `scene-binding-rules.md` |
| No-Editor `.prefab`/`.fire` authoring | `scene-prefab-authoring.md` |
| Engine source inspection | `engine-source-map.md` |

## Gemini Operating Notes

- Treat `SKILL.md` as the primary instruction file and `agents/agent.yaml` as the machine-readable routing map.
- Prefer precise file search and small file ranges over loading an entire project.
- Do not use Cocos APIs newer than 2.4.x. When uncertain, use the fallback strategy in `engine-source-map.md`.
- Run `node tests/run-tests.js` after modifying the serialization tools or fixtures to verify nothing is broken.
- Keep project-specific workflow rules outside this engine skill; follow them only when a project explicitly provides them.
- When a wrong API pattern is found (e.g. cc.v3, cc.loader, console.log), search for all occurrences across the project and fix them systematically.
