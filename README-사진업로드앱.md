# 📷 현장 사진 업로드 앱

핸드폰으로 현장 사진 4장을 쉽게 업로드하고 관리할 수 있는 모바일 최적화 웹 앱입니다.

## 🎯 주요 기능

### 1. 사진 업로드 (upload.html)
- ✅ **4장 필수 업로드**: 정확히 4장의 사진을 업로드
- 📷 **모바일 카메라 지원**: 직접 촬영 또는 갤러리에서 선택
- 🖼️ **실시간 미리보기**: 업로드 전 사진 확인
- 🗑️ **개별 삭제**: 각 사진을 개별적으로 삭제 가능
- 📍 **위치 정보**: GPS 자동 감지 또는 지도에서 직접 선택
- 📝 **작업 정보**: 작업자명, 프로젝트명, 메모 입력
- 📊 **진행률 표시**: 업로드 진행 상황 실시간 표시
- 💾 **Firebase Storage**: 클라우드 저장소에 안전하게 보관

### 2. 사진 갤러리 (gallery.html)
- 📑 **카드형 레이아웃**: 보기 좋은 그리드 레이아웃
- 🔍 **필터링**: 프로젝트, 작업자, 날짜별 필터
- 📊 **통계 정보**: 총 업로드 수, 총 사진 수, 프로젝트 수
- 🔎 **상세보기**: 각 업로드의 상세 정보와 모든 사진 확인
- 🗑️ **삭제 기능**: 업로드 전체 삭제
- 🗺️ **위치 확인**: 지도에서 촬영 위치 확인
- 🖼️ **사진 확대**: 각 사진을 새 탭에서 확대 보기

### 3. 위치 선택 (map.html)
- 🗺️ **OpenLayers 지도**: 오픈스트리트맵 기반
- 📍 **현재 위치 자동 감지**: GPS 자동 감지
- 🖱️ **클릭으로 위치 선택**: 지도에서 직접 위치 선택
- 🏠 **주소 표시**: 역지오코딩으로 주소 자동 표시

## 📱 화면 구성

```
📷 사진 업로드 (upload.html)
├─ 📋 작업 정보 입력
│  ├─ 작업자 이름 *
│  ├─ 프로젝트명 *
│  ├─ 작업 메모
│  └─ 📍 위치 정보
├─ 📸 사진 선택 (4장)
│  ├─ 슬롯 1 [📷]
│  ├─ 슬롯 2 [📷]
│  ├─ 슬롯 3 [📷]
│  └─ 슬롯 4 [📷]
└─ ⬆️ 업로드 버튼

🖼️ 사진 갤러리 (gallery.html)
├─ 🔍 필터 (프로젝트/작업자/날짜)
├─ 📊 통계 (업로드/사진/프로젝트)
└─ 📑 갤러리 카드 목록
   └─ [클릭] → 상세보기 모달
      ├─ 작업 정보
      ├─ 📍 위치 (지도 보기)
      ├─ 📸 사진 4장 (확대 보기)
      └─ 🗑️ 삭제 버튼
```

## 🛠️ 기술 스택

### 프론트엔드
- **HTML5**: 시맨틱 마크업, File API
- **CSS3**: Flexbox, Grid, 반응형 디자인
- **JavaScript (ES6+)**: 비동기 처리, 이벤트 핸들링

### 백엔드/클라우드
- **Firebase Firestore**: 메타데이터 저장 (NoSQL 데이터베이스)
- **Firebase Storage**: 사진 파일 저장 (클라우드 스토리지)

### 외부 라이브러리
- **Firebase SDK 10.7.1**: 클라우드 서비스 연동
- **OpenLayers 8.2.0**: 지도 표시 및 위치 선택
- **Nominatim API**: 역지오코딩 (좌표 → 주소)

## 📂 파일 구조

