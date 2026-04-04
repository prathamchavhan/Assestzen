<div align="center">
<br/>

```
 █████╗ ███████╗███████╗███████╗████████╗███████╗███████╗███╗   ██╗
██╔══██╗██╔════╝██╔════╝██╔════╝╚══██╔══╝╚══███╔╝██╔════╝████╗  ██║
███████║███████╗███████╗█████╗     ██║     ███╔╝ █████╗  ██╔██╗ ██║
██╔══██║╚════██║╚════██║██╔══╝     ██║    ███╔╝  ██╔══╝  ██║╚██╗██║
██║  ██║███████║███████║███████╗   ██║   ███████╗███████╗██║ ╚████║
╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝   ╚═╝   ╚══════╝╚══════╝╚═╝  ╚═══╝
```

### ✦ &nbsp; Media Optimization, Reimagined &nbsp; ✦

*Compress · Convert · Remove Backgrounds · Generate QR Codes — Autonomously*

<br/>

### 🌐 &nbsp; [https://assestzen.vercel.app](https://assestzen.vercel.app)

</div>

<br/>

## ◈ &nbsp; Overview

**AssestZen** is a full-stack, AI-powered media toolkit with a **Next.js + TypeScript** frontend and a **Python (FastAPI)** backend. Drop your files, choose an action, and let the engine handle the rest — wrapped in a clean monochrome interface built for speed and precision.

> *No subscriptions. No accounts. No noise. Just pure, autonomous media processing.*

<br/>

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## ◈ &nbsp; Feature Suite

<br/>

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CORE CAPABILITIES                            │
├──────────────────┬──────────────────────────────────────────────────┤
│  🗜  Compress    │  Shrink images & videos to a target KB size      │
│  🔄  Convert     │  Transform formats across images & MP4 videos    │
│  ✂️  Remove BG   │  AI-powered background removal, one click        │
│  🔗  To URL      │  Upload media → get a hosted shareable link      │
│  📷  QR Tools    │  Generate & scan QR codes instantly              │
└──────────────────┴──────────────────────────────────────────────────┘
```

<br/>

### 🗜 &nbsp; Compress
Reduce file sizes without sacrificing visual quality. Define a target output in **KB** and the Python backend optimizes using binary search compression — capped at 5 iterations for speed.

### 🔄 &nbsp; Convert Format
Convert between popular image and video formats. The backend uses **FFmpeg** with `ultrafast` preset and `tune fastdecode` flags for 3–5× faster video encoding.

### ✂️ &nbsp; Remove Background
Autonomous AI-driven background removal. Upload your image and receive a clean cutout — no manual masking, no external tools, no waiting.

### 🔗 &nbsp; Convert to URL
Upload any image and receive an instantly hosted URL — ready to embed in markdown, share across platforms, or plug into your projects.

### 📷 &nbsp; QR Code Tools
A dual-mode QR utility:
- **Generate** — Convert any text or URL into a scannable QR code
- **Scan** — Upload a QR image and extract its encoded content

<br/>

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## ◈ &nbsp; How It Works

```
  ┌───────────┐     ┌───────────┐     ┌───────────┐     ┌───────────┐
  │  📂 Drop  │ ──▶ │ ⚙️ Select │ ──▶ │ 🎛 Config │ ──▶ │ ✨ Ignite │
  │   Files   │     │  Action   │     │ Settings  │     │  Engine   │
  └───────────┘     └───────────┘     └───────────┘     └─────┬─────┘
                                                               │
                                               Python backend processes
                                               via FastAPI + FFmpeg + AI
                                                               │
                                                               ▼
                                                        ┌───────────┐
                                                        │ ⬇ Download│
                                                        │  Results  │
                                                        └───────────┘
