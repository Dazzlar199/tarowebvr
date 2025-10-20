# Tarotaros Worlds - 개발 가이드

## 📦 프로젝트 개요

**Tarotaros Worlds**는 사용자의 텍스트 프롬프트를 기반으로 AI가 탐험 가능한 WebXR 가상세계를 자동 생성하는 플랫폼입니다.

### 프로젝트 위치
```
/Users/dazzlar/Desktop/coding/
├── tarotaros/          # 기존 딜레마 플랫폼
└── tarotaros-worlds/   # 새로운 WebXR 플랫폼 (현재 프로젝트)
```

## 🚀 빠른 시작

### 1. 환경 설정

`.env` 파일에 필요한 환경 변수를 설정하세요:

```bash
# OpenAI API Key (필수 - 이미지 생성용)
OPENAI_API_KEY=your_openai_api_key_here

# 다른 설정은 이미 기본값으로 설정되어 있습니다
```

### 2. 개발 서버 실행

```bash
# 프로젝트 디렉토리로 이동
cd /Users/dazzlar/Desktop/coding/tarotaros-worlds

# 개발 서버 시작 (http://localhost:3000)
npm run dev
```

### 3. 데이터베이스

현재 SQLite로 설정되어 있으며, 이미 마이그레이션과 시드 데이터가 적용되었습니다.

```bash
# 필요시 데이터베이스 초기화
npx prisma migrate reset

# Prisma Studio로 데이터 확인
npx prisma studio
```

## 📂 프로젝트 구조

```
tarotaros-worlds/
├── app/                      # Next.js App Router
│   ├── page.tsx             # 홈 페이지 (프롬프트 입력)
│   ├── layout.tsx           # 루트 레이아웃
│   ├── globals.css          # 전역 스타일
│   ├── api/                 # API 라우트 (TODO)
│   ├── create/              # 월드 생성 플로우 (TODO)
│   ├── explore/[id]/        # WebXR 뷰어 (TODO)
│   └── gallery/             # 월드 갤러리 (TODO)
│
├── components/              # React 컴포넌트 (TODO)
│   ├── WorldViewer.tsx      # WebXR 씬 뷰어
│   └── PromptInput.tsx      # 프롬프트 입력 UI
│
├── lib/                     # 유틸리티 & 비즈니스 로직
│   ├── ai/
│   │   └── image-generator.ts  # AI 이미지 생성
│   ├── prisma.ts            # Prisma 클라이언트
│   ├── auth.ts              # JWT 인증
│   ├── constants.ts         # 상수 정의
│   ├── env.ts               # 환경 변수 검증
│   └── api-response.ts      # API 응답 헬퍼
│
├── prisma/
│   ├── schema.prisma        # 데이터베이스 스키마
│   ├── seed.ts              # 시드 데이터
│   ├── dev.db               # SQLite 데이터베이스
│   └── migrations/          # 마이그레이션
│
├── public/                  # 정적 파일
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## 🗄️ 데이터베이스 스키마

### 주요 모델

**User** - 사용자 계정
- id, email, username, password (optional)
- role: "USER" | "ADMIN"

**World** - 생성된 가상세계
- title, description, prompt (원본 프롬프트)
- imageUrl (360° 파노라마), thumbnailUrl
- sceneData (Three.js 씬 설정 JSON)
- visibility: "PUBLIC" | "UNLISTED" | "PRIVATE"
- tags (쉼표로 구분된 문자열)
- viewCount, likeCount

**WorldAsset** - 월드에 연결된 에셋
- type: "IMAGE_360" | "IMAGE_REGULAR" | "AUDIO_BGM" | etc.
- url, metadata (JSON)

**WorldVisit** - 방문 기록
- worldId, userId, duration

**WorldInteraction** - 상호작용 기록
- type: "LIKE" | "COMMENT" | "SHARE" | "PORTAL_ENTER"
- data (JSON)

## 🎨 MVP 구현 계획 (2주)

### Week 1: 기반 구축

#### Day 1-2: AI 이미지 생성 파이프라인
- [TODO] `app/api/world/create/route.ts` - 월드 생성 API
- [TODO] OpenAI DALL-E 3 360° 이미지 생성 통합
- [TODO] 생성된 이미지 저장 (로컬 또는 클라우드)

#### Day 3-4: WebXR 씬 뷰어
- [TODO] `components/WorldViewer.tsx` - Three.js + React Three Fiber
- [TODO] `app/explore/[id]/page.tsx` - 월드 탐험 페이지
- [TODO] 360° 이미지를 Three.js SphereGeometry에 매핑
- [TODO] 카메라 컨트롤 (OrbitControls)
- [TODO] WebXR 지원 (@react-three/xr)

#### Day 5-7: 통합 및 UX 개선
- [TODO] 프롬프트 입력 → 생성 → 탐험 플로우 연결
- [TODO] 로딩 애니메이션
- [TODO] 에러 처리

### Week 2: 갤러리 & 공유

#### Day 8-10: 월드 갤러리
- [TODO] `app/gallery/page.tsx` - 공개 월드 목록
- [TODO] 필터링 (태그, 인기순, 최신순)
- [TODO] 썸네일 그리드 레이아웃

#### Day 11-12: 공유 기능
- [TODO] 월드 링크 공유 (QR 코드)
- [TODO] 공개/비공개 설정
- [TODO] 좋아요 기능

#### Day 13-14: 테스트 & 배포 준비
- [TODO] 버그 수정
- [TODO] 성능 최적화
- [TODO] PostgreSQL 마이그레이션 (프로덕션용)
- [TODO] Vercel 배포

## 🔑 주요 기술 스택

### 프론트엔드
- **Next.js 14** (App Router)
- **React 18** + TypeScript
- **Three.js + React Three Fiber** - 3D 렌더링
- **@react-three/xr** - WebXR 지원
- **@react-three/drei** - Three.js 헬퍼
- **Tailwind CSS** - 스타일링
- **Framer Motion** - 애니메이션

### 백엔드
- **Next.js API Routes** (Edge Runtime)
- **Prisma** - ORM
- **SQLite** (개발) / **PostgreSQL** (프로덕션)
- **JWT** - 인증

### AI
- **OpenAI DALL-E 3** - 360° 이미지 생성
- **GPT-Image-1** - 차세대 이미지 모델 (폴백)

## 🔧 개발 팁

### AI 이미지 생성

```typescript
import { generate360Image } from '@/lib/ai/image-generator'

