// ==============================
// Utility: Scroll-triggered animations
// ==============================
document.addEventListener('DOMContentLoaded', () => {
  const animatedEls = document.querySelectorAll('[data-animate]');

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = el.getAttribute('data-animate-delay') || 0;
          setTimeout(() => {
            el.classList.add('animated');
          }, parseInt(delay, 10));
          observer.unobserve(el);
        }
      });
    },
    {
      threshold: 0.15,
    }
  );

  animatedEls.forEach(el => observer.observe(el));

  // Set current year in footer
  const yearSpan = document.getElementById('year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  // Contact form basic validation (front-end demo only)
  const form = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');

  if (form) {
    form.addEventListener(
      'submit',
      e => {
        e.preventDefault();
        form.classList.add('was-validated');

        if (!form.checkValidity()) {
          if (formStatus) {
            formStatus.textContent = 'Please fill in all required fields.';
            formStatus.style.color = '#f97373';
          }
          return;
        }

        // Simulate successful submission
        if (formStatus) {
          formStatus.textContent =
            'Thank you! We have received your request and will contact you soon.';
          formStatus.style.color = '#4ade80';
        }
        form.reset();
        form.classList.remove('was-validated');
      },
      false
    );
  }

  // Parallax effects
  window.addEventListener('scroll', handleScrollParallax);
  window.addEventListener('mousemove', handleMouseParallax);

  initThreeScene();
});

// ==============================
// Parallax logic
// ==============================
function handleScrollParallax() {
  const parallaxBg = document.querySelector('.parallax-bg');
  const hero = document.querySelector('.hero-section');

  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

  if (parallaxBg) {
    // slower scroll for background
    parallaxBg.style.transform = `translateY(${scrollTop * 0.15}px)`;
  }

  if (hero) {
    const layers = hero.querySelectorAll('.parallax-layer');
    layers.forEach((layer, index) => {
      const speed = index === 0 ? 0.08 : 0.18; // slightly different speeds
      layer.style.transform = `translateY(${scrollTop * speed}px)`;
    });
  }
}

function handleMouseParallax(e) {
  const hero = document.querySelector('.hero-section');
  if (!hero) return;

  const rect = hero.getBoundingClientRect();
  const x = e.clientX - rect.left - rect.width / 2;
  const y = e.clientY - rect.top - rect.height / 2;

  const layers = hero.querySelectorAll('.parallax-layer');

  layers.forEach((layer, index) => {
    const divider = index === 0 ? 60 : 30; // different depth feel
    const translateX = x / divider;
    const translateY = y / divider;
    layer.style.transform = `translate(${translateX}px, ${translateY}px)`;
  });
}

// ==============================
// Three.js 3D Scene (simple IT rack)
// ==============================
let renderer, scene, camera, cubeGroup, animationFrameId;

