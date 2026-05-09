# Audio, Scene, and Platform

## Contents

- `cc.audioEngine`
- `cc.director`
- `cc.sys`
- `cc.game`
- Network
- `cc.VideoPlayer`

## cc.audioEngine

Engine source: `cocos2d/audio/CCAudioEngine.js`.

`cc.audioEngine` is a static API; do not instantiate it.

### Play audio

```typescript
const audioId: number = cc.audioEngine.play(clip, loop, volume);
```

- `clip`: `cc.AudioClip` loaded from bundle or resources.
- `loop`: `boolean`.
- `volume`: `0` to `1`.

### Common methods

- `cc.audioEngine.stop(audioId)`
- `cc.audioEngine.stopAll()`
- `cc.audioEngine.pause(audioId)` / `resume(audioId)`
- `cc.audioEngine.pauseAll()` / `resumeAll()`
- `cc.audioEngine.setVolume(audioId, volume)`
- `cc.audioEngine.getVolume(audioId)`
- `cc.audioEngine.setCurrentTime(audioId, seconds)`
- `cc.audioEngine.getCurrentTime(audioId)`
- `cc.audioEngine.getDuration(audioId)`
- `cc.audioEngine.getState(audioId)`: returns `cc.audioEngine.AudioState.PLAYING`, `PAUSED`, or `STOPPED`
- `cc.audioEngine.setFinishCallback(audioId, callback)`
- `cc.audioEngine.setMaxAudioInstance(maxCount)`: default is 24 on web

### Load and play pattern

```typescript
@property(cc.AudioClip) winSfx: cc.AudioClip = null;

playWin(): void {
    cc.audioEngine.play(this.winSfx, false, 1.0);
}
```

For dynamic loading:

```typescript
bundle.load('audio/win', cc.AudioClip, (err: Error, clip: cc.AudioClip) => {
    if (err) {
        cc.error('[AudioMgr] load win:', err);
        return;
    }
    cc.audioEngine.play(clip, false, 1.0);
});
```

### Music vs SFX pattern

Use `cc.audioEngine.setMusic` conceptually — there is no built-in `playMusic` in 2.4.x `cc.audioEngine`. Manage a single music `audioId` manually:

```typescript
private _musicId: number = -1;

playMusic(clip: cc.AudioClip): void {
    if (this._musicId >= 0) {
        cc.audioEngine.stop(this._musicId);
    }
    this._musicId = cc.audioEngine.play(clip, true, 0.5);
}

stopMusic(): void {
    if (this._musicId >= 0) {
        cc.audioEngine.stop(this._musicId);
        this._musicId = -1;
    }
}
```

## cc.director

Engine source: `cocos2d/core/CCDirector.js`.

`cc.director` is the singleton game director. Important methods:

- `cc.director.loadScene(sceneName, onLaunched?)`: load and switch to a scene.
- `cc.director.preloadScene(sceneName, onProgress?, onLoaded?)`: preload a scene without switching.
- `cc.director.getScene()`: returns the current running `cc.Scene`.
- `cc.director.isPaused()`, `cc.director.pause()`, `cc.director.resume()`.

### Persist root node

`cc.game.addPersistRootNode(node)` marks a root node as persistent across scene loads. The node must be a root-level child of the scene, not nested. Use this for managers, audio controllers, and other cross-scene singletons.

```typescript
onLoad(): void {
    cc.game.addPersistRootNode(this.node);
}
```

Remove persistence:

```typescript
cc.game.removePersistRootNode(node);
```

## cc.sys

Engine source: `cocos2d/core/platform/CCSys.js`.

Platform detection and capabilities:

- `cc.sys.isBrowser`: `true` on web builds
- `cc.sys.isNative`: `true` on JSB/native builds
- `cc.sys.isMobile`: `true` on mobile platforms
- `cc.sys.platform`: `cc.sys.DESKTOP_BROWSER`, `cc.sys.MOBILE_BROWSER`, `cc.sys.WECHAT_GAME`, etc.
- `cc.sys.os`: `cc.sys.OS_IOS`, `cc.sys.OS_ANDROID`, `cc.sys.OS_WINDOWS`, etc.
- `cc.sys.language`: user language code
- `cc.sys.browserType`: `cc.sys.BROWSER_TYPE_CHROME`, `cc.sys.BROWSER_TYPE_SAFARI`, etc.
- `cc.sys.localStorage`: wrapper around `localStorage` with `getItem`, `setItem`, `removeItem`

### Safe local storage

```typescript
cc.sys.localStorage.setItem('lastBet', JSON.stringify(betData));
const raw: string = cc.sys.localStorage.getItem('lastBet');
if (raw) {
    const data = JSON.parse(raw);
}
```

## cc.game

Engine source: `cocos2d/core/CCGame.js`.

- `cc.game.setFrameRate(fps)`: set target frame rate.
- `cc.game.getFrameRate()`: current target frame rate.
- `cc.game.on(cc.game.EVENT_SHOW, callback)`: app resumed from background.
- `cc.game.on(cc.game.EVENT_HIDE, callback)`: app went to background.

These events are important for pausing audio, reconnecting sockets, and saving state.

## Network

Cocos 2.4.x does not wrap `XMLHttpRequest` or `fetch`. Use the standard browser APIs:

```typescript
const xhr: XMLHttpRequest = new XMLHttpRequest();
xhr.open('POST', url, true);
xhr.setRequestHeader('Content-Type', 'application/json');
xhr.onreadystatechange = () => {
    if (xhr.readyState === 4) {
        if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            // handle data
        } else {
            cc.error('[Network] request failed:', xhr.status);
        }
    }
};
xhr.send(JSON.stringify(payload));
```

For WebSocket:

```typescript
const ws: WebSocket = new WebSocket(url);
ws.onopen = () => { /* connected */ };
ws.onmessage = (event) => { /* handle event.data */ };
ws.onerror = (error) => { cc.error('[WS] error:', error); };
ws.onclose = () => { /* cleanup */ };
```

## cc.VideoPlayer

Engine source: `cocos2d/videoplayer/CCVideoPlayer.js`.

`cc.VideoPlayer` plays video on a node. Used for game intros, promotional clips, or tutorial videos.

Bind with:

```typescript
@property(cc.VideoPlayer) introVideo: cc.VideoPlayer = null;
```

Key properties:

- `resourceType`: `cc.VideoPlayer.ResourceType.REMOTE` or `LOCAL`
- `remoteURL`: URL string for remote videos
- `clip`: `cc.VideoClip` for local videos
- `currentTime`: current playback position in seconds
- `volume`: `0` to `1`
- `mute`: `boolean`
- `keepAspectRatio`: maintain aspect ratio
- `isFullscreen`: fullscreen mode
- `stayOnBottom`: keep video below UI on web (default `true`)

Playback methods:

- `play()`, `pause()`, `resume()`, `stop()`

Events:

```typescript
this.introVideo.node.on('ready-to-play', this.onVideoReady, this);
this.introVideo.node.on('completed', this.onVideoComplete, this);
this.introVideo.node.on('error', this.onVideoError, this);
```

Platform note: On web, `cc.VideoPlayer` uses an HTML `<video>` element overlaid on the canvas. Touch event passthrough and z-order may behave differently from native builds. Use `stayOnBottom = false` with caution.
