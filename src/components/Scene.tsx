import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars, PerspectiveCamera } from '@react-three/drei';
import { Globe } from './Globe';
import * as THREE from 'three';

function MovingLights() {
  const light1 = useRef<THREE.PointLight>(null!);
  const light2 = useRef<THREE.PointLight>(null!);

  useFrame((state) => {
    if (!light1.current || !light2.current) return;
    const time = state.clock.getElapsedTime();
    light1.current.position.set(
      Math.sin(time * 0.7) * 10,
      Math.cos(time * 0.5) * 10,
      Math.sin(time * 0.3) * 10
    );
    light2.current.position.set(
      Math.cos(time * 0.3) * 10,
      Math.sin(time * 0.5) * 10,
      Math.cos(time * 0.7) * 10
    );
  });

  return (
    <>
      <pointLight ref={light1} color="#6366f1" intensity={2} distance={20} />
      <pointLight ref={light2} color="#ec4899" intensity={2} distance={20} />
    </>
  );
}

export const Scene = () => {
  return (
    <div className="fixed inset-0 -z-20 bg-black">
      <Canvas dpr={[1, 2]}>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={50} />
          <ambientLight intensity={0.2} />
          <MovingLights />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          
          <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
            <group position={[0, 0, 0]}>
              <Globe />
            </group>
          </Float>

          <fog attach="fog" args={['#000', 5, 25]} />
        </Suspense>
      </Canvas>
    </div>
  );
};
