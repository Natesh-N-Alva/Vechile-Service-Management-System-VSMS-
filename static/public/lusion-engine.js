window.addEventListener("DOMContentLoaded", () => {
  // 1. INJECT FULL-SCREEN LUSION 3D CANVAS
  const canvas = document.createElement("canvas");
  canvas.id = "lusion-webgl-bg";
  document.body.prepend(canvas);

  // 2. LIQUID GLASS CURSOR REFRACTION & 3D CARD TILT
  const attachGlassPhysics = () => {
    const targets = document.querySelectorAll('[class*="card"], [class*="Card"]');
    targets.forEach((el) => {
      if (el.dataset.glassBound) return;
      el.dataset.glassBound = "true";

      el.addEventListener("mousemove", (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        el.style.setProperty("--gx", `${x}px`);
        el.style.setProperty("--gy", `${y}px`);

        const rx = ((y / rect.height) - 0.5) * -4.5;
        const ry = ((x / rect.width) - 0.5) * 4.5;
        el.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
      });

      el.addEventListener("mouseleave", () => {
        el.style.transform = "";
      });
    });
  };

  attachGlassPhysics();
  // Re-bind when switching tabs (Dashboard -> My Vehicles -> Analytics)
  const observer = new MutationObserver(attachGlassPhysics);
  observer.observe(document.body, { childList: true, subtree: true });

  // 3. THREE.JS LUSION + TRACKOBIT 3D HOLOGRAPHIC SCENE
  if (typeof THREE === "undefined") return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(3.2, 1.9, 5.2);
  camera.lookAt(0, 0.2, 0);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Trackobit Cyan Holographic Wireframe Vehicle
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0x00e5ff,
    wireframe: true,
    transparent: true,
    opacity: 0.32
  });

  const vehicleGroup = new THREE.Group();
  vehicleGroup.position.set(1.6, -0.35, -0.6);

  const body = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.52, 1.3, 14, 3, 6), wireMat);
  body.position.y = 0.45;

  const cabin = new THREE.Mesh(new THREE.CylinderGeometry(0.66, 0.94, 1.5, 8, 2), wireMat);
  cabin.rotation.z = Math.PI / 2;
  cabin.scale.set(0.65, 1, 0.85);
  cabin.position.set(-0.1, 0.92, 0);

  vehicleGroup.add(body, cabin);

  const wheelGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.24, 18, 2);
  wheelGeo.rotateX(Math.PI / 2);
  [
    [-0.92, 0.34, 0.68],
    [0.92, 0.34, 0.68],
    [-0.92, 0.34, -0.68],
    [0.92, 0.34, -0.68]
  ].forEach(([x, y, z]) => {
    const wheel = new THREE.Mesh(wheelGeo, wireMat);
    wheel.position.set(x, y, z);
    vehicleGroup.add(wheel);
  });

  // Lusion Liquid-Glass Sculpted Torus Knot Floating in Background
  const knotGeo = new THREE.TorusKnotGeometry(1.15, 0.32, 140, 24);
  const knotMat = new THREE.MeshPhysicalMaterial({
    color: 0x00e5ff,
    metalness: 0.15,
    roughness: 0.1,
    transmission: 0.85,
    transparent: true,
    opacity: 0.22,
    wireframe: false
  });
  const liquidSculpture = new THREE.Mesh(knotGeo, knotMat);
  liquidSculpture.position.set(-2.4, 0.8, -2.5);

  const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
  const pointLight = new THREE.PointLight(0x00e5ff, 3, 15);
  pointLight.position.set(2, 4, 3);
  scene.add(ambientLight, pointLight);

  // Trackobit Amber & Cyan Circuit-Board Particle Field
  const count = 650;
  const pos = new Float32Array(count * 3);
  const cols = new Float32Array(count * 3);
  const amber = new THREE.Color(0xffaa00);
  const cyan = new THREE.Color(0x00e5ff);

  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 14;
    pos[i * 3 + 1] = -0.35 + (Math.random() - 0.5) * 0.15;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 14;
    const c = Math.random() > 0.35 ? amber : cyan;
    cols[i * 3] = c.r;
    cols[i * 3 + 1] = c.g;
    cols[i * 3 + 2] = c.b;
  }

  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  pGeo.setAttribute("color", new THREE.BufferAttribute(cols, 3));
  const circuitParticles = new THREE.Points(
    pGeo,
    new THREE.PointsMaterial({ size: 0.055, vertexColors: true, transparent: true, opacity: 0.7 })
  );

  scene.add(vehicleGroup, liquidSculpture, circuitParticles);

  // Smooth Lusion Mouse Inertia
  let mouseX = 0;
  let mouseY = 0;
  window.addEventListener("mousemove", (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = (e.clientY / window.innerHeight) * 2 - 1;
  });

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    // Smooth camera & vehicle parallax
    vehicleGroup.rotation.y += (-0.55 + mouseX * 0.55 - vehicleGroup.rotation.y) * 0.04;
    vehicleGroup.rotation.x += (mouseY * 0.12 - vehicleGroup.rotation.x) * 0.04;
    vehicleGroup.position.y = -0.35 + Math.sin(t * 1.4) * 0.05;

    // Lusion liquid sculpture organic rotation
    liquidSculpture.rotation.x = t * 0.25 + mouseY * 0.3;
    liquidSculpture.rotation.y = t * 0.35 + mouseX * 0.3;

    circuitParticles.rotation.y = t * 0.04;
    renderer.render(scene, camera);
  }
  animate();
});