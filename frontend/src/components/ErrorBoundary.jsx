import React from 'react';

export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center h-full w-full bg-red-500/10 p-4 text-center">
                    <p className="text-red-500 font-bold mb-2">Failed to load 3D Model</p>
                    <p className="text-xs text-red-400 font-mono">{this.state.error?.message}</p>
                </div>
            );
        }

        return this.props.children;
    }
}
