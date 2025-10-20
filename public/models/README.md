# 3D Models Directory

이 폴더에는 TAROTAROS 프로젝트에서 사용하는 3D 모델 파일(.glb, .gltf)이 저장됩니다.

## 📁 폴더 구조

```
models/
├── vehicles/       # 차량 모델
│   ├── car.glb
│   ├── truck.glb
│   └── ambulance.glb
├── characters/     # 인물 모델
│   ├── person.glb
│   └── doctor.glb
├── buildings/      # 건물 모델
│   ├── building.glb
│   ├── hospital.glb
│   └── office.glb
└── props/          # 기타 오브젝트
    ├── tree.glb
    ├── traffic_light.glb
    └── bench.glb
```

## 🆓 무료 3D 모델 다운로드 소스

### 1. **Poly Pizza** (추천)
- URL: https://poly.pizza
- 라이선스: CC0 (상업적 이용 가능, 크레딧 불필요)
- 특징: 구 Google Poly의 후속, 깨끗하고 최적화된 모델

### 2. **Quaternius**
- URL: https://quaternius.com/assets.html
- 라이선스: CC0
- 특징: 저폴리곤 게임용 모델, 통일된 스타일

### 3. **Kenney Assets**
- URL: https://kenney.nl/assets
- 라이선스: CC0
- 특징: 게임 에셋, 다양한 카테고리

### 4. **Sketchfab** (Free 필터 적용)
- URL: https://sketchfab.com/3d-models?features=downloadable&sort_by=-likeCount
- 라이선스: 모델별 확인 필요 (CC BY, CC0 필터 사용)
- 특징: 고품질 모델, 다양한 스타일

### 5. **CGTrader Free**
- URL: https://www.cgtrader.com/free-3d-models
- 라이선스: 모델별 확인 필요
- 특징: 전문가 수준의 모델

## 📥 다운로드 및 설치 방법

### 1. 모델 다운로드
```bash
# 예시: Poly Pizza에서 차량 모델 다운로드
# 1. https://poly.pizza 방문
# 2. "car" 검색
# 3. 마음에 드는 모델 선택
# 4. "Download GLB" 클릭
```

### 2. 파일 배치
```bash
# 다운로드한 파일을 적절한 폴더에 저장
# 예: car-low-poly.glb → public/models/vehicles/car.glb
mv ~/Downloads/car-low-poly.glb public/models/vehicles/car.glb
```

### 3. 코드에서 사용
```typescript
// lib/ai/scene-generator.ts에서 모델 경로 지정
{
  type: 'car',
  modelPath: '/models/vehicles/car.glb',  // 추가
  position: [0, 0, 0],
  scale: [1, 1, 1],
  rotation: [0, 0, 0],
  color: '#ff0000'
}
```

## 🎨 추천 모델 리스트

### 차량 (vehicles/)
- [ ] car.glb - 일반 승용차
- [ ] truck.glb - 트럭
- [ ] ambulance.glb - 구급차
- [ ] police_car.glb - 경찰차

### 인물 (characters/)
- [ ] person.glb - 일반인
- [ ] doctor.glb - 의사
- [ ] patient.glb - 환자
- [ ] office_worker.glb - 사무직 직원

### 건물 (buildings/)
- [ ] building.glb - 일반 건물
- [ ] hospital.glb - 병원
- [ ] office.glb - 사무실 빌딩
- [ ] house.glb - 주택

### 기타 (props/)
- [ ] tree.glb - 나무
- [ ] traffic_light.glb - 신호등
- [ ] bench.glb - 벤치
- [ ] lamp_post.glb - 가로등
- [ ] road_sign.glb - 도로 표지판

## ⚙️ 모델 최적화 팁

### 1. 파일 크기 줄이기
```bash
# gltf-pipeline 설치
npm install -g gltf-pipeline

# GLB 압축
gltf-pipeline -i input.glb -o output.glb -d
```

### 2. 폴리곤 수 확인
- 저폴리곤 추천: 500-5000 폴리곤
- 너무 많으면 성능 저하

### 3. 텍스처 크기
- 최대 1024x1024 권장
- 웹 최적화 위해 2K 이하 유지

## 🔧 현재 Fallback 시스템

모델 파일이 없어도 작동합니다:
- `car` → 개선된 박스 조합 (차체 + 바퀴)
- `person` → 캡슐 + 구체 (몸통 + 머리)
- `building` → 박스 + 창문 패턴
- `tree` → 실린더 + 구체 (줄기 + 나뭇잎)

모델 파일을 추가하면 자동으로 실제 모델로 교체됩니다!

## 📝 라이선스 주의사항

- CC0: 완전 자유 사용, 크레딧 불필요
- CC BY: 크레딧 표시 필요
- CC BY-SA: 크레딧 + 동일 조건 공유
- 상업적 사용 가능 여부 확인 필수

## 🚀 빠른 시작 (추천 모델)

### Poly Pizza에서 바로 다운로드:

1. **차량**: https://poly.pizza/?s=car
2. **사람**: https://poly.pizza/?s=person
3. **건물**: https://poly.pizza/?s=building
4. **나무**: https://poly.pizza/?s=tree

각 카테고리에서 저폴리곤, CC0 라이선스 모델을 선택하세요!
