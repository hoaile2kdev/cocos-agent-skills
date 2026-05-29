# Scene and Prefab File Authoring

## Contents

- First choice
- Serialized object references
- Prefab shape
- Scene shape
- Node object
- Built-in component example: `cc.Label`
- Custom script component
- Safety rules

Use this when Codex must create or edit Cocos Creator 2.4.x `.prefab`, `.fire`, or matching `.meta` files without opening the Editor.

## First choice

Prefer copying the closest existing prefab/scene shape and changing node names, serialized properties, and asset references. Hand-building from scratch is acceptable for small, simple trees, but must follow the serialized format exactly.

When authoring UI/prefabs from a visual reference, first read `prefab-ui-workflow.md` for hierarchy planning, asset mapping, binding checklist, and apply-mode rules.

Use the helper script:

```bash
node <skillDir>/scripts/cocos_serialization_tools.js class-map <projectRoot>
node <skillDir>/scripts/cocos_serialization_tools.js class-id <projectRoot> MyLabelComp
node <skillDir>/scripts/cocos_serialization_tools.js uuid --compressed
node <skillDir>/scripts/cocos_serialization_tools.js validate <projectRoot>/assets/path/File.prefab
```

`<skillDir>` is the installed `cocos-creator-2415` skill directory, for example `~/.codex/skills/cocos-creator-2415` in Codex. Do not hard-code a machine-specific user path in reusable instructions.

## Serialized object references

Cocos scene/prefab files are JSON arrays. Array index is the local object id.

- Internal reference: `{ "__id__": 12 }` points to array element `12`.
- External asset reference: `{ "__uuid__": "asset-meta-uuid" }` points to an asset UUID from a `.meta` file.
- Type discriminator: `__type__` is either a built-in engine type such as `cc.Node`, `cc.Label`, `cc.PrefabInfo`, or a custom script class id.

Do not reorder array elements casually. If array order changes, every `__id__` reference must be updated.

## Prefab shape

A `.prefab` starts with a `cc.Prefab` object:

```json
[
  {
    "__type__": "cc.Prefab",
    "_name": "",
    "_objFlags": 0,
    "_native": "",
    "data": { "__id__": 1 },
    "optimizationPolicy": 0,
    "asyncLoadAssets": false,
    "readonly": false
  }
]
```

The root node is usually array element `1`. Ordinary prefab nodes use `_id: ""`. Root and child nodes have `_prefab` pointing to a `cc.PrefabInfo` object. For root prefab info, `fileId` is `""`; for child nodes, use a unique generated Cocos compressed UUID string.

Matching `.prefab.meta`:

```json
{
  "ver": "1.3.2",
  "uuid": "full-v4-uuid",
  "importer": "prefab",
  "optimizationPolicy": "AUTO",
  "asyncLoadAssets": false,
  "readonly": false,
  "subMetas": {}
}
```

## Scene shape

A `.fire` starts with `cc.SceneAsset`, then `cc.Scene`:

```json
[
  {
    "__type__": "cc.SceneAsset",
    "_name": "",
    "_objFlags": 0,
    "_native": "",
    "scene": { "__id__": 1 }
  },
  {
    "__type__": "cc.Scene",
    "_objFlags": 0,
    "_parent": null,
    "_children": [],
    "_active": false,
    "_components": [],
    "_prefab": null,
    "_id": "scene-meta-uuid"
  }
]
```

The scene object's `_id` should match the `.fire.meta` UUID. Child node/component `_id` values in scenes are non-empty Cocos compressed UUIDs. Ordinary scene nodes normally have `_prefab: null`.

Matching `.fire.meta`:

```json
{
  "ver": "1.3.2",
  "uuid": "full-v4-uuid",
  "importer": "scene",
  "asyncLoadAssets": false,
  "autoReleaseAssets": false,
  "subMetas": {}
}
```

## Node object

Minimal node object fields must preserve the engine's expected serialized names:

