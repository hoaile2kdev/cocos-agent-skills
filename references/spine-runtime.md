# Spine Runtime

## Contents

- Namespace
- Component use
- Cache mode caveat
- Playback pattern
- Event listeners
- Skin switching
- Mix / crossfade
- Time scale

## Namespace

Cocos Creator 2.4.15 exposes Spine through global namespace `sp`, loaded from `extensions/spine/index.js`.

Important types:

- `sp.Skeleton`
- `sp.SkeletonData`
- `sp.Skeleton.AnimationCacheMode`
- `sp.AnimationEventType`
- `sp.timeScale`
- `sp.spine` for the official Spine runtime namespace

## Component use

Bind Spine components with Cocos 2.x decorators:

```typescript
@property(sp.Skeleton) skeleton: sp.Skeleton = null;
```

Common runtime methods/properties from `extensions/spine/Skeleton.js`:

- `skeletonData`
- `defaultSkin`
- `defaultAnimation`
- `animation`
- `loop`
- `premultipliedAlpha`
- `timeScale`
- `setSkeletonData`
- `setAnimationStateData`
- `setAnimationCacheMode`
- `setAnimation(trackIndex, name, loop)`
- `addAnimation(trackIndex, name, loop, delay)`
- `findAnimation(name)`
- `clearTracks()`

## Cache mode caveat

Some methods warn or are unavailable in cached mode, including `setAnimationStateData` and `clearTracks`. Before changing Spine playback logic, inspect whether the component uses `REALTIME`, `SHARED_CACHE`, or `PRIVATE_CACHE`.

## Playback pattern

For required Spine binding, fail loud:

```typescript
this.skeleton.setAnimation(0, 'win', false);
this.skeleton.addAnimation(0, 'idle', true, 0);
```

Do not add defensive guards around required `@property(sp.Skeleton)` unless the component is explicitly optional.

## Event listeners

Listen for animation completion or custom Spine events:

```typescript
this.skeleton.setCompleteListener((trackEntry: sp.spine.TrackEntry) => {
    cc.log('[SpineComp] complete:', trackEntry.animation.name);
    if (trackEntry.animation.name === 'win') {
        this.onWinAnimComplete();
    }
});

this.skeleton.setEventListener((trackEntry: sp.spine.TrackEntry, event: sp.spine.Event) => {
    cc.log('[SpineComp] event:', event.data.name, event.stringValue);
});
```

Other listeners: `setStartListener`, `setEndListener`, `setInterruptListener`, `setDisposeListener`.

Clear listeners by passing `null`.

In cached mode (`SHARED_CACHE` / `PRIVATE_CACHE`), event listeners may not fire or may behave differently. If listeners are required, use `REALTIME` mode.

## Skin switching

```typescript
this.skeleton.setSkin('gold');
```

To reset to default skin:

```typescript
this.skeleton.setSkin(this.skeleton.defaultSkin);
```

Skin changes require the skeleton to re-attach slot attachments. Call `setSkin` before `setAnimation` when changing both.

## Mix / crossfade

```typescript
this.skeleton.setMix('idle', 'win', 0.2);
this.skeleton.setMix('win', 'idle', 0.2);
```

Set mix durations before playing animations. This creates smooth transitions between animation states.

## Time scale

```typescript
this.skeleton.timeScale = 1.5;  // Play 1.5x speed
```

Global time scale: `sp.timeScale = 0.5` affects all Spine skeletons.
