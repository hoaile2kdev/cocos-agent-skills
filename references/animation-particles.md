# Animation and Particles

## Contents

- `cc.Animation`
- `cc.ParticleSystem`
- `cc.BlockInputEvents`
- `cc.RichText`

## cc.Animation

Engine source: `cocos2d/core/components/CCAnimation.js`.

`cc.Animation` plays `cc.AnimationClip` frame animations. Used for symbol idle/win effects, UI transitions, and number counters that are not Spine-based.

### Binding

```typescript
@property(cc.Animation) symbolAnim: cc.Animation = null;
```

### Key properties

- `defaultClip`: `cc.AnimationClip` played on load if `playOnLoad` is true
- `currentClip`: currently playing clip (read-only)
- `playOnLoad`: auto-play default clip on start
- `clips`: array of `cc.AnimationClip` available on this component

### Playback

```typescript
// Play default clip
this.symbolAnim.play();

// Play a named clip
this.symbolAnim.play('win');

// Play with a specific state
const state: cc.AnimationState = this.symbolAnim.play('idle');
state.speed = 1.5;
state.wrapMode = cc.WrapMode.Loop;

// Stop
this.symbolAnim.stop();
this.symbolAnim.stop('win');

// Pause / Resume
this.symbolAnim.pause();
this.symbolAnim.resume();
```

### Animation events

```typescript
this.symbolAnim.on('play', this.onAnimPlay, this);
this.symbolAnim.on('stop', this.onAnimStop, this);
this.symbolAnim.on('pause', this.onAnimPause, this);
this.symbolAnim.on('resume', this.onAnimResume, this);
this.symbolAnim.on('lastframe', this.onAnimLastFrame, this);
this.symbolAnim.on('finished', this.onAnimFinished, this);
```

`'finished'` fires when a non-looping clip completes. `'lastframe'` fires on every loop iteration at the last frame.

### AnimationState

`cc.AnimationState` controls playback details:

- `speed`: playback speed multiplier
- `time`: current time position
- `duration`: clip duration (read-only)
- `wrapMode`: `cc.WrapMode.Normal`, `Loop`, `PingPong`, `Reverse`, `LoopReverse`, `PingPongReverse`
- `repeatCount`: number of times to play (Infinity for loop)
- `isPlaying`, `isPaused`: state flags

### Dynamic clip creation pattern

For programmatic frame animations (less common, but useful for dynamic content):

```typescript
const clip: cc.AnimationClip = cc.AnimationClip.createWithSpriteFrames(frames, fps);
clip.name = 'dynamicAnim';
clip.wrapMode = cc.WrapMode.Loop;
this.symbolAnim.addClip(clip);
this.symbolAnim.play('dynamicAnim');
```

### Cleanup

```typescript
onDestroy(): void {
    this.symbolAnim.off('finished', this.onAnimFinished, this);
    this.symbolAnim.stop();
}
```

## cc.ParticleSystem

Engine source: `cocos2d/core/components/CCParticleSystem.js`.

`cc.ParticleSystem` renders particle effects. Used for win celebrations, coin showers, and ambient effects in slot games.

### Binding

```typescript
@property(cc.ParticleSystem) winParticles: cc.ParticleSystem = null;
```

### Key properties

- `file`: the `.plist` particle file (`cc.ParticleAsset`)
- `custom`: whether to use custom properties instead of the plist file
- `totalParticles`: max number of alive particles
- `duration`: emission duration in seconds (-1 for infinite)
- `emissionRate`: particles per second
- `life`, `lifeVar`: particle lifetime and variance
- `startColor`, `startColorVar`, `endColor`, `endColorVar`: color over lifetime
- `startSize`, `startSizeVar`, `endSize`, `endSizeVar`: size over lifetime
- `startSpin`, `startSpinVar`, `endSpin`, `endSpinVar`: rotation over lifetime
- `angle`, `angleVar`: initial emission angle
- `speed`, `speedVar`: initial speed
- `posVar`: position variance (spawn area)
- `emitterMode`: `cc.ParticleSystem.EmitterMode.GRAVITY` or `RADIUS`
- `gravity`: gravity vector (gravity mode only)
- `radialAccel`, `tangentialAccel`: acceleration (gravity mode)
- `autoRemoveOnFinish`: destroy node when emission ends
- `playOnLoad`: auto-start on load
- `positionType`: `cc.ParticleSystem.PositionType.FREE`, `RELATIVE`, `GROUPED`