const imageUrl = await generate360Image(
  "폐허가 된 도서관 안에서 빛나는 구슬이 떠오른다",
  "mystical, ethereal, fantasy"
)
```

### Three.js 360° 씬 기본 구조

```tsx
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

function WorldViewer({ imageUrl }: { imageUrl: string }) {
  return (
    <Canvas>
      <ambientLight intensity={0.5} />
      <mesh>
        <sphereGeometry args={[500, 60, 40]} />
        <meshBasicMaterial map={useTexture(imageUrl)} side={THREE.BackSide} />
      </mesh>
      <OrbitControls enableZoom={false} />
    </Canvas>
  )
}
```

### WebXR 추가

```tsx
import { XR, Controllers } from '@react-three/xr'

<Canvas>
  <XR>
    <Controllers />
    {/* 월드 컨텐츠 */}
  </XR>
</Canvas>
```

## 📝 API 엔드포인트 (계획)

### 월드 생성
```
POST /api/world/create
Body: { prompt: string, style?: string }
Response: { worldId: string, status: 'generating' | 'ready' }
```

### 월드 조회
```
GET /api/world/[id]
Response: { id, title, prompt, imageUrl, sceneData, ... }
```

### 갤러리 목록
```
GET /api/world/gallery?tag=fantasy&sort=popular
Response: { worlds: [...], total, page }
```

### 월드 상호작용
```
POST /api/world/[id]/like
POST /api/world/[id]/visit
```

## 🔗 기존 플랫폼과의 통합

### 공유 데이터베이스
- User 모델을 공유하여 단일 계정으로 두 플랫폼 사용 가능
- `DATABASE_URL`을 동일하게 설정 (프로덕션 시)

### 크로스 링크
- 딜레마 플랫폼: "당신의 선택을 세계로 탐험하세요" → Worlds 플랫폼
- Worlds 플랫폼: "도덕적 성향 분석하기" → 딜레마 플랫폼

### API 통합
```typescript
// 환경 변수
TAROTAROS_API_URL=http://localhost:3001
TAROTAROS_SHARED_SECRET=shared_secret

// 딜레마 플랫폼의 분석 데이터를 기반으로 맞춤형 월드 추천
const recommendations = await fetchFromTarotaros('/api/analysis/recommend-worlds', userId)
```

## 📖 참고 자료

### WebXR
- [WebXR Device API](https://immersive-web.github.io/webxr/)
- [@react-three/xr Docs](https://github.com/pmndrs/xr)

### Three.js
- [Three.js Docs](https://threejs.org/docs/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/)

### AI 이미지 생성
- [OpenAI Image Generation](https://platform.openai.com/docs/guides/images)
- [DALL-E 3 Best Practices](https://platform.openai.com/docs/guides/images/prompting)

## 🎯 다음 단계

1. **OpenAI API 키 설정** - `.env` 파일 업데이트
2. **월드 생성 API 구현** - `app/api/world/create/route.ts`
3. **WebXR 뷰어 구현** - `components/WorldViewer.tsx`
4. **테스트 월드 생성** - 프롬프트로 첫 월드 만들어보기

행운을 빕니다! 🚀
