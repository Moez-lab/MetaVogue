# System Requirements

## Environment
- **Operating System**: Windows, macOS, or Linux
- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 9.0.0 or higher (usually bundled with Node.js)

## Core Dependencies
The following key libraries are required to run the application (automatically installed via `npm install`):

- **React**: ^19.2.0
- **React DOM**: ^19.2.0
- **Three.js**: ^0.181.2
- **React Three Fiber**: ^9.4.0
- **React Three Drei**: ^10.7.7
- **TailwindCSS**: ^4.1.17
- **Vite**: ^7.2.4

## API Keys
- **Meshy AI**: A valid API key is required for 3D generation features.
  - Currently configured in `src/services/meshy.js`.
  - *Note: For production, move this to an environment variable (`.env`).*

## Browser Compatibility
- **Google Chrome**: Latest version (Recommended for WebGL performance)
- **Mozilla Firefox**: Latest version
- **Microsoft Edge**: Latest version
- **Safari**: Version 15+

## Hardware Recommendations
- **GPU**: Dedicated graphics card recommended for smooth 3D rendering.
- **RAM**: 8GB minimum, 16GB recommended.