```
qna1/
├─ upload.html           # 사진 업로드 페이지
├─ upload-script.js      # 업로드 로직
├─ upload-style.css      # 업로드 스타일
├─ gallery.html          # 갤러리 페이지
├─ gallery-script.js     # 갤러리 로직
├─ gallery-style.css     # 갤러리 스타일
├─ map.html              # 지도 선택 페이지 (기존)
├─ index.html            # Q&A 게시판 (기존)
├─ script.js             # Q&A 로직 (기존)
└─ style.css             # Q&A 스타일 (기존)
```

## 🚀 사용 방법

### 1. 사진 업로드하기
1. `upload.html`을 모바일 브라우저에서 열기
2. 작업자 이름과 프로젝트명 입력 (필수)
3. 작업 메모 입력 (선택)
4. 위치 정보 확인 (자동 감지됨) 또는 "📍 위치 선택" 버튼으로 수동 선택
5. "📷 사진 촬영/선택" 버튼 클릭
6. 카메라로 촬영하거나 갤러리에서 사진 선택 (최대 4장)
7. 미리보기에서 사진 확인 (불필요한 사진은 ❌ 버튼으로 삭제)
8. 4장이 모두 선택되면 "⬆️ 사진 업로드하기" 버튼 활성화
9. 업로드 버튼 클릭하여 업로드
10. 업로드 완료 후 자동으로 갤러리로 이동

### 2. 갤러리에서 확인하기
1. `gallery.html`에서 업로드된 사진 확인
2. 프로젝트, 작업자, 날짜로 필터링
3. 카드 클릭하여 상세보기
4. 사진 클릭하여 확대 보기
5. 필요시 삭제 가능

### 3. 위치 선택하기
1. "📍 위치 선택" 버튼 클릭
2. 팝업 창에서 지도 표시
3. 지도 클릭하여 위치 선택
4. 주소 자동 표시
5. "위치 확인" 버튼으로 저장

## 🔧 Firebase 설정

### Firestore 컬렉션 구조
```javascript
photoUploads (컬렉션)
└─ [문서 ID] (자동 생성)
   ├─ workerName: "홍길동"
   ├─ projectName: "250211-영덕(27)-설치"
   ├─ workNote: "1층 작업 완료"
   ├─ location: {
   │     lat: "37.5665",
   │     lon: "126.9780",
   │     address: "서울특별시 중구 세종대로 110"
   │  }
   ├─ photoUrls: [
   │     "https://storage.../photo_1.jpg",
   │     "https://storage.../photo_2.jpg",
   │     "https://storage.../photo_3.jpg",
   │     "https://storage.../photo_4.jpg"
   │  ]
   ├─ photoCount: 4
   ├─ uploadDate: "2025-10-28T10:30:00.000Z"
   ├─ timestamp: Timestamp
   ├─ dateFolder: "2025-10-28"
   └─ uploadId: "1730109000000_홍길동"
```

### Firebase Storage 구조
```
photos/
└─ 2025-10-28/                    # 날짜 폴더
   └─ 250211-영덕(27)-설치/        # 프로젝트 폴더
      └─ 1730109000000_홍길동/     # 업로드 ID 폴더
         ├─ photo_1_1730109000000.jpg
         ├─ photo_2_1730109000000.jpg
         ├─ photo_3_1730109000000.jpg
         └─ photo_4_1730109000000.jpg
```

