# Graphics and Mask

## Contents

- `cc.Graphics`
- `cc.Mask`
- Performance notes

## cc.Graphics

Engine source: `cocos2d/core/graphics/graphics.js`.

`cc.Graphics` draws vector shapes directly on a node. Commonly used for slot game win lines, custom borders, and debug overlays.

### Basic setup

```typescript
@property(cc.Graphics) winLineGraphics: cc.Graphics = null;
```

Or create at runtime:

```typescript
const gfxNode: cc.Node = new cc.Node('WinLines');
gfxNode.parent = this.node;
const gfx: cc.Graphics = gfxNode.addComponent(cc.Graphics);
```

### Drawing API

```typescript
gfx.clear();

// Stroke style
gfx.strokeColor = cc.color(255, 215, 0, 200);  // Gold semi-transparent
gfx.lineWidth = 4;
gfx.lineCap = cc.Graphics.LineCap.ROUND;
gfx.lineJoin = cc.Graphics.LineJoin.ROUND;

// Draw a line path
gfx.moveTo(x0, y0);
gfx.lineTo(x1, y1);
gfx.lineTo(x2, y2);
gfx.stroke();

// Fill style
gfx.fillColor = cc.color(255, 0, 0, 100);

// Shapes
gfx.rect(x, y, width, height);
gfx.fill();

gfx.circle(cx, cy, radius);
gfx.fill();

gfx.roundRect(x, y, width, height, cornerRadius);
gfx.stroke();

gfx.ellipse(cx, cy, rx, ry);
gfx.stroke();

// Bezier curves
gfx.moveTo(x0, y0);
gfx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
gfx.quadraticCurveTo(cpx, cpy, endX, endY);
gfx.stroke();

// Arc
gfx.arc(cx, cy, radius, startAngle, endAngle, counterClockwise);
gfx.stroke();
```

### Win line drawing pattern

```typescript
drawWinLine(positions: cc.Vec2[]): void {
    this.winLineGraphics.clear();
    this.winLineGraphics.strokeColor = cc.color(255, 215, 0, 220);
    this.winLineGraphics.lineWidth = 5;
    this.winLineGraphics.lineCap = cc.Graphics.LineCap.ROUND;
    this.winLineGraphics.lineJoin = cc.Graphics.LineJoin.ROUND;

    if (positions.length < 2) {
        return;
    }

    this.winLineGraphics.moveTo(positions[0].x, positions[0].y);
    for (let i = 1; i < positions.length; i++) {
        this.winLineGraphics.lineTo(positions[i].x, positions[i].y);
    }
    this.winLineGraphics.stroke();
}

clearWinLines(): void {
    this.winLineGraphics.clear();
}
```

### Available methods

- `moveTo(x, y)`, `lineTo(x, y)`, `close()`: path construction
- `stroke()`, `fill()`: rendering
- `clear()`: erase all drawn content
- `rect(x, y, w, h)`, `roundRect(x, y, w, h, r)`: rectangles
- `circle(cx, cy, r)`, `ellipse(cx, cy, rx, ry)`: circles/ellipses
- `arc(cx, cy, r, startAngle, endAngle, counterclockwise?)`: arcs
- `bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y)`: cubic bezier
- `quadraticCurveTo(cpx, cpy, x, y)`: quadratic bezier

### Properties

- `lineWidth`: stroke width in pixels
- `lineJoin`: `cc.Graphics.LineJoin.BEVEL`, `ROUND`, `MITER`
- `lineCap`: `cc.Graphics.LineCap.BUTT`, `ROUND`, `SQUARE`
- `strokeColor`: `cc.Color`
- `fillColor`: `cc.Color`
- `miterLimit`: limit for miter joins

## cc.Mask

Engine source: `cocos2d/core/components/CCMask.js`.

`cc.Mask` clips child nodes to a shape. Used for reel symbol masking, circular avatars, and reveal effects.

### Mask types

- `cc.Mask.Type.RECT`: rectangular clip region (uses node's bounding box)
- `cc.Mask.Type.ELLIPSE`: elliptical clip region
- `cc.Mask.Type.IMAGE_STENCIL`: clip using a sprite image as stencil

### Setup in code

```typescript
@property(cc.Mask) reelMask: cc.Mask = null;
```

Or create at runtime:

```typescript
const mask: cc.Mask = reelNode.addComponent(cc.Mask);
mask.type = cc.Mask.Type.RECT;
```

### Properties

- `type`: `RECT`, `ELLIPSE`, or `IMAGE_STENCIL`
- `inverted`: when `true`, clips the inverse region (show outside, hide inside)
- `spriteFrame`: the stencil image (only for `IMAGE_STENCIL` type)
- `alphaThreshold`: alpha cutoff for stencil (0 to 1, only for `IMAGE_STENCIL`)
- `segements`: number of segments for ellipse (default 64)

### Reel masking pattern

Clip symbols to the visible reel area so symbols scrolling outside are hidden:

```typescript
// Reel container node with Mask component
// Children (symbol nodes) that move outside the mask bounds are clipped
const maskComp: cc.Mask = this.reelContainer.addComponent(cc.Mask);
maskComp.type = cc.Mask.Type.RECT;

// The mask size follows the node's content size
this.reelContainer.setContentSize(REEL_WIDTH, VISIBLE_HEIGHT);
```

### Inverted mask for reveal effects

```typescript
mask.inverted = true;  // Everything inside the mask shape is hidden
```

### Image stencil for custom shapes

```typescript
mask.type = cc.Mask.Type.IMAGE_STENCIL;
mask.spriteFrame = this.stencilSpriteFrame;
mask.alphaThreshold = 0.1;
```

## Performance notes

- `cc.Graphics` redraws on every `stroke()` / `fill()` call. For animated win lines, call `clear()` then redraw each frame or on each animation step, not continuously in `update()`.
- `cc.Mask` uses stencil buffer. Nested masks may have GPU stencil depth limits. Avoid deeply nested masks on low-end mobile devices.
- For static win line displays, draw once and reuse. For animated/sequential win line reveals, use `cc.tween` to control timing and only redraw on transitions.
