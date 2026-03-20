import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function GlobePoints() {
  const pointsRef = useRef<THREE.Points>(null!);
  
  const count = 2000;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const phi = Math.acos(-1 + (2 * i) / count);
      const theta = Math.sqrt(count * Math.PI) * phi;
      const r = 2;
      pos[i * 3] = r * Math.cos(theta) * Math.sin(phi);
      pos[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const time = state.clock.getElapsedTime();
    pointsRef.current.rotation.y = time * 0.1;
    pointsRef.current.rotation.x = Math.sin(time * 0.05) * 0.2;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        transparent
        color="#6366f1"
        size={0.02}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function Atmosphere() {
  return (
    <Sphere args={[2.1, 64, 64]}>
      <meshPhongMaterial
        color="#4338ca"
        transparent
        opacity={0.1}
        side={THREE.BackSide}
      />
    </Sphere>
  );
}

export function Globe() {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    groupRef.current.position.y = Math.sin(time * 0.5) * 0.1;
  });

  return (
    <group ref={groupRef}>
      <GlobePoints />
      <Atmosphere />
      <Sphere args={[1.95, 64, 64]}>
        <meshPhongMaterial
          color="#1e1b4b"
          transparent
          opacity={0.3}
        />
      </Sphere>
      <mesh>
        <sphereGeometry args={[2, 64, 64]} />
        <MeshDistortMaterial
          color="#4338ca"
          transparent
          opacity={0.05}
          distort={0.3}
          speed={2}
        />
      </mesh>
    </group>
  );
}