### Firestore 보안 규칙 설정
Firebase Console에서 다음 규칙을 설정하세요:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // photoUploads 컬렉션: 읽기/쓰기 모두 허용 (개발 단계)
    match /photoUploads/{document=**} {
      allow read, write: if true;
    }
    
    // questions 컬렉션: 읽기/쓰기 모두 허용 (기존)
    match /questions/{document=**} {
      allow read, write: if true;
    }
  }
}
```

### Firebase Storage 보안 규칙 설정
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // photos 폴더: 읽기/쓰기 모두 허용 (개발 단계)
    match /photos/{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

⚠️ **주의**: 위 규칙은 개발/테스트용입니다. 프로덕션에서는 인증 및 권한 검증을 추가하세요.

## 📱 모바일 최적화

### 터치 최적화
- 모든 버튼: 최소 48px 높이 (Apple/Google 권장사항)
- 터치 영역 충분히 확보
- 터치 피드백 (active 상태)

### 반응형 디자인
- 모바일 우선 (Mobile-First)
- 세로/가로 모드 모두 지원
- 태블릿, 데스크톱 호환

### 성능 최적화
- 이미지 lazy loading
- 최소한의 HTTP 요청
- CSS 애니메이션 최적화
- Firebase CDN 활용

## 🎨 디자인 특징

### 색상 팔레트
- **Primary**: #667eea → #764ba2 (보라 그라디언트)
- **Success**: #11998e → #38ef7d (민트 그라디언트)
- **Danger**: #f093fb → #f5576c (핑크 그라디언트)
- **Secondary**: #f0f0f0 (회색)

### 아이콘
- 이모지 사용 (유니버설, 크로스 플랫폼)
- 직관적인 시각적 피드백

### 애니메이션
- Smooth transitions (0.3s ease)
- Hover/Active states
- Loading indicators
- Slide-in notifications

## 🔐 보안 고려사항

### 현재 구현 (개발 단계)
- Firebase 보안 규칙: 모든 읽기/쓰기 허용
- 클라이언트 사이드 검증만 존재

### 프로덕션 권장사항
1. **인증 추가**: Firebase Authentication 연동
2. **보안 규칙 강화**: 인증된 사용자만 접근
3. **파일 크기 제한**: Storage 규칙에 10MB 제한 추가
4. **파일 타입 검증**: 이미지 파일만 허용
5. **Rate Limiting**: 과도한 업로드 방지
6. **HTTPS 강제**: 모든 통신 암호화

## 📊 데이터 흐름

```
사용자 → upload.html
  ↓
정보 입력 + 사진 선택 (4장)
  ↓
upload-script.js
  ↓
1. Firebase Storage에 사진 업로드
2. 업로드 URL 받기
3. Firestore에 메타데이터 저장
  ↓
gallery.html로 리다이렉트
  ↓
gallery-script.js
  ↓
Firestore에서 데이터 로드
  ↓
갤러리 카드 표시
```

## 🐛 트러블슈팅

### 사진이 업로드되지 않아요
- Firebase Storage 규칙 확인
- 브라우저 콘솔에서 에러 확인
- 네트워크 연결 확인
- 파일 크기 확인 (10MB 이하)

### 위치 정보가 감지되지 않아요
- 브라우저 위치 권한 확인
- HTTPS 연결 확인 (HTTP는 위치 API 제한)
- 수동으로 "📍 위치 선택" 사용

### 갤러리에 사진이 보이지 않아요
- Firestore 규칙 확인
- 브라우저 콘솔 에러 확인
- 페이지 새로고침

### 모바일에서 카메라가 실행되지 않아요
- 브라우저 카메라 권한 확인
- HTTPS 연결 확인
- 다른 브라우저 시도 (Chrome, Safari)

## 🚀 향후 개선 사항

### 기능 추가
- [ ] 사진 편집 기능 (회전, 자르기)
- [ ] 사진 압축 (업로드 전)
- [ ] 다중 업로드 (4장 이상)
- [ ] 댓글 기능
- [ ] 좋아요 기능
- [ ] PDF 리포트 생성

### UX 개선
- [ ] 드래그 앤 드롭 정렬
- [ ] 사진 순서 변경
- [ ] 오프라인 지원 (PWA)
- [ ] 푸시 알림
- [ ] 다크모드

### 성능 최적화
- [ ] 이미지 썸네일 생성 (Cloud Functions)
- [ ] 무한 스크롤
- [ ] 캐싱 전략
- [ ] CDN 활용

## 📞 문의 및 지원

문제가 발생하거나 기능 추가가 필요하시면 개발자에게 문의하세요.

---

**개발 환경**: Firebase (qna2-ljweng)  
**버전**: 1.0.0  
**최종 업데이트**: 2025-10-28  
**라이선스**: MIT