function initThreeScene() {
  const canvas = document.getElementById('hero3dCanvas');
  if (!canvas) return;

  // Scene & camera
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x020617, 0.02);

  const aspect = canvas.clientWidth / canvas.clientHeight;
  camera = new THREE.PerspectiveCamera(40, aspect, 0.1, 100);
  camera.position.set(0, 1.2, 4);

  // Renderer
  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);

  // Lights
  const ambient = new THREE.AmbientLight(0x88aaff, 0.6);
  scene.add(ambient);

  const dirLight = new THREE.DirectionalLight(0x7b61ff, 1.3);
  dirLight.position.set(3, 4, 2);
  scene.add(dirLight);

  const backLight = new THREE.PointLight(0x29d3ff, 1.8, 15);
  backLight.position.set(-2, 3, -3);
  scene.add(backLight);

  // Simple 3D rack (stack of cubes)
  cubeGroup = new THREE.Group();
  scene.add(cubeGroup);

  const rackMaterial = new THREE.MeshStandardMaterial({
    color: 0x020617,
    metalness: 0.6,
    roughness: 0.25,
    emissive: 0x0b1120,
  });

  const accentMaterial = new THREE.MeshStandardMaterial({
    color: 0x29d3ff,
    emissive: 0x1d4ed8,
    emissiveIntensity: 0.9,
  });

  // Main tower
  const towerGeom = new THREE.BoxGeometry(1.2, 2.4, 1);
  const tower = new THREE.Mesh(towerGeom, rackMaterial);
  tower.position.y = 1.2;
  cubeGroup.add(tower);

  // LED strips
  const ledGeom = new THREE.BoxGeometry(1, 0.03, 0.1);
  for (let i = 0; i < 6; i++) {
    const led = new THREE.Mesh(ledGeom, accentMaterial);
    led.position.set(0, 0.4 + i * 0.3, 0.51);
    cubeGroup.add(led);
  }

  // Floating cubes to indicate microservices
  const floatingGeom = new THREE.BoxGeometry(0.35, 0.35, 0.35);
  const floatColors = [0x7b61ff, 0x29d3ff, 0x22c55e];
  for (let i = 0; i < 4; i++) {
    const m = new THREE.MeshStandardMaterial({
      color: floatColors[i % floatColors.length],
      metalness: 0.4,
      roughness: 0.2,
      emissive: floatColors[i % floatColors.length],
      emissiveIntensity: 0.6,
    });
    const cube = new THREE.Mesh(floatingGeom, m);
    cube.position.set(
      Math.sin(i * 1.2) * 1.8,
      1.4 + (i % 2) * 0.6,
      Math.cos(i * 1.2) * 1.2
    );
    cube.userData.offset = i * 0.8;
    cubeGroup.add(cube);
  }

  // Subtle grid floor
  const gridHelper = new THREE.GridHelper(10, 20, 0x1e293b, 0x0f172a);
  gridHelper.position.y = 0;
  scene.add(gridHelper);

  // Resize handling
  window.addEventListener('resize', () => onResize(canvas));

  // Orbit-like rotation by dragging
  let isDragging = false;
  let prevX = 0;
  let rotationTarget = 0;

  canvas.addEventListener('mousedown', e => {
    isDragging = true;
    prevX = e.clientX;
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  window.addEventListener('mousemove', e => {
    if (!isDragging) return;
    const deltaX = e.clientX - prevX;
    prevX = e.clientX;
    rotationTarget += deltaX * 0.005;
  });

  canvas.addEventListener(
    'touchstart',
    e => {
      isDragging = true;
      prevX = e.touches[0].clientX;
    },
    { passive: true }
  );

  window.addEventListener(
    'touchend',
    () => {
      isDragging = false;
    },
    { passive: true }
  );

  window.addEventListener(
    'touchmove',
    e => {
      if (!isDragging) return;
      const deltaX = e.touches[0].clientX - prevX;
      prevX = e.touches[0].clientX;
      rotationTarget += deltaX * 0.005;
    },
    { passive: true }
  );

  // Scroll zoom
  canvas.addEventListener(
    'wheel',
    e => {
      e.preventDefault();
      camera.position.z += e.deltaY * 0.002;
      camera.position.z = Math.max(2.5, Math.min(7, camera.position.z));
    },
    { passive: false }
  );

  // Animation loop
  let clock = new THREE.Clock();

  function animate() {
    const t = clock.getElapsedTime();

    // Smooth rotation
    cubeGroup.rotation.y += (rotationTarget - cubeGroup.rotation.y) * 0.06;
    cubeGroup.rotation.x = 0.18 + Math.sin(t * 0.3) * 0.03;

    // Floating cubes wobble
    cubeGroup.children.forEach(child => {
      if (child.geometry && child.geometry.parameters && child.geometry.parameters.height === 0.35) {
        // floating cubes only
        const offset = child.userData.offset || 0;
        child.position.y = 1.4 + Math.sin(t * 1.2 + offset) * 0.25;
      }
    });

    renderer.render(scene, camera);
    animationFrameId = requestAnimationFrame(animate);
  }

  animate();
}

function onResize(canvas) {
  if (!renderer || !camera || !canvas) return;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight || canvas.getBoundingClientRect().height;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

// Cleanup if needed (single-page demo; no routing here)
window.addEventListener('beforeunload', () => {
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  if (renderer) renderer.dispose();
});
