// 3D-сцена в первом экране: металлическое колесо коляски вращается и реагирует на мышь.
import {
  WebGLRenderer, Scene, PerspectiveCamera, Group, Mesh, TorusGeometry, CylinderGeometry,
  MeshStandardMaterial, MeshPhysicalMaterial, PMREMGenerator, Color, AmbientLight, DirectionalLight,
  BufferGeometry, Float32BufferAttribute, Points, PointsMaterial, AdditiveBlending, Vector3, Quaternion,
} from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export const mountWheel = (canvas: HTMLCanvasElement) => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  const camera = new PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 9);

  scene.add(new AmbientLight(0xffffff, 0.4));
  const key = new DirectionalLight(0xffffff, 2.2); key.position.set(4, 5, 6); scene.add(key);
  const rim = new DirectionalLight(0xff6b70, 2.5); rim.position.set(-5, -2, -3); scene.add(rim);
  const blue = new DirectionalLight(0x8fb4ff, 2); blue.position.set(-4, 4, 2); scene.add(blue);

  const chrome = new MeshStandardMaterial({ color: 0xdfe4ee, metalness: 1, roughness: 0.18 });
  const alu = new MeshStandardMaterial({ color: 0xbfc6d4, metalness: 1, roughness: 0.32 });
  const rubber = new MeshPhysicalMaterial({ color: 0x15161b, roughness: 0.6, clearcoat: 0.3, clearcoatRoughness: 0.6 });
  const coral = new MeshStandardMaterial({ color: 0xe5484d, metalness: 0.4, roughness: 0.3 });

  const R = 2.4;
  const wheel = new Group();
  wheel.add(new Mesh(new TorusGeometry(R, 0.2, 32, 160), rubber));
  wheel.add(new Mesh(new TorusGeometry(R - 0.2, 0.07, 20, 160), alu));
  const push = new Mesh(new TorusGeometry(R - 0.05, 0.045, 16, 160), chrome);
  push.position.z = 0.34; wheel.add(push);
  // крепления обода
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const m = new Mesh(new CylinderGeometry(0.03, 0.03, 0.34, 8), chrome);
    m.rotation.x = Math.PI / 2; m.position.set(Math.cos(a) * (R - 0.12), Math.sin(a) * (R - 0.12), 0.17);
    wheel.add(m);
  }
  // ступица
  const hub = new Mesh(new CylinderGeometry(0.28, 0.28, 0.5, 40), chrome);
  hub.rotation.x = Math.PI / 2; wheel.add(hub);
  const cap = new Mesh(new CylinderGeometry(0.16, 0.16, 0.56, 40), coral);
  cap.rotation.x = Math.PI / 2; wheel.add(cap);
  // спицы (перекрёстное плетение, две стороны)
  const spokeGeo = new CylinderGeometry(0.012, 0.012, 1, 6);
  const up = new Vector3(0, 1, 0);
  for (let side = -1; side <= 1; side += 2) {
    for (let i = 0; i < 18; i++) {
      const a0 = (i / 18) * Math.PI * 2 + side * 0.08;
      const a1 = a0 + side * 0.55;
      const start = new Vector3(Math.cos(a0) * 0.26, Math.sin(a0) * 0.26, side * 0.2);
      const end = new Vector3(Math.cos(a1) * (R - 0.24), Math.sin(a1) * (R - 0.24), 0);
      const dir = end.clone().sub(start);
      const s = new Mesh(spokeGeo, chrome);
      s.scale.y = dir.length();
      s.position.copy(start).add(dir.clone().multiplyScalar(0.5));
      s.quaternion.copy(new Quaternion().setFromUnitVectors(up, dir.normalize()));
      wheel.add(s);
    }
  }
  const tiltGroup = new Group();
  tiltGroup.add(wheel);
  tiltGroup.rotation.set(-0.15, -0.55, 0.05);
  scene.add(tiltGroup);

  // частицы-«пыль света»
  const n = 260; const pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { pos[i * 3] = (Math.random() - 0.5) * 14; pos[i * 3 + 1] = (Math.random() - 0.5) * 9; pos[i * 3 + 2] = (Math.random() - 0.5) * 6 - 1; }
  const pg = new BufferGeometry(); pg.setAttribute('position', new Float32BufferAttribute(pos, 3));
  const dust = new Points(pg, new PointsMaterial({ size: 0.035, color: new Color(0xbcd0ff), transparent: true, opacity: 0.7, blending: AdditiveBlending, depthWrite: false }));
  scene.add(dust);

  const resize = () => {
    const { clientWidth: w, clientHeight: h } = canvas;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.position.z = w / h < 0.9 ? 11.5 : 9;
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(canvas);
  resize();

  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  addEventListener('pointermove', (e) => { mouse.tx = e.clientX / innerWidth - 0.5; mouse.ty = e.clientY / innerHeight - 0.5; }, { passive: true });

  let speed = 0.35; let boost = 0;
  canvas.closest('[data-hero]')?.addEventListener('pointerdown', () => { boost = 3; });

  let visible = true;
  new IntersectionObserver(([e]) => { visible = !!e?.isIntersecting; }).observe(canvas);

  let last = performance.now();
  const loop = (t: number) => {
    requestAnimationFrame(loop);
    if (!visible) return;
    const dt = Math.min(0.05, (t - last) / 1000); last = t;
    boost *= 0.96;
    if (!reduce) wheel.rotation.z -= (speed + boost) * dt;
    mouse.x += (mouse.tx - mouse.x) * 0.05; mouse.y += (mouse.ty - mouse.y) * 0.05;
    tiltGroup.rotation.y = -0.55 + mouse.x * 0.6;
    tiltGroup.rotation.x = -0.15 + mouse.y * 0.4;
    dust.rotation.y = t * 0.00003;
    dust.position.x = -mouse.x * 0.5;
    renderer.render(scene, camera);
  };
  requestAnimationFrame(loop);
  canvas.classList.add('is-ready');
};
