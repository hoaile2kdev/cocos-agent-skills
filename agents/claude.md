# Claude Adapter: Cocos Creator 2.4.15

Use this adapter when Claude or Claude Code is given the `cocos-creator-2415` skill directory.

## Load Order

1. Read `agents/agent.yaml` for the machine-readable manifest with conditional references.
2. Read `SKILL.md` for the primary workflow and baseline rules.
3. Load files under `references/` only when the manifest or the task says they are relevant.
4. Use `scripts/cocos_serialization_tools.js` for deterministic scene/prefab serialization checks instead of recreating that logic in the prompt.

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

## Claude Operating Notes

- Map Claude tools to the local equivalents: `Read` for file reads, `Grep` for search, shell for validation commands, and edit tools for patches.
- For no-Editor `.prefab` or `.fire` authoring, load `references/scene-prefab-authoring.md` and run the helper script to validate the result.
- Run `node tests/run-tests.js` after modifying the serialization tools or fixtures to verify nothing is broken.
- Keep project-specific workflow rules outside this engine skill; follow them only when a project explicitly provides them.
- Do not use Cocos 3.x APIs. When uncertain about an API, check `engine-source-map.md` for the fallback verification strategy.
- When a wrong API pattern is found (e.g. cc.v3, cc.loader, console.log), grep for all occurrences across the project and fix them together, not one-by-one.
