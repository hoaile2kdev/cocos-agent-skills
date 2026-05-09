# Asset Manager 2.4

## Contents

- Core rule
- Preferred APIs
- `resources` bundle
- Asset bundle
- Deprecated mapping
- Error handling
- Asset reference counting

## Core rule

`cc.assetManager` is the Cocos 2.4 singleton for loading/releasing assets. `cc.loader` exists as a deprecated compatibility facade and should not be used for new code.

Engine source:

- `cocos2d/core/asset-manager/CCAssetManager.js`
- `cocos2d/core/asset-manager/bundle.js`
- `cocos2d/core/asset-manager/deprecated.js`

## Preferred APIs

- `cc.assetManager.loadAny(requests, options?, onProgress?, onComplete?)`
- `cc.assetManager.preloadAny(requests, options?, onProgress?, onComplete?)`
- `cc.assetManager.loadRemote(url, options?, onComplete?)`
- `cc.assetManager.loadBundle(nameOrUrl, options?, onComplete?)`
- `cc.assetManager.getBundle(name)`
- `cc.assetManager.removeBundle(bundle)`
- `cc.assetManager.releaseAsset(asset)`
- `cc.assetManager.releaseUnusedAssets()`
- `cc.assetManager.releaseAll()`

## resources bundle

`cc.resources` is a bundle for assets under `assets/resources`.

Use:

```typescript
cc.resources.load('textures/background', cc.SpriteFrame, (err: Error, frame: cc.SpriteFrame) => {
    if (err) {
        cc.error('[MyComp] load background:', err);
        return;
    }
    this.sprite.spriteFrame = frame;
});
```

Paths are relative to the bundle and omit extension. Engine bundle docs warn paths use forward slashes; backslashes do not work.

## Asset bundle

Use bundle APIs for non-resources bundles:

```typescript
cc.assetManager.loadBundle('bundle1', (err: Error, bundle: cc.AssetManager.Bundle) => {
    if (err) {
        cc.error('[MyComp] loadBundle:', err);
        return;
    }
    bundle.load('misc/character/cocos', cc.Prefab, (loadErr: Error, prefab: cc.Prefab) => {
        if (loadErr) {
            cc.error('[MyComp] load prefab:', loadErr);
            return;
        }
        this.spawn(prefab);
    });
});
```

## Deprecated mapping

- `cc.loader.load` -> `cc.assetManager.loadAny`
- `cc.loader.loadRes` -> `cc.resources.load`
- `cc.loader.loadResArray` -> `cc.resources.load`
- `cc.loader.loadResDir` -> `cc.resources.loadDir`
- `cc.loader.getRes` -> `cc.resources.get`
- `cc.loader.release` / `releaseAsset` -> `cc.assetManager.releaseAsset`
- `cc.loader.releaseRes` -> `cc.resources.release`
- `cc.loader.releaseAll` -> `cc.assetManager.releaseAll`
- `cc.loader.downloader` -> `cc.assetManager.downloader`
- `cc.loader.loader` -> `cc.assetManager.parser`
- `cc.loader.addDownloadHandlers` -> `cc.assetManager.downloader.register`
- `cc.loader.addLoadHandlers` -> `cc.assetManager.parser.register`
- `cc.loader.setAutoRelease` -> `cc.Asset.addRef`

## Error handling

Asset callbacks use `(err, asset)` or `(err, assets)`. Fail loud enough for required assets; do not silently ignore `err` when the prefab/sprite/audio is required for the scene.

## Asset reference counting

Cocos 2.4.x uses `addRef()` / `decRef()` for manual reference management:

```typescript
// Keep an asset alive (prevent auto-release)
asset.addRef();

// When done, release the reference
asset.decRef();
```

`cc.assetManager.releaseAsset(asset)` forces release regardless of refCount.

### Best practices

- Call `addRef()` on assets loaded dynamically that must survive scene changes.
- Call `decRef()` in `onDestroy()` to balance references.
- Use `cc.assetManager.releaseUnusedAssets()` for batch cleanup between game rounds, not during gameplay.
- Do not release assets that are still referenced by active nodes/components.
- Bundle-level release: `cc.assetManager.removeBundle(bundle)` removes the bundle object but does not release loaded assets from it. Release assets first, then remove the bundle.

### Release pattern for slot game rounds

```typescript
onDestroy(): void {
    if (this._dynamicSprite) {
        this._dynamicSprite.decRef();
        this._dynamicSprite = null;
    }
}
```
