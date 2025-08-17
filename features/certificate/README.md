# Certificate Feature

이 폴더는 수출자동차품질인증서(ISO 17024) 관리 시스템의 핵심 기능들을 포함합니다.

## 파일 구조

```
features/certificate/
├── CertificateList.tsx          # 인증서 목록 컴포넌트
├── CertificateDetail.tsx        # 인증서 상세 보기 컴포넌트
├── CertificateService.tsx       # 인증서 관련 API 서비스
├── index.ts                     # 모든 컴포넌트와 서비스 export
└── README.md                    # 이 파일
```

## 주요 컴포넌트

### CertificateList

- 인증서 목록을 표시
- 검색 및 필터링 기능
- PDF 다운로드 기능
- 새 인증서 발급 요청 기능

### CertificateDetail

- 선택된 인증서의 상세 정보 표시
- 인증서 상태 및 만료일 정보
- PDF 다운로드 기능

## 주요 기능

### 인증서 관리

- 전체 인증서 조회
- ID별 단건 조회
- 발급기관별 조회
- 키워드 검색

### PDF 다운로드

- 인증서 PDF 파일 다운로드
- 파일명 자동 생성

### 상태 관리

- 인증서 유효성 확인
- 만료일까지 남은 일수 계산

## 사용법

```tsx
import {
  CertificateList,
  CertificateDetail,
  CertificateService
} from '@/features/certificate';

// 인증서 목록 표시
<CertificateList />

// 특정 인증서 상세 보기
<CertificateDetail certificateId={123} />

// 서비스 사용
const certificates = await CertificateService.getAllCertificates();
const isValid = CertificateService.isCertificateValid(certificate);
```

## API 엔드포인트

- `GET /certificates` - 전체 인증서 조회
- `GET /certificates/:id` - ID별 인증서 조회
- `GET /certificates/search?q=:keyword` - 키워드 검색
- `GET /certificates/issuer/:issuer` - 발급기관별 조회

## 의존성

- `@/components/ui/*` - UI 컴포넌트
- `@/lib/auth` - 인증 관련 훅
- `@/lib/apiClient` - API 클라이언트
- `sonner` - 토스트 알림
- `lucide-react` - 아이콘