```

1. **📂 Drop Files** — Drag & drop images or MP4 videos. Files are parsed and queued automatically.
2. **⚙️ Select Action** — Pick from Compress, Convert, Remove BG, or Convert to URL.
3. **🎛 Configure** — Set target KB, encoding quality, or output format.
4. **✨ Ignite Engine** — Frontend calls the API via `api.ts` → Python backend processes.
5. **⬇ Download** — Your processed files are ready instantly.

<br/>

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## ◈ &nbsp; Tech Stack

<div align="center">

<br/>

<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg" height="45" title="Next.js" />&nbsp;&nbsp;&nbsp;
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" height="45" title="React" />&nbsp;&nbsp;&nbsp;
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" height="45" title="TypeScript" />&nbsp;&nbsp;&nbsp;
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" height="45" title="JavaScript" />&nbsp;&nbsp;&nbsp;
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg" height="45" title="Tailwind CSS" />&nbsp;&nbsp;&nbsp;
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" height="45" title="Python" />&nbsp;&nbsp;&nbsp;
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/fastapi/fastapi-original.svg" height="45" title="FastAPI" />&nbsp;&nbsp;&nbsp;
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" height="45" title="Node.js" />&nbsp;&nbsp;&nbsp;
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vercel/vercel-original.svg" height="45" title="Vercel" />

<br/><br/>

</div>

```
┌─────────────────────────────────────────────────────────────────────┐
│                           BUILT WITH                                │
├──────────────────────┬──────────────────────────────────────────────┤
│  ⚡ Frontend         │  Next.js · TypeScript · Tailwind CSS         │
│  🐍 Backend          │  Python 3.13 · FastAPI                       │
│  🎬 Media Processing │  FFmpeg (ultrafast + fastdecode)             │
│  🤖 AI Engine        │  Background Removal API                      │
│  🧩 UI Components    │  shadcn/ui (button, card, progress,          │
│                      │  select, slider)                             │
│  🔌 API Layer        │  api.ts · utils.ts / utils.py                │
│  ☁️  Frontend Host   │  Vercel                                      │
│  🖥  Backend Host    │  Render (assestzen.onrender.com)             │
└──────────────────────┴──────────────────────────────────────────────┘
```

<br/>

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## ◈ &nbsp; Project Structure

```
AssetZen/
│
├── 📁 backend/                    →  Python FastAPI server
│   ├── 📁 __pycache__/            →  Compiled Python cache
│   ├── 🐍 main.py                 →  API entry point & route handlers
│   ├── 🐍 utils.py                →  Media processing utilities
│   └── 📄 requirements.txt        →  Python dependencies
│
├── 📁 frontend/                   →  Next.js TypeScript app
│   ├── 📁 .next/                  →  Next.js build output
│   ├── 📁 node_modules/           →  Node dependencies
│   ├── 📁 public/                 →  Static assets
│   ├── 📁 src/
│   │   ├── 📁 app/                →  Next.js App Router pages
│   │   ├── 📁 components/
│   │   │   └── 📁 ui/             →  shadcn/ui components
│   │   │       ├── 🔷 button.tsx
│   │   │       ├── 🔷 card.tsx
│   │   │       ├── 🔷 progress.tsx
│   │   │       ├── 🔷 select.tsx
│   │   │       └── 🔷 slider.tsx
│   │   └── 📁 lib/
│   │       ├── 🔷 api.ts          →  API client (calls backend)
│   │       └── 🔷 utils.ts        →  Frontend utility functions
│   ├── 📄 .env.local              →  Environment variables (gitignored)
│   ├── 📄 .gitignore
│   ├── 📄 AGENTS.md               →  AI agent instructions
│   ├── 📄 CLAUDE.md               →  Claude AI context file
│   ├── 📄 components.json         →  shadcn/ui config
│   ├── 📄 eslint.config.mjs       →  ESLint configuration
│   ├── 🔷 next-env.d.ts           →  Next.js type declarations
│   ├── 📄 next.config.ts          →  Next.js configuration
│   └── 📄 package-lock.json       →  Lockfile
│
└── README.md                      →  You are here ✦
```

<br/>

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## ◈ &nbsp; Getting Started

### Prerequisites

```
  node    ≥ 18.0.0
  python  ≥ 3.13
  ffmpeg  installed & on PATH
  npm     ≥ 9.0.0
```

### 1 · Clone the Repository

```bash
git clone https://github.com/prathamchavhan/Assestzen.git
cd Assestzen
```

### 2 · Backend Setup

```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Start the FastAPI server
python main.py
```

Backend runs at **[http://localhost:8000](http://localhost:8000)**

### 3 · Frontend Setup

```bash
cd frontend

# Install Node dependencies
npm install

# Configure environment
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Start development server
npm run dev
```

Frontend runs at **[http://localhost:3000](http://localhost:3000)** 🎉

### Environment Variables

```env
# frontend/.env.local
NEXT_PUBLIC_API_URL = https://assestzen.onrender.com   # production
# NEXT_PUBLIC_API_URL = http://localhost:8000           # local dev
```

<br/>

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## ◈ &nbsp; Deployment

### Frontend → Vercel

```bash
npm i -g vercel
cd frontend
vercel --prod
```

Or connect your GitHub repo on [vercel.com](https://vercel.com) for automatic deployments on every push to `main`.

### Backend → Render

Push `backend/` to GitHub, then deploy as a **Web Service** on [render.com](https://render.com):

```
Build Command:   pip install -r requirements.txt
Start Command:   python main.py
```

<br/>

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## ◈ &nbsp; Contributing

```bash
# ❶  Fork the repository on GitHub

# ❷  Create your feature branch
git checkout -b feature/your-feature-name

# ❸  Commit your changes
git commit -m "feat: describe your change"

# ❹  Push to your branch
git push origin feature/your-feature-name

# ❺  Open a Pull Request
```

> Follow **conventional commit** messages and ensure code passes lint checks before submitting.

<br/>

<div align="center">

<br/>

```
  ✦  Built with precision  ·  Zero noise  ·  Pure utility  ✦
```

<br/>

[![⬆ Back to Top](https://img.shields.io/badge/⬆-Back%20to%20Top-000000?style=for-the-badge)](#)
&nbsp;&nbsp;
[![Live App](https://img.shields.io/badge/🌐-assestzen.vercel.app-000000?style=for-the-badge)](https://assestzen.vercel.app)

<br/>

*Made with ♥ &nbsp;·&nbsp; Frontend on [Vercel](https://vercel.com) &nbsp;·&nbsp; Backend on [Render](https://render.com)*

</div>