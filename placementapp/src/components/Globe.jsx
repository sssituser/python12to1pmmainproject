import { OrbitControls, Stars } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";


// 🌍 PREMIUM EARTH
function Earth() {
  const ref = useRef();

  useFrame((state) => {
    if (!ref.current) return;

    // smooth rotation
    ref.current.rotation.y += 0.0015;

    // 🖱 cinematic mouse tilt
    ref.current.rotation.x = THREE.MathUtils.lerp(
      ref.current.rotation.x,
      state.mouse.y * 0.2,
      0.05
    );

    ref.current.rotation.z = THREE.MathUtils.lerp(
      ref.current.rotation.z,
      -state.mouse.x * 0.2,
      0.05
    );
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[2.5, 32, 32]} />

      {/* 🔥 glassy neon material */}
      <meshStandardMaterial
        color="#0ea5e9"
        metalness={0.7}
        roughness={0.2}
        emissive="#06b6d4"
        emissiveIntensity={0.4}
      />
    </mesh>
  );
}


// ⚡ GLOW ATMOSPHERE (ANIMATED)
function Atmosphere() {
  const ref = useRef();
  const timeRef = useRef(0);

  useFrame((state, delta) => {
    if (!ref.current) return;

    timeRef.current += delta;

    // pulse glow
    ref.current.material.opacity = 0.05 + Math.sin(timeRef.current * 2) * 0.02;
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[2.8, 32, 32]} />
      <meshBasicMaterial
        color="#22d3ee"
        transparent
        opacity={0.06}
      />
    </mesh>
  );
}


// 🌌 BACKGROUND GRADIENT (DEPTH FEEL)
function Background() {
  return (
    <mesh scale={[50, 50, 1]}>
      <planeGeometry />
      <meshBasicMaterial color="#020617" />
    </mesh>
  );
}


// 🌍 MAIN COMPONENT
export default function Globe() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleContextLost = (event) => {
      event.preventDefault();
      console.warn("WebGL context lost, attempting recovery...");
    };

    const handleContextRestored = () => {
      console.log("WebGL context restored");
    };

    canvas.addEventListener("webglcontextlost", handleContextLost, false);
    canvas.addEventListener("webglcontextrestored", handleContextRestored, false);

    return () => {
      canvas.removeEventListener("webglcontextlost", handleContextLost, false);
      canvas.removeEventListener("webglcontextrestored", handleContextRestored, false);
    };
  }, []);

  return (
    <div className="absolute inset-0">
      <Canvas
        ref={canvasRef}
        camera={{ position: [0, 0, 7] }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, powerPreference: "low-power", preserveDrawingBuffer: false }}
        onCreated={({ gl }) => {
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        }}
        onError={(error) => console.error("Three.js error:", error)}
      >
        {/* 🌌 DARK SPACE */}
        <Background />

        {/* 💡 LIGHTING */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        <pointLight position={[-5, -5, -5]} intensity={0.6} color="#0ea5e9" />

        {/* 🌍 GLOBE */}
        <Earth />
        <Atmosphere />

        {/* ✨ STARS */}
        <Stars
          radius={100}
          depth={50}
          count={1000}
          factor={4}
          saturation={0}
          fade
          speed={1}
        />

        {/* 🎥 CONTROLS */}
        <OrbitControls
          enableZoom={false}
          autoRotate
          autoRotateSpeed={0.3}
        />
      </Canvas>

    </div>
  );
}