```json
{
  "__type__": "cc.Node",
  "_name": "Title",
  "_objFlags": 0,
  "_parent": { "__id__": 1 },
  "_children": [],
  "_active": true,
  "_components": [],
  "_prefab": null,
  "_opacity": 255,
  "_color": { "__type__": "cc.Color", "r": 255, "g": 255, "b": 255, "a": 255 },
  "_contentSize": { "__type__": "cc.Size", "width": 200, "height": 60 },
  "_anchorPoint": { "__type__": "cc.Vec2", "x": 0.5, "y": 0.5 },
  "_trs": {
    "__type__": "TypedArray",
    "ctor": "Float64Array",
    "array": [0, 0, 0, 0, 0, 0, 1, 1, 1, 1]
  },
  "_eulerAngles": { "__type__": "cc.Vec3", "x": 0, "y": 0, "z": 0 },
  "_skewX": 0,
  "_skewY": 0,
  "_is3DNode": false,
  "_groupIndex": 0,
  "groupIndex": 0,
  "_id": ""
}
```

For prefab nodes, `_id` is usually `""`. For scene nodes, generate a compressed UUID.

## Built-in component example: cc.Label

Attach components by:

1. Add `{ "__id__": componentIndex }` to the owning node's `_components`.
2. Add the component object with `node: { "__id__": nodeIndex }`.

```json
{
  "__type__": "cc.Label",
  "_name": "",
  "_objFlags": 0,
  "node": { "__id__": 2 },
  "_enabled": true,
  "_materials": [{ "__uuid__": "eca5d2f2-8ef6-41c2-bbe6-f9c79d09c432" }],
  "_srcBlendFactor": 770,
  "_dstBlendFactor": 771,
  "_string": "Hello",
  "_N$string": "Hello",
  "_fontSize": 32,
  "_lineHeight": 40,
  "_enableWrapText": true,
  "_N$file": null,
  "_isSystemFontUsed": true,
  "_spacingX": 0,
  "_N$horizontalAlign": 1,
  "_N$verticalAlign": 1,
  "_N$fontFamily": "Arial",
  "_N$overflow": 0,
  "_N$cacheMode": 0,
  "_id": ""
}
```

Copy a `cc.Label` object from an existing prefab/scene when possible because engine component schemas include private serialized fields.

## Custom script component

Custom component `__type__` must be the Cocos class id, not the TypeScript file name and not always the raw `.ts.meta` UUID.

Authoritative source:

- `library/imports/<uuid-prefix>/<script-uuid>.js`
- `temp/quick-scripts/src/.../*.js`
- `temp/quick-scripts/dst/.../*.js`

The compiled script contains:

```js
cc._RF.push(module, "classIdHere", "ClassNameHere");
```

Use `class-id` from the helper script. If compiled JS is missing for a new script, import/compile with Cocos before attaching it in serialized assets, or treat the generated file as unverified.

Custom component fields are serialized `@property` fields plus engine fields:

```json
{
  "__type__": "d757eISktxAvacreeEMGyoi",
  "_name": "",
  "_objFlags": 0,
  "node": { "__id__": 1 },
  "_enabled": true,
  "amountLabel": { "__id__": 16 },
  "tierLabel": { "__id__": 10 },
  "touchArea": { "__id__": 1 },
  "_id": ""
}
```

Read the class and nearby existing serialized instances before creating a custom component object. Node/component properties use `__id__`; asset properties use `__uuid__`; scalar properties use normal JSON values.

## Safety rules

- Do not invent custom script class ids from names.
- Do not fabricate asset UUIDs. Discover real UUIDs from `.meta` files, existing serialized references, or Cocos built-in asset metadata.
- Preserve existing `.meta` UUIDs. Generate new UUIDs only for genuinely new files/assets that require them.
- Do not leave required sprite frames, fonts, materials, prefab references, or component bindings null unless the existing local pattern intentionally does so or the user explicitly asks for placeholders.
- For labels, use system font only when it matches the requested or existing style; otherwise bind a real font asset UUID.
- Do not edit `.prefab`/`.fire` with string replacement unless the change is a simple scalar value.
- Keep `.meta` files with moved assets; new assets need new UUIDs.
- Use full UUIDs in `.meta` and external `__uuid__` references.
- Use compressed UUID strings for scene node/component `_id` and prefab child `fileId`.
- Validate JSON and `__id__` references after every generated asset change.
- After generation, prefer opening in Cocos Editor as final validation when available; typecheck cannot prove scene/prefab wiring.
