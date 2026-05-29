# Prefab UI Workflow

Use this when creating or editing Cocos Creator 2.4.x UI, scene nodes, or prefabs from a screenshot, mockup, layout description, or visual reference.

## Core principle

Static UI belongs in `.prefab` / `.fire` authoring, not gameplay code. Runtime code should instantiate prefabs and bind required nodes/components through `@property`; it should not create fixed visual hierarchies with ad hoc `new cc.Node()` and `addComponent(...)` calls.

## Visual-to-prefab workflow

1. Decompose the visual reference into layout blocks: root, panels, containers, labels, buttons, toggles, icons, effects, and repeated cells.
2. Decide whether each block is static, reusable, dynamic, or placeholder-only.
3. Build a node hierarchy with stable names, anchors, content sizes, positions, opacity, color, and component list.
4. Map each visible element to verified Cocos built-in assets, project assets, system font, or explicit `REQUIRES_BINDING`.
5. Define required `@property` bindings for scripts and prefab instances. Required bindings should fail loud if missing.
6. Before serialized writes, read `scene-prefab-authoring.md` and validate JSON plus all `__id__` references.
7. After generation, summarize changed prefab paths, selected asset UUIDs, required manual bindings, and validation performed.

## Default assets

If the user says `default assets` without more context, infer from the project or ask when the distinction matters:

- `Cocos default only`: use only built-in Cocos components, colors, sizes, labels, and Cocos default assets. Do not bind project assets.
- `Project default assets`: prefer existing project sprite frames, fonts, materials, and prefabs that match local style.

Locate Cocos default assets from the active Cocos Creator installation, commonly under:

```text
<CocosCreator.app>/Contents/Resources/static/default-assets/image
```

Do not hard-code a machine-specific Cocos app path in reusable output. Verify default asset UUIDs from the matching `.meta` files or existing serialized references before binding them.

Known Cocos Creator 2.4.15 default image UUIDs:

| Default asset | Texture UUID | SpriteFrame UUID |
|---|---|---|
| `default_panel.png` | `d81ec8ad-247c-4e62-aa3c-d35c4193c7af` | `9bbda31e-ad49-43c9-aaf2-f7d9896bac69` |
| `default_btn_normal.png` | `e851e89b-faa2-4484-bea6-5c01dd9f06e2` | `f0048c10-f03e-4c97-b9d3-3506e1d58952` |
| `default_btn_pressed.png` | `b43ff3c2-02bb-4874-81f7-f2dea6970f18` | `e9ec654c-97a2-4787-9325-e6a10375219a` |
| `default_btn_disabled.png` | `71561142-4c83-4933-afca-cb7a17f67053` | `29158224-f8dd-4661-a796-1ffab537140e` |
| `default_toggle_normal.png` | `d29077ba-1627-4a72-9579-7b56a235340c` | `6827ca32-0107-4552-bab2-dfb31799bb44` |
| `default_toggle_pressed.png` | `b181c1e4-0a72-4a91-bfb0-ae6f36ca60bd` | `7d4ffd94-42d6-4045-9db7-a744229adfc4` |
| `default_toggle_disabled.png` | `c25b9d50-c8fc-4d27-beeb-6e7c1f2e5c0f` | `7168db62-0edc-42e5-be5d-682cf6c4a165` |
| `default_toggle_checkmark.png` | `73a0903d-d80e-4e3c-aa67-f999543c08f5` | `90004ad6-2f6d-40e1-93ef-b714375c6f06` |
| `default_sprite.png` | `6e056173-d285-473c-b206-40a7fff5386e` | `8cdb44ac-a3f6-449f-b354-7cd48cf84061` |
| `default_editbox_bg.png` | `edd215b9-2796-4a05-aaf5-81f96c9281ce` | `ff0e91c7-55c6-4086-a39f-cb6e457b8c3b` |
| `default_progressbar.png` | `cfef78f1-c8df-49b7-8ed0-4c953ace2621` | `67e68bc9-dad5-4ad9-a2d8-7e03d458e32f` |
| `default_progressbar_bg.png` | `99170b0b-d210-46f1-b213-7d9e3f23098a` | `88e79fd5-96b4-4a77-a1f4-312467171014` |
| `default_radio_button_off.png` | `567dcd80-8bf4-4535-8a5a-313f1caf078a` | `e7aba14b-f956-4480-b254-8d57832e273f` |
| `default_radio_button_on.png` | `9d60001f-b5f4-4726-a629-2659e3ded0b8` | `1a32fc76-f0bd-4f66-980f-56929c0ca0b3` |
| `default_scrollbar.png` | `0291c134-b3da-4098-b7b5-e397edbe947f` | `31d8962d-babb-4ec7-be19-8e9f54a4ea99` |
| `default_scrollbar_bg.png` | `4bab67cb-18e6-4099-b840-355f0473f890` | `c9fa51ff-3f01-4601-8f80-325d1b11dab7` |
| `default_scrollbar_vertical.png` | `d6d3ca85-4681-47c1-b5dd-d036a9d39ea2` | `5c3bb932-6c3c-468f-88a9-c8c61d458641` |
| `default_scrollbar_vertical_bg.png` | `617323dd-11f4-4dd3-8eec-0caf6b3b45b9` | `5fe5dcaa-b513-4dc5-a166-573627b3a159` |
| `default-particle.png` | `600301aa-3357-4a10-b086-84f011fa32ba` | `4300f941-ba03-4d19-bdb1-959ef40f1852` |
| `default_sprite_splash.png` | `0275e94c-56a7-410f-bd1a-fc7483f7d14a` | `a23235d1-15db-4b95-8439-a2e005bfff91` |

Common default material UUID seen in Cocos 2.4.x serialized UI samples: `eca5d2f2-8ef6-41c2-bbe6-f9c79d09c432`.

## Non-negotiables

- Compose a new hierarchy from the reference image, Cocos primitives, and verified assets. Do not clone a complete production prefab just because it looks similar unless the user explicitly asks for a variant.
- Reuse existing assets first. If an asset is missing, output `REQUIRES_BINDING` with the exact slot/key.
- Do not invent missing sprite frames, font UUIDs, material UUIDs, prefab UUIDs, or custom component class ids.
- It is acceptable to copy small built-in component schemas such as `cc.Sprite`, `cc.Label`, and `cc.Button` from existing serialized files to preserve Cocos 2.4.x private fields.
- If a generator script is needed, run it from the project root with terminal Node so paths and permissions match the active workspace.
- Prefer adapting an existing layout-mapper/generator script for repeated node/component mapping instead of writing large one-off serialized JSON by hand.
- Keep required bindings fail-loud; do not auto-heal prefab wiring silently with runtime `addComponent()` helpers.

## Output modes

- `PLAN_ONLY`: provide hierarchy, asset mapping, required bindings, and verification plan.
- `PREFAB_AUTHORING_PLAN`: include the exact source prefab/asset strategy and serialized-write plan.
- `PREFAB_APPLY`: create or update `.prefab` / `.meta` files only after the user explicitly asks to apply.

## Verification checklist

- The `.prefab` / `.fire` JSON parses.
- Every internal `__id__` reference points to an existing array element.
- Every external `__uuid__` reference comes from a real `.meta` file or verified built-in asset.
- Custom component `__type__` values come from compiled Cocos class ids, not TypeScript filenames.
- Required script properties point to the intended node/component/asset.
- The generated hierarchy can be reviewed in Cocos Editor when available; TypeScript typecheck does not validate scene wiring.
