import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Center, Environment, Float, useTexture, Html } from '@react-three/drei';

const ShirtGeometry = (props) => {
    const group = useRef();
    // Try to load a texture, handle potential errors gracefully
    const textureProps = useTexture({
        map: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    });

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        if (group.current) {
            group.current.rotation.y = Math.sin(t / 4) / 4;
            group.current.rotation.z = Math.sin(t / 4) / 10;
        }
    });

    return (
        <group ref={group} {...props} dispose={null}>
            {/* Torso */}
            <mesh position={[0, 0, 0]} castShadow receiveShadow>
                <boxGeometry args={[1, 1.4, 0.5]} />
                <meshStandardMaterial {...textureProps} color="#4f46e5" roughness={0.8} metalness={0.1} />
            </mesh>

            {/* Left Sleeve */}
            <mesh position={[-0.65, 0.4, 0]} rotation={[0, 0, 0.2]} castShadow receiveShadow>
                <boxGeometry args={[0.5, 0.45, 0.48]} />
                <meshStandardMaterial {...textureProps} color="#4f46e5" roughness={0.8} metalness={0.1} />
            </mesh>

            {/* Right Sleeve */}
            <mesh position={[0.65, 0.4, 0]} rotation={[0, 0, -0.2]} castShadow receiveShadow>
                <boxGeometry args={[0.5, 0.45, 0.48]} />
                <meshStandardMaterial {...textureProps} color="#4f46e5" roughness={0.8} metalness={0.1} />
            </mesh>

            {/* Neck Hole (Visual only) */}
            <mesh position={[0, 0.71, 0]} scale={[1, 1, 1]}>
                <cylinderGeometry args={[0.25, 0.25, 0.1, 32]} />
                <meshStandardMaterial color="#312e81" />
            </mesh>
        </group>
    );
};

const LoadingScreen = () => {
    return (
        <Html center>
            <div className="flex flex-col items-center gap-3 bg-black/80 backdrop-blur-md p-4 rounded-xl border border-white/10">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <div className="text-xs font-medium text-white">Loading Model...</div>
            </div>
        </Html>
    );
};

export const ThreeShirt = () => {
    return (
        <div className="w-full h-full">
            <Canvas shadows camera={{ position: [0, 0, 4], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} shadow-mapSize={2048} castShadow />
                <pointLight position={[-10, -10, -10]} intensity={0.5} />

                <React.Suspense fallback={<LoadingScreen />}>
                    <Center>
                        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                            <ShirtGeometry />
                        </Float>
                    </Center>
                    <Environment preset="city" />
                </React.Suspense>

                <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={4} />
            </Canvas>
        </div>
    );
};
