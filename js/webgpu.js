// WebGPU particle background — compute shader physics + render pass
// Falls back to WebGL if WebGPU is unavailable.

const NUM_PARTICLES = 512;

export async function initBackground() {
  const canvas = document.getElementById('gpu-canvas');
  const badge  = document.getElementById('gpu-badge');
  const label  = document.getElementById('gpu-label');

  if (!navigator.gpu) {
    initWebGLFallback(canvas);
    return;
  }

  try {
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) throw new Error('No WebGPU adapter');
    const device = await adapter.requestDevice();
    const ctx    = canvas.getContext('webgpu');
    const fmt    = navigator.gpu.getPreferredCanvasFormat();

    const resize = () => {
      canvas.width  = canvas.clientWidth  * devicePixelRatio;
      canvas.height = canvas.clientHeight * devicePixelRatio;
      ctx.configure({ device, format: fmt, alphaMode: 'premultiplied' });
    };
    resize();
    new ResizeObserver(resize).observe(canvas);

    if (badge && label) {
      badge.classList.add('active');
      label.textContent = 'WebGPU active';
    }

    // Particle buffer: x, y, vx, vy (all f32)
    const STRIDE = 4;
    const init = new Float32Array(NUM_PARTICLES * STRIDE);
    for (let i = 0; i < NUM_PARTICLES; i++) {
      init[i * STRIDE + 0] = Math.random() * 2 - 1;
      init[i * STRIDE + 1] = Math.random() * 2 - 1;
      init[i * STRIDE + 2] = (Math.random() - 0.5) * 0.003;
      init[i * STRIDE + 3] = (Math.random() - 0.5) * 0.003;
    }

    const buf = device.createBuffer({
      size: init.byteLength,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(buf, 0, init);

    const uniformBuf = device.createBuffer({
      size: 8,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    const computeModule = device.createShaderModule({ code: `
      struct Particle { x:f32, y:f32, vx:f32, vy:f32 }
      struct Uniforms { aspect:f32, t:f32 }
      @group(0) @binding(0) var<storage, read_write> particles: array<Particle>;
      @group(0) @binding(1) var<uniform> u: Uniforms;

      @compute @workgroup_size(64)
      fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
        let i = gid.x;
        if (i >= ${NUM_PARTICLES}u) { return; }
        var p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x >  1.05) { p.x = -1.05; }
        if (p.x < -1.05) { p.x =  1.05; }
        if (p.y >  1.05) { p.y = -1.05; }
        if (p.y < -1.05) { p.y =  1.05; }
        particles[i] = p;
      }
    ` });

    const renderModule = device.createShaderModule({ code: `
      struct Particle { x:f32, y:f32, vx:f32, vy:f32 }
      @group(0) @binding(0) var<storage, read> particles: array<Particle>;
      struct VSOut { @builtin(position) pos: vec4<f32>, @location(0) alpha: f32 }

      @vertex fn vs(@builtin(vertex_index) vi: u32) -> VSOut {
        let p = particles[vi];
        let speed = sqrt(p.vx*p.vx + p.vy*p.vy) * 600.0;
        return VSOut(vec4<f32>(p.x, p.y, 0.0, 1.0), clamp(speed, 0.15, 1.0));
      }
      @fragment fn fs(@location(0) alpha: f32) -> @location(0) vec4<f32> {
        return vec4<f32>(0.15, 0.42, 0.92, alpha * 0.5);
      }
    ` });

    const computeBGL = device.createBindGroupLayout({ entries: [
      { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },
      { binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } },
    ]});
    const renderBGL = device.createBindGroupLayout({ entries: [
      { binding: 0, visibility: GPUShaderStage.VERTEX, buffer: { type: 'read-only-storage' } },
    ]});

    const computePipeline = device.createComputePipeline({
      layout: device.createPipelineLayout({ bindGroupLayouts: [computeBGL] }),
      compute: { module: computeModule, entryPoint: 'main' },
    });
    const renderPipeline = device.createRenderPipeline({
      layout: device.createPipelineLayout({ bindGroupLayouts: [renderBGL] }),
      vertex:   { module: renderModule, entryPoint: 'vs' },
      fragment: {
        module: renderModule, entryPoint: 'fs',
        targets: [{ format: fmt, blend: {
          color: { srcFactor: 'src-alpha', dstFactor: 'one-minus-src-alpha' },
          alpha: { srcFactor: 'one',       dstFactor: 'one-minus-src-alpha' },
        }}],
      },
      primitive: { topology: 'point-list' },
    });

    const computeBG = device.createBindGroup({ layout: computeBGL, entries: [
      { binding: 0, resource: { buffer: buf } },
      { binding: 1, resource: { buffer: uniformBuf } },
    ]});
    const renderBG = device.createBindGroup({ layout: renderBGL, entries: [
      { binding: 0, resource: { buffer: buf } },
    ]});

    let t = 0;
    const frame = () => {
      t++;
      device.queue.writeBuffer(uniformBuf, 0,
        new Float32Array([canvas.width / canvas.height, t * 0.01]));

      const cmd = device.createCommandEncoder();
      const cp  = cmd.beginComputePass();
      cp.setPipeline(computePipeline);
      cp.setBindGroup(0, computeBG);
      cp.dispatchWorkgroups(Math.ceil(NUM_PARTICLES / 64));
      cp.end();

      const rp = cmd.beginRenderPass({
        colorAttachments: [{
          view: ctx.getCurrentTexture().createView(),
          clearValue: { r: 0, g: 0, b: 0, a: 0 },
          loadOp: 'clear', storeOp: 'store',
        }],
      });
      rp.setPipeline(renderPipeline);
      rp.setBindGroup(0, renderBG);
      rp.draw(NUM_PARTICLES);
      rp.end();

      device.queue.submit([cmd.finish()]);
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);

  } catch (e) {
    console.warn('WebGPU failed:', e);
    if (label) label.textContent = 'WebGL fallback';
    initWebGLFallback(canvas);
  }
}

function initWebGLFallback(canvas) {
  const gl = canvas.getContext('webgl');
  if (!gl) return;

  const resize = () => {
    canvas.width  = canvas.clientWidth  * devicePixelRatio;
    canvas.height = canvas.clientHeight * devicePixelRatio;
  };
  resize();
  new ResizeObserver(resize).observe(canvas);

  const N = 300;
  const pos = new Float32Array(N * 2);
  const vel = new Float32Array(N * 2);
  for (let i = 0; i < N; i++) {
    pos[i*2]   = Math.random()*2-1; pos[i*2+1] = Math.random()*2-1;
    vel[i*2]   = (Math.random()-0.5)*0.003;
    vel[i*2+1] = (Math.random()-0.5)*0.003;
  }

  const vsSrc = `attribute vec2 p; void main(){gl_Position=vec4(p,0,1);gl_PointSize=2.0;}`;
  const fsSrc = `precision mediump float; void main(){gl_FragColor=vec4(0.15,0.42,0.92,0.45);}`;

  const prog = gl.createProgram();
  [vsSrc, fsSrc].forEach((src, i) => {
    const sh = gl.createShader(i === 0 ? gl.VERTEX_SHADER : gl.FRAGMENT_SHADER);
    gl.shaderSource(sh, src); gl.compileShader(sh); gl.attachShader(prog, sh);
  });
  gl.linkProgram(prog); gl.useProgram(prog);

  const vbuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbuf);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const frame = () => {
    for (let i = 0; i < N; i++) {
      pos[i*2]   += vel[i*2];   pos[i*2+1] += vel[i*2+1];
      if (pos[i*2]   >  1.05) pos[i*2]   = -1.05;
      if (pos[i*2]   < -1.05) pos[i*2]   =  1.05;
      if (pos[i*2+1] >  1.05) pos[i*2+1] = -1.05;
      if (pos[i*2+1] < -1.05) pos[i*2+1] =  1.05;
    }
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0,0,0,0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.bufferData(gl.ARRAY_BUFFER, pos, gl.DYNAMIC_DRAW);
    gl.drawArrays(gl.POINTS, 0, N);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