### Playback

```typescript
// Start emitting
this.winParticles.resetSystem();

// Stop emitting (existing particles continue to live)
this.winParticles.stopSystem();

// Instantly remove all particles
this.winParticles.node.active = false;
this.winParticles.node.active = true;
```

### Win celebration pattern

```typescript
showWinEffect(): void {
    this.winParticles.node.active = true;
    this.winParticles.resetSystem();
}

hideWinEffect(): void {
    this.winParticles.stopSystem();
    this.scheduleOnce(() => {
        this.winParticles.node.active = false;
    }, this.winParticles.life + this.winParticles.lifeVar);
}
```

### Loading particle file dynamically

```typescript
bundle.load('particles/coins', cc.ParticleAsset, (err: Error, asset: cc.ParticleAsset) => {
    if (err) {
        cc.error('[ParticleMgr] load coins:', err);
        return;
    }
    this.winParticles.file = asset;
    this.winParticles.resetSystem();
});
```

### Position type guide

- `FREE`: particles stay in world space (move independently from emitter node). Good for trails.
- `RELATIVE`: particles follow emitter node's parent. Good for attached effects.
- `GROUPED`: particles are grouped with emitter node. Good for UI-anchored effects like button sparkles.

### Performance notes

- Keep `totalParticles` as low as visually acceptable. On mobile web, 150-300 is a good range.
- Use `autoRemoveOnFinish = true` for one-shot effects to avoid orphaned particle nodes.
- Avoid running multiple high-particle-count systems simultaneously on low-end devices.
- Particle systems use `cc.RenderComponent`; they affect draw calls. Batch when possible.

## cc.BlockInputEvents

Engine source: `cocos2d/core/components/CCBlockInputEvents.js`.

`cc.BlockInputEvents` blocks all touch/mouse input events from passing through a node. It swallows `touchstart`, `touchmove`, `touchend`, `touchcancel`, `mousedown`, `mousemove`, `mouseup`, and `mousewheel`.

Use this to prevent interaction during transitions, spin animations, or modal overlays:

```typescript
// Add to a fullscreen overlay node to block all input
const blocker: cc.Node = new cc.Node('InputBlocker');
blocker.addComponent(cc.BlockInputEvents);
blocker.setContentSize(cc.winSize);
blocker.parent = this.node;

// Remove when done
blocker.destroy();
```

Or bind from Editor:

```typescript
@property(cc.Node) inputBlocker: cc.Node = null;

lockInput(): void {
    this.inputBlocker.active = true;
}

unlockInput(): void {
    this.inputBlocker.active = false;
}
```

This is simpler and more reliable than manually disabling buttons during spin sequences.

## cc.RichText

Engine source: `cocos2d/core/components/CCRichText.js`.

`cc.RichText` renders formatted text with inline styles, images, and colors. Used for paytables, help screens, and formatted messages.

```typescript
@property(cc.RichText) helpText: cc.RichText = null;
```

Supported tags:

- `<color=#FF0000>red text</color>`: text color
- `<size=30>big text</size>`: font size
- `<b>bold</b>`, `<i>italic</i>`, `<u>underline</u>`: basic formatting
- `<img src='textureName'/>`: inline image from ImageAtlas
- `<br/>`: line break
- `<outline color=#000000 width=2>outlined</outline>`: text outline

Key properties:

- `string`: the rich text markup string
- `font`: custom `cc.Font` (null for system font)
- `fontSize`: base font size
- `maxWidth`: max width before wrapping (0 for no limit)
- `lineHeight`: line spacing
- `imageAtlas`: `cc.SpriteAtlas` for `<img>` tags
- `handleTouchEvent`: enable click handling on text

Example:

```typescript
this.helpText.string = '<color=#FFD700><size=28>Wild Symbol</size></color>\n<size=22>Substitutes for all symbols except <img src="scatter"/>Scatter.</size>';
```
