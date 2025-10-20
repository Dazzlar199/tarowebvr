# 🚀 Tarotaros Worlds - 빠른 시작 가이드

## ✅ 완료된 MVP 기능

### 1. 홈 페이지 (/)
- 프롬프트 입력 UI
- 예시 프롬프트 제공
- AI 세계 생성 버튼
- 갤러리 링크

### 2. AI 이미지 생성 API
- `/api/world/create` - 월드 생성
- `/api/world/[id]` - 월드 조회
- `/api/world/gallery` - 갤러리 목록

### 3. WebXR 뷰어
- 360° 파노라마 씬
- Three.js + React Three Fiber
- OrbitControls (마우스/터치 컨트롤)
- WebXR VR 모드 지원
- 로딩 상태 처리

### 4. 탐험 페이지 (/explore/[id])
- 동적 월드 로딩
- 에러 처리
- 세계 정보 표시
- 조회수 카운트

### 5. 갤러리 페이지 (/gallery)
- 생성된 세계 목록
- 정렬 (최신순, 인기순, 조회순)
- 썸네일 그리드
- 반응형 디자인

## 🎮 사용 방법

### 1. 개발 서버 시작

```bash
cd /Users/dazzlar/Desktop/coding/tarotaros-worlds
npm run dev
```

브라우저에서 http://localhost:3000 접속

### 2. 세계 생성하기

1. 홈 페이지에서 프롬프트 입력
   - 예: "폐허가 된 도서관 안에서 빛나는 구슬이 떠오른다"

2. "세계 생성하기" 버튼 클릭

3. AI가 이미지 생성 (약 10-30초 소요)

4. 자동으로 탐험 페이지로 이동

### 3. 세계 탐험하기

- **마우스 드래그**: 주위 둘러보기
- **터치**: 모바일에서 둘러보기
- **VR 모드**: VR 헤드셋으로 체험 (WebXR 지원 브라우저 필요)

### 4. 갤러리 둘러보기

- 홈 페이지 하단 "다른 사람들의 세계 탐험하기" 클릭
- 또는 `/gallery` 직접 접속
- 썸네일 클릭으로 세계 입장

## 🗂️ 프로젝트 구조

```
tarotaros-worlds/
├── app/
│   ├── page.tsx                    # ✅ 홈 - 프롬프트 입력
│   ├── explore/[id]/page.tsx       # ✅ WebXR 탐험
│   ├── gallery/page.tsx            # ✅ 세계 갤러리
│   └── api/
│       └── world/
│           ├── create/route.ts     # ✅ 월드 생성 API
│           ├── [id]/route.ts       # ✅ 월드 조회 API
│           └── gallery/route.ts    # ✅ 갤러리 API
│
├── components/
│   └── WorldViewer.tsx             # ✅ WebXR 뷰어
│
├── lib/
│   ├── ai/
│   │   └── image-generator.ts      # ✅ DALL-E 이미지 생성
│   ├── prisma.ts                   # ✅ DB 클라이언트
│   ├── auth.ts                     # ✅ JWT 인증
│   └── ...
│
└── prisma/
    ├── schema.prisma               # ✅ DB 스키마
    └── dev.db                      # ✅ SQLite DB
```

## 🔍 API 엔드포인트

### POST /api/world/create
월드 생성

```json
Request:
{
  "prompt": "폐허가 된 도서관...",
  "title": "optional"
}

Response:
{
  "success": true,
  "data": {
    "worldId": "clxxx...",
    "title": "폐허가 된 도서관...",
    "status": "ready"
  }
}
```

### GET /api/world/[id]
월드 조회 (조회수 자동 증가)

```json
Response:
{
  "success": true,
  "data": {
    "id": "clxxx...",
    "title": "...",
    "imageUrl": "https://...",
    "viewCount": 42,
    ...
  }
}
```

### GET /api/world/gallery
갤러리 목록

```
Query params:
- sort: recent | popular | views
- tag: filter by tag
- page: pagination
- limit: items per page

Response:
{
  "success": true,
  "data": {
    "worlds": [...],
    "total": 10,
    "hasMore": false
  }
}
```

## 💡 핵심 기술

### AI 이미지 생성
- **OpenAI DALL-E 3**: 360° 파노라마 이미지
- 프롬프트 엔지니어링으로 equirectangular projection 생성
- Wide format (1792x1024) 지원

### WebXR
- **React Three Fiber**: Three.js의 React 래퍼
- **@react-three/drei**: 유용한 헬퍼 컴포넌트
- **@react-three/xr**: WebXR VR/AR 지원

### 데이터베이스
- **Prisma + SQLite**: 로컬 개발용
- 프로덕션에서는 PostgreSQL로 전환 가능

## 🎯 현재 상태

### ✅ 완료
- 프롬프트 입력 UI
- AI 360° 이미지 생성
- WebXR 뷰어
- 탐험 페이지
- 갤러리 페이지
- 전체 플로우 통합
- 에러 처리
- 로딩 상태

### ⏳ 향후 개선 사항
- [ ] 사용자 인증 (현재는 anonymous)
- [ ] 좋아요 기능
- [ ] 댓글 기능
- [ ] 공유 링크 (QR 코드)
- [ ] 태그 필터링
- [ ] 3D 오브젝트 추가
- [ ] 배경 음악
- [ ] 월드 간 포털
- [ ] 프로덕션 배포 (Vercel)

## 🐛 알려진 이슈

1. **이미지 생성 시간**: DALL-E API가 느릴 수 있음 (10-30초)
   - 해결: 백그라운드 작업으로 처리 필요

2. **WebXR 브라우저 지원**: 일부 브라우저에서만 VR 모드 작동
   - Chrome, Edge, Firefox Reality 권장

3. **이미지 품질**: DALL-E가 360° 파노라마를 완벽하게 생성하지 못할 수 있음
   - 프롬프트 개선 필요

## 📱 테스트 방법

### 로컬 테스트
```bash
# 1. 개발 서버 시작
npm run dev

# 2. 브라우저에서 http://localhost:3000 접속

# 3. 프롬프트 입력 후 세계 생성

# 4. 탐험 페이지에서 확인
```

### VR 테스트
1. VR 헤드셋 연결 (Quest, Vive 등)
2. WebXR 지원 브라우저 사용
3. 탐험 페이지에서 "VR 모드" 클릭

## 🚀 다음 단계

1. **프롬프트 입력하고 테스트**
   ```
   예시: "안개 낀 숲속 호수가에 신비로운 문이 서있다"
   ```

2. **갤러리에서 기존 세계 둘러보기**
   - 이미 3개의 샘플 세계가 시드 데이터로 존재

3. **WebXR VR 모드 테스트**
   - VR 헤드셋이 있다면 실제 VR 체험 가능

4. **프로덕션 배포 준비**
   - Vercel에 배포
   - PostgreSQL (Neon) 연결
   - 환경 변수 설정

---

**축하합니다! MVP가 완성되었습니다! 🎉**

이제 http://localhost:3000 에서 직접 체험해보세요!
