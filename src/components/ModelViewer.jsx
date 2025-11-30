import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, useGLTF } from '@react-three/drei';
import { ErrorBoundary } from './ErrorBoundary';

const Model = ({ url }) => {
    const { scene } = useGLTF(url);
    return <primitive object={scene} />;
};

export const ModelViewer = ({ url }) => {
    const [blobUrl, setBlobUrl] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!url || typeof url !== 'string') return;

        const fetchModel = async () => {
            try {
                // Use proxy if URL is from Meshy assets
                const proxyUrl = url.replace('https://assets.meshy.ai', '/meshy-proxy');

                const response = await fetch(proxyUrl);
                if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);
                const blob = await response.blob();
                const objectUrl = URL.createObjectURL(blob);
                setBlobUrl(objectUrl);
                setError(null);
            } catch (err) {
                console.error("Error fetching model:", err);
                // Fallback to direct fetch if proxy fails (e.g. different domain)
                if (url.includes('assets.meshy.ai')) {
                    try {
                        const response = await fetch(url);
                        if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);
                        const blob = await response.blob();
                        const objectUrl = URL.createObjectURL(blob);
                        setBlobUrl(objectUrl);
                        setError(null);
                    } catch (retryErr) {
                        setError(retryErr.message);
                    }
                } else {
                    setError(err.message);
                }
            }
        };

        fetchModel();

        return () => {
            if (blobUrl) URL.revokeObjectURL(blobUrl);
        };
    }, [url]); // Removed blobUrl to prevent infinite loop

    if (!url || typeof url !== 'string') {
        return (
            <div className="w-full h-full min-h-[400px] bg-slate-900/50 rounded-2xl flex items-center justify-center text-slate-500">
                Invalid Model URL
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full h-full min-h-[400px] bg-slate-900/50 rounded-2xl flex items-center justify-center text-red-500 p-4 text-center">
                <p className="font-bold mb-2">Failed to load model</p>
                <p className="text-xs font-mono">{error}</p>
            </div>
        );
    }

    if (!blobUrl) {
        return (
            <div className="w-full h-full min-h-[400px] bg-slate-900/50 rounded-2xl flex items-center justify-center text-cyan-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mr-3"></div>
                Downloading Model...
            </div>
        );
    }

    return (
        <div className="w-full h-full min-h-[400px] bg-slate-900/50 rounded-2xl overflow-hidden relative">
            <ErrorBoundary>
                <Canvas shadows dpr={[1, 2]} camera={{ fov: 50 }}>
                    <Suspense fallback={null}>
                        <Stage environment="city" intensity={0.6}>
                            <Model url={blobUrl} />
                        </Stage>
                    </Suspense>
                    <OrbitControls autoRotate />
                </Canvas>
            </ErrorBoundary>

            <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-xs font-mono text-white/70 pointer-events-none">
                INTERACTIVE PREVIEW
            </div>
        </div>
    );
};
