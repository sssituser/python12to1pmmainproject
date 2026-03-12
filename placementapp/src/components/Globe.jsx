import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial, Stars } from "@react-three/drei";
import { useRef, useMemo } from "react";
import * as THREE from "three";

function Dots() {
  const ref = useRef();

  const points = useMemo(() => {
    const positions = [];

    for (let i = 0; i < 2000; i++) {
      const r = 2.5;
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      positions.push(x, y, z);
    }

    return new Float32Array(positions);
  }, []);

  useFrame(() => {
    ref.current.rotation.y += 0.0015;
  });

  return (
    <Points ref={ref} positions={points} stride={3}>
      <PointMaterial
        color="#00ff88"
        size={0.03}
        sizeAttenuation
        depthWrite={false}
      />
    </Points>
  );
}

export default function Globe() {
  return (
    <div className="absolute inset-0 flex items-center justify-center scale-150 opacity-70">
      <Canvas camera={{ position: [0, 0, 6] }}>
        <ambientLight intensity={0.5} />
        <Dots />
        <Stars radius={100} depth={50} count={3000} factor={4} />
      </Canvas>
    </div>
  );
}