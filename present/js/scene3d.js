/**
 * Lightweight Three.js constellation for KasbYar present hero.
 * No GLB — procedural nodes only for fast load.
 */
(function () {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas || !window.THREE) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent) || window.innerWidth < 768;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !isMobile,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1 : 1.75));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 0.15, 6.2);

  const group = new THREE.Group();
  scene.add(group);

  const nodeCount = isMobile ? 42 : 72;
  const positions = new Float32Array(nodeCount * 3);
  const colors = new Float32Array(nodeCount * 3);
  const palette = [
    new THREE.Color('#8FB89E'),
    new THREE.Color('#F2B8B8'),
    new THREE.Color('#F5C9A8'),
    new THREE.Color('#FFFBF8'),
  ];

  for (let i = 0; i < nodeCount; i += 1) {
    const r = 1.4 + Math.random() * 2.4;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.72;
    positions[i * 3 + 2] = r * Math.cos(phi);
    const c = palette[i % palette.length];
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }

  const pointsGeo = new THREE.BufferGeometry();
  pointsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  pointsGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const pointsMat = new THREE.PointsMaterial({
    size: isMobile ? 0.045 : 0.055,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
    sizeAttenuation: true,
  });
  group.add(new THREE.Points(pointsGeo, pointsMat));

  const linePositions = [];
  const maxDist = 1.55;
  for (let i = 0; i < nodeCount; i += 1) {
    for (let j = i + 1; j < nodeCount; j += 1) {
      const dx = positions[i * 3] - positions[j * 3];
      const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
      const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
      const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (d < maxDist) {
        linePositions.push(
          positions[i * 3],
          positions[i * 3 + 1],
          positions[i * 3 + 2],
          positions[j * 3],
          positions[j * 3 + 1],
          positions[j * 3 + 2],
        );
      }
    }
  }

  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
  const lineMat = new THREE.LineBasicMaterial({
    color: 0x8fb89e,
    transparent: true,
    opacity: 0.22,
  });
  group.add(new THREE.LineSegments(lineGeo, lineMat));

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(2.35, 0.01, 8, 120),
    new THREE.MeshBasicMaterial({ color: 0xf2b8b8, transparent: true, opacity: 0.35 }),
  );
  ring.rotation.x = Math.PI / 2.4;
  group.add(ring);

  let width = 0;
  let height = 0;
  let visible = true;
  let raf = 0;
  const clock = new THREE.Clock();
  const pointer = { x: 0, y: 0 };

  function resize() {
    const parent = canvas.parentElement;
    width = parent.clientWidth;
    height = parent.clientHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / Math.max(height, 1);
    camera.updateProjectionMatrix();
  }

  function frame() {
    raf = 0;
    if (!visible) return;
    const t = clock.getElapsedTime();
    if (!reduceMotion) {
      group.rotation.y = t * 0.08 + pointer.x * 0.25;
      group.rotation.x = Math.sin(t * 0.2) * 0.08 + pointer.y * 0.12;
      ring.rotation.z = t * 0.15;
    }
    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  }

  function start() {
    if (!raf) raf = requestAnimationFrame(frame);
  }

  function stop() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  window.addEventListener(
    'pointermove',
    (e) => {
      pointer.x = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.y = (e.clientY / window.innerHeight - 0.5) * 2;
    },
    { passive: true },
  );

  window.addEventListener('resize', resize, { passive: true });
  resize();

  const io = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    },
    { threshold: 0.05 },
  );
  io.observe(canvas.parentElement);

  if (!reduceMotion) start();
  else {
    renderer.render(scene, camera);
  }
})();
