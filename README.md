# 🌌 Web Meta: Virtual Wardrobe & Texture Studio

![Project Banner](https://images.unsplash.com/photo-1617791160505-6f00504e3519?q=80&w=2000&auto=format&fit=crop)

> **Digitize your physical garments for neural simulation.**
> Experience the future of fashion with AI-driven 3D model generation and texturing.

## ✨ Features

### 👕 Upload Studio
Transform your physical clothing into digital assets.
- **Image to 3D**: Upload a photo of a shirt or garment.
- **AI Processing**: Powered by **Meshy AI (v4)** for high-fidelity texture mapping.
- **Interactive Preview**: View your generated 3D model instantly in the browser.
- **Export Ready**: Download in **.GLB** or **.FBX** formats for use in Blender, Unity, or Unreal Engine.

### 🎨 Texture Studio
Apply AI-generated materials to any 3D model.
- **Text-to-Texture**: Describe a material (e.g., "worn leather", "holographic metal") and apply it to your model.
- **Model Support**: Upload your own `.glb` or use the generated assets.
- **Real-time Visualization**: See changes instantly with our PBR-enabled viewer.

### ⚡ Core Tech
- **React 19**: Built on the latest React ecosystem for blazing fast performance.
- **Three.js / React Three Fiber**: Professional-grade 3D rendering in the browser.
- **TailwindCSS**: Sleek, modern, and responsive UI with dark mode support.
- **Vite**: Next-generation frontend tooling.

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/web-meta.git
   cd web-meta
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

## ▶️ How to Run

### Frontend

Run from the **project root** — Vite serves the `frontend/` directory:

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:5173`.

---

### Backend

The Express server runs on **port 3001**. Start it from the `backend/` folder:

```bash
cd backend
start-server.bat
```

> **Note:** `start-server.bat` is a Windows batch script that launches the Express API. Make sure Node.js is installed and dependencies are set up before running it.

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| **Frontend** | React 19, Vite |
| **Styling** | TailwindCSS, PostCSS |
| **3D Engine** | Three.js, React Three Fiber, Drei |
| **AI Services** | Meshy API (v4) |
| **Icons** | Lucide React |

## 📦 Project Structure

```
web-meta/
│
├── 🎨 frontend/                    # React / Vite Application
│   ├── public/                     # Static assets served directly
│   │   └── temp/uploads/           # Temp folder for AI-processed images
│   ├── src/
│   │   ├── assets/                 # Images, logos, fonts
│   │   ├── components/             # Reusable UI components (Sidebar, TopBar, Icon…)
│   │   ├── context/                # Global state (GlobalContext.jsx)
│   │   ├── services/               # API integrations (Meshy AI)
│   │   ├── utils/                  # Helper functions
│   │   ├── views/
│   │   │   ├── admin/              # 🔐 Admin-only pages
│   │   │   │   ├── HomeView.jsx
│   │   │   │   ├── OrdersView.jsx
│   │   │   │   ├── AdminUsersView.jsx
│   │   │   │   ├── WorkTrackingView.jsx
│   │   │   │   └── AnalyticsView.jsx
│   │   │   ├── customer/           # 👤 Customer-facing pages
│   │   │   │   ├── BrandiesView.jsx
│   │   │   │   └── MyOrdersView.jsx
│   │   │   ├── LandingView.jsx     # 🌐 Public landing page
│   │   │   ├── LoginView.jsx
│   │   │   ├── ModelStudioView.jsx # 🛠️ Shared tool pages
│   │   │   ├── UploadStudioView.jsx
│   │   │   ├── VideoStudioView.jsx
│   │   │   ├── TextureStudioView.jsx
│   │   │   ├── FeatureExtractorView.jsx
│   │   │   └── NanoBananaView.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   └── index.html
│
├── ⚙️ backend/                     # Express Server + Python AI
│   ├── server/
│   │   └── index.js                # Express API — runs on port 3001
│   ├── feature-extractor/          # Python AI feature extraction scripts
│   │   ├── feature-extraction.py
│   │   ├── requirements.txt
│   │   └── …
│   └── start-server.bat            # Script to start the backend (Windows)
│
├── vite.config.js                  # Vite config (root: ./frontend)
├── package.json                    # Node dependencies (frontend + backend)
├── postcss.config.js
├── eslint.config.js
└── README.md
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">
  Built with ❤️ by the Web Meta Team
</p>
