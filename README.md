# Tarotaros Worlds

**"프롬프트 한 줄로 나만의 세계를 즉시 걷는 플랫폼"**

WebXR과 AI 생성 기술을 융합한 내러티브 기반 사용자 창작 VR 생태계.

## 🎯 프로젝트 비전

일반 사용자가 **자신의 아이디어(프롬프트)**를 입력하면, AI가 그에 맞는 탐험 가능한 WebXR 기반의 가상세계를 자동으로 생성해주는 플랫폼.

### 핵심 가치
- 개인의 상상력을 즉시 시각화
- 크리에이티브한 내러티브 기반 세계 확장
- VR 생태계의 진입장벽 완화 (기기 없이도 체험 가능)

## 🧩 MVP 기능

1. **프롬프트 입력**: 짧은 텍스트로 세계관/장면 설명
2. **AI 이미지/씬 생성**: 360° 배경 또는 파노라마 이미지 생성
3. **탐험 가능한 WebXR 씬**: Three.js 기반 상호작용
4. **월드 갤러리/공유**: 생성된 씬 링크 공유

## 🛠️ 기술 스택

- **Frontend**: Next.js 14 + TypeScript
- **3D/XR**: Three.js + React Three Fiber + @react-three/xr
- **AI**: OpenAI (DALL-E), Replicate (Stable Diffusion)
- **Database**: PostgreSQL + Prisma
- **Auth**: JWT
- **Styling**: Tailwind CSS + Framer Motion

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

## 📁 Project Structure

```
tarotaros-worlds/
├── app/                  # Next.js App Router
│   ├── page.tsx         # Home - Prompt input
│   ├── create/          # World creation flow
│   ├── explore/[id]/    # WebXR world viewer
│   ├── gallery/         # World gallery
│   └── api/             # Backend API routes
├── components/          # React components
│   ├── WorldViewer.tsx  # WebXR scene viewer
│   └── PromptInput.tsx  # Prompt input UI
├── lib/                 # Utilities
│   ├── ai/              # AI generation logic
│   ├── prisma.ts        # Database client
│   └── auth.ts          # Authentication
└── prisma/              # Database schema
```

## 🔗 Integration with Tarotaros

This platform integrates with the main Tarotaros dilemma platform:
- Shared user accounts
- Cross-platform analytics
- Personalized world recommendations based on moral choices

## 📝 License

Private project
