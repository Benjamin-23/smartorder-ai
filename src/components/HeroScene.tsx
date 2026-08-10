import { useEffect, useRef } from "react";
import * as THREE from "three";

/* -------------------------------------------------------------------------- */
/*  Floating 3D Hero Scene — vanilla Three.js                                */
/*  Composites transparently over the CSS gradient background.               */
/*  Respects prefers-reduced-motion: falls back to a static frame.           */
/* -------------------------------------------------------------------------- */

/**
 * Floating geometric shapes in the brand palette.
 * The scene uses alpha transparency so the CSS radial gradient behind it
 * shows through — per design-system guideline: layer depth over flat color.
 */
export function HeroScene() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    /* --- Motion preference ------------------------------------------------ */
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    let prefersReduced = mq.matches;
    const onMotionChange = (e: MediaQueryListEvent) => {
      prefersReduced = e.matches;
    };
    mq.addEventListener("change", onMotionChange);

    /* --- Renderer --------------------------------------------------------- */
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      premultipliedAlpha: false,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    /* --- Scene & Camera --------------------------------------------------- */
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / container.clientHeight,
      0.1,
      100,
    );
    camera.position.set(0, 0, 14);
    camera.lookAt(0, 0, 0);

    /* --- Lighting --------------------------------------------------------- */
    scene.add(new THREE.AmbientLight(0x4466aa, 1.6));

    const key = new THREE.PointLight(0x3b82f6, 40, 30);
    key.position.set(5, 3, 6);
    scene.add(key);

    const fill = new THREE.PointLight(0xd97706, 25, 25);
    fill.position.set(-4, -2, 4);
    scene.add(fill);

    const rim = new THREE.PointLight(0x1e40af, 20, 20);
    rim.position.set(0, -4, -3);
    scene.add(rim);

    /* --- Geometries ------------------------------------------------------- */
    const palette = [0x1e40af, 0x3b82f6, 0xd97706, 0x1e3a8a];
    const shapes: {
      mesh: THREE.Mesh;
      rotSpeed: [number, number, number];
      floatAmp: number;
      floatFreq: number;
      floatPhase: number;
      initY: number;
    }[] = [];

    const addShape = (
      geo: THREE.BufferGeometry,
      color: number,
      pos: [number, number, number],
      wireframe = false,
      opacity = 1,
    ) => {
      const mat = wireframe
        ? new THREE.MeshBasicMaterial({
            color,
            wireframe: true,
            transparent: true,
            opacity: opacity * 0.55,
          })
        : new THREE.MeshStandardMaterial({
            color,
            roughness: 0.35,
            metalness: 0.15,
            transparent: true,
            opacity,
          });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(...pos);
      scene.add(mesh);
      shapes.push({
        mesh,
        rotSpeed: [
          (Math.random() - 0.5) * 0.4,
          (Math.random() - 0.5) * 0.4,
          (Math.random() - 0.5) * 0.2,
        ],
        floatAmp: 0.3 + Math.random() * 0.8,
        floatFreq: 0.4 + Math.random() * 0.6,
        floatPhase: Math.random() * Math.PI * 2,
        initY: pos[1],
      });
    };

    // Large central icosahedron (solid, translucent blue)
    addShape(
      new THREE.IcosahedronGeometry(1.6, 1),
      palette[1],
      [0, 0.2, -1],
      false,
      0.35,
    );
    // Wireframe counterpart
    addShape(
      new THREE.IcosahedronGeometry(1.7, 1),
      palette[1],
      [0, 0.2, -1],
      true,
      0.18,
    );

    // Torus knot (accent amber)
    addShape(
      new THREE.TorusKnotGeometry(0.7, 0.18, 80, 12),
      palette[2],
      [3.2, 1.4, -2],
      false,
      0.5,
    );
    addShape(
      new THREE.TorusKnotGeometry(0.75, 0.12, 64, 10),
      palette[2],
      [-3.4, -0.8, -2.5],
      true,
      0.22,
    );

    // Octahedron
    addShape(
      new THREE.OctahedronGeometry(0.55, 0),
      palette[0],
      [-2.8, 1.8, -1.5],
      false,
      0.5,
    );
    addShape(
      new THREE.OctahedronGeometry(0.65, 0),
      palette[0],
      [3.0, -1.2, -1],
      true,
      0.2,
    );

    // Small dodecahedrons scattered
    addShape(
      new THREE.DodecahedronGeometry(0.35, 0),
      palette[3],
      [1.8, -1.6, -0.5],
      false,
      0.45,
    );
    addShape(
      new THREE.DodecahedronGeometry(0.4, 0),
      palette[1],
      [-1.6, -1.9, -1],
      true,
      0.25,
    );
    addShape(
      new THREE.DodecahedronGeometry(0.3, 0),
      palette[2],
      [-0.9, 2.2, -2],
      false,
      0.4,
    );
    addShape(
      new THREE.DodecahedronGeometry(0.32, 0),
      palette[0],
      [4.0, 0.3, -3],
      true,
      0.18,
    );

    /* --- Particle field --------------------------------------------------- */
    const particlesGeo = new THREE.BufferGeometry();
    const particleCount = 200;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8 - 2;
    }
    particlesGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3),
    );
    const particlesMat = new THREE.PointsMaterial({
      color: 0x3b82f6,
      size: 0.03,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const particles = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particles);

    /* --- Resize handler --------------------------------------------------- */
    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);
    onResize(); // initial size

    /* --- Animation loop --------------------------------------------------- */
    let animId = 0;
    const animate = (time: number) => {
      animId = requestAnimationFrame(animate);

      if (!prefersReduced) {
        const t = time * 0.001;

        // Rotate & float each shape
        for (const s of shapes) {
          s.mesh.rotation.x += s.rotSpeed[0] * 0.016;
          s.mesh.rotation.y += s.rotSpeed[1] * 0.016;
          s.mesh.rotation.z += s.rotSpeed[2] * 0.016;
          s.mesh.position.y =
            s.initY + Math.sin(t * s.floatFreq + s.floatPhase) * s.floatAmp;
        }

        // Slowly orbit the particle field
        particles.rotation.y += 0.00025;
        particles.rotation.x += 0.00012;
      }

      renderer.render(scene, camera);
    };
    animId = requestAnimationFrame(animate);

    /* --- Cleanup ---------------------------------------------------------- */
    return () => {
      cancelAnimationFrame(animId);
      mq.removeEventListener("change", onMotionChange);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      shapes.forEach((s) => {
        s.mesh.geometry.dispose();
        if (Array.isArray(s.mesh.material)) {
          s.mesh.material.forEach((m: THREE.Material) => m.dispose());
        } else {
          s.mesh.material.dispose();
        }
      });
      particlesGeo.dispose();
      particlesMat.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    />
  );
}
