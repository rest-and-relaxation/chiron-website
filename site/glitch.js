(() => {
  const figure = document.querySelector('.hero-image');
  const image = figure?.querySelector('img');
  const layers = [...(figure?.querySelectorAll('.hero-layer') || [])];
  const composite = document.createElement('canvas');
  const compositor = composite.getContext('2d');
  const canvas = figure?.querySelector('.hero-glitch');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!figure || !image || !canvas || reducedMotion.matches) return;

  const gl = canvas.getContext('webgl', {
    alpha: false,
    antialias: false,
    depth: false,
    powerPreference: 'low-power',
  });
  if (!gl) return;

  const vertexSource = `
    attribute vec2 a_position;
    varying vec2 v_uv;
    void main() {
      v_uv = (a_position + 1.0) * 0.5;
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;
  const fragmentSource = `
    precision mediump float;
    uniform sampler2D u_image;
    uniform vec2 u_resolution;
    uniform vec2 u_image_size;
    uniform float u_time;
    varying vec2 v_uv;

    float hash(float value) {
      return fract(sin(value * 127.1) * 43758.5453);
    }

    void main() {
      float frame = floor(u_time * 20.0);
      float firstBurst = smoothstep(0.35, 0.43, u_time) *
        (1.0 - smoothstep(0.78, 0.92, u_time));
      float secondBurst = smoothstep(3.52, 3.60, u_time) *
        (1.0 - smoothstep(3.96, 4.12, u_time));
      float burst = max(firstBurst, secondBurst);

      vec2 uv = v_uv;
      float viewportAspect = u_resolution.x / u_resolution.y;
      float imageAspect = u_image_size.x / u_image_size.y;
      if (viewportAspect > imageAspect) {
        uv.y = 0.5 + (uv.y - 0.5) * imageAspect / viewportAspect;
      } else {
        uv.x = 0.5 + (uv.x - 0.5) * viewportAspect / imageAspect;
      }

      float strip = floor(v_uv.y * 115.0);
      float jump = step(0.72, hash(strip + frame * 5.0));
      float horizontalShift = (hash(strip * 3.0 + frame) - 0.5) *
        0.055 * jump * burst;
      uv.x += horizontalShift;

      float channelShift = 0.012 * jump * burst;
      vec3 colour = vec3(
        texture2D(u_image, uv + vec2(channelShift, 0.0)).r,
        texture2D(u_image, uv).g,
        texture2D(u_image, uv - vec2(channelShift, 0.0)).b
      );
      float scan = sin(v_uv.y * u_resolution.y * 1.65) * 0.025 * burst;
      colour += scan;
      gl_FragColor = vec4(colour, 1.0);
    }
  `;

  function compile(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  const vertex = compile(gl.VERTEX_SHADER, vertexSource);
  const fragment = compile(gl.FRAGMENT_SHADER, fragmentSource);
  if (!vertex || !fragment) return;
  const program = gl.createProgram();
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
  gl.useProgram(program);

  const vertices = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertices);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1, -1, 1, -1, -1, 1,
    -1, 1, 1, -1, 1, 1,
  ]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'a_position');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  const texture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  const resolution = gl.getUniformLocation(program, 'u_resolution');
  const imageSize = gl.getUniformLocation(program, 'u_image_size');
  const time = gl.getUniformLocation(program, 'u_time');
  gl.uniform1i(gl.getUniformLocation(program, 'u_image'), 0);

  let ready = false;
  let visible = false;
  let frameId = 0;
  let previousFrame = 0;
  const startTime = performance.now();

  function resize() {
    const bounds = figure.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    const width = Math.max(1, Math.round(bounds.width * ratio));
    const height = Math.max(1, Math.round(bounds.height * ratio));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
      gl.uniform2f(resolution, width, height);
    }
  }

  function draw(now) {
    frameId = 0;
    if (!ready || !visible || document.hidden || reducedMotion.matches) return;
    if (now - previousFrame >= 30) {
      previousFrame = now;
      resize();
      const elapsed = ((now - startTime) / 1000) % 7;
      const inBurst = (elapsed >= .35 && elapsed <= .92) || (elapsed >= 3.52 && elapsed <= 4.12);
      canvas.classList.toggle('is-ready', inBurst);
      if (inBurst) {
        if (layers.length) loadComposite();
        gl.uniform1f(time, elapsed);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }
    }
    frameId = requestAnimationFrame(draw);
  }

  function schedule() {
    if (ready && visible && !document.hidden && !reducedMotion.matches && !frameId) {
      frameId = requestAnimationFrame(draw);
    }
  }

  // Composite the current CSS crop and GSAP layer positions only during bursts.
  // The shader then distorts the same view rather than covering the parallax.
  function loadComposite() {
    const bounds = figure.getBoundingClientRect();
    composite.width = canvas.width;
    composite.height = canvas.height;
    const ratio = canvas.width / bounds.width;
    compositor.fillStyle = '#b51106';
    compositor.fillRect(0, 0, composite.width, composite.height);
    for (const layer of layers) {
      if (!layer.naturalWidth) continue;
      const rect = layer.getBoundingClientRect();
      const scale = Math.max(rect.width / layer.naturalWidth, rect.height / layer.naturalHeight);
      const width = layer.naturalWidth * scale;
      const height = layer.naturalHeight * scale;
      const position = getComputedStyle(layer).objectPosition.split(' ').map(value => parseFloat(value) / 100);
      compositor.drawImage(layer,
        (rect.left - bounds.left + (rect.width - width) * position[0]) * ratio,
        (rect.top - bounds.top + (rect.height - height) * position[1]) * ratio,
        width * ratio, height * ratio);
    }
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, composite);
    gl.uniform2f(imageSize, composite.width, composite.height);
  }

  function loadTexture() {
    if (!image.naturalWidth) return;
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.uniform2f(imageSize, image.naturalWidth, image.naturalHeight);
    ready = true;
    resize();
    if (layers.length) loadComposite();
    schedule();
  }

  Promise.all((layers.length ? layers : [image]).map(layer => layer.decode().catch(() => {}))).then(loadTexture);

  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    schedule();
  }, { rootMargin: '120px' });
  observer.observe(figure);
  document.addEventListener('visibilitychange', schedule);
  reducedMotion.addEventListener('change', () => {
    canvas.classList.toggle('is-ready', !reducedMotion.matches && ready);
    schedule();
  });
  canvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    ready = false;
    canvas.classList.remove('is-ready');
    observer.disconnect();
  });
})();
