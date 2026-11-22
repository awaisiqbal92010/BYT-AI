---
name: canvas-webgl-shader-effects
description: GLSL fragment shaders, interactive particle meshes, noise fields, and GPU-accelerated canvas backdrops.
---

# Canvas & WebGL Shaders

## Performance Rules
1. **Fixed Timestep**: Decouple simulation physics from display refresh rate using delta time caps.
2. **Device Pixel Ratio Cap**: Clamp `Math.min(window.devicePixelRatio, 2)` to avoid GPU memory saturation on 4K.
3. **Intersection Observer**: Pause `requestAnimationFrame` loop when the canvas is scrolled out of viewport.
4. **Context Loss Recovery**: Listen for `webglcontextlost` and re-upload textures upon `webglcontextrestored`.

