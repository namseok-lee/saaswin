# 이니시스 빌링키 발급 API

## 개요
이니시스 빌링키 발급을 위한 Spring Boot 백엔드 API입니다. JavaScript 코드를 Java로 변환하여 구현되었습니다.

## API 엔드포인트

### 1. 빌링키 발급 요청
**POST** `/api/inicis/billing/create`

#### 요청 파라미터
```json
{
  "mid": "INIBillTst",           // 상점아이디 (선택, 기본값: INIBillTst)
  "oid": "ORDER_123456789",      // 주문번호 (필수)
  "price": "1",                  // 결제금액 (선택, 기본값: 1)
  "goodname": "화이트정보통신 데모신청", // 상품명 (선택, 기본값: 화이트정보통신 데모신청)
  "buyername": "신승록",          // 구매자명 (선택, 기본값: 신승록)
  "buyertel": "010-1234-5678",   // 구매자 휴대폰번호 (선택, 기본값: 010-1234-5678)
  "buyeremail": "dustn0234@win.co.kr" // 구매자 이메일주소 (선택, 기본값: dustn0234@win.co.kr)
}
```

#### 응답
```json
{
  "success": true,
  "message": null,
  "paymentUrl": "https://stgstdpay.inicis.com/stdjs/INIStdPay.js?...",
  "params": {
    "version": "1.0",
    "gopaymethod": "",
    "mid": "INIBillTst",
    "oid": "ORDER_123456789",
    "price": "1",
    "timestamp": "1750327616797",
    "use_chkfake": "Y",
    "signature": "...",
    "verification": "...",
    "mKey": "...",
    "offerPeriod": "Y2",
    "charset": "UTF-8",
    "currency": "WON",
    "goodname": "화이트정보통신 데모신청",
    "buyername": "신승록",
    "buyertel": "010-1234-5678",
    "buyeremail": "dustn0234@win.co.kr",
    "languageView": "ko",
    "returnUrl": "http://localhost:3000/inicis/return",
    "closeUrl": "http://localhost:3000/inicis/cancel",
    "acceptmethod": "BILLAUTH(Card):CLOSE"
  }
}
```

### 2. 빌링키 발급 파라미터 디버깅
**GET** `/api/inicis/billing/debug`

#### 요청 파라미터 (Query String)
```
?oid=ORDER_123456789&price=1&goodname=화이트정보통신 데모신청&buyername=신승록
```

#### 응답
```json
{
  "signKey": "SU5JTElURV9UUklQTEVERVNfS0VZU1RS",
  "timestamp": "1750327616797",
  "signString": "oid=ORDER_123456789&price=1&timestamp=1750327616797",
  "verificationString": "oid=ORDER_123456789&price=1&signKey=SU5JTElURV9UUklQTEVERVNfS0VZU1RS&timestamp=1750327616797",
  "signature": "...",
  "verification": "...",
  "mKey": "...",
  "paymentParams": { ... }
}
```

## 사용 예시

### cURL 테스트
```bash
# 빌링키 발급 요청
curl -X POST http://localhost:8080/api/inicis/billing/create \
  -H "Content-Type: application/json" \
  -d '{
    "oid": "ORDER_123456789",
    "price": "1",
    "goodname": "화이트정보통신 데모신청",
    "buyername": "신승록"
  }'

# 디버깅 요청
curl "http://localhost:8080/api/inicis/billing/debug?oid=ORDER_123456789&price=1"
```

### JavaScript 테스트
```javascript
// 빌링키 발급 요청
fetch('/api/inicis/billing/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    oid: 'ORDER_123456789',
    price: '1',
    goodname: '화이트정보통신 데모신청',
    buyername: '신승록'
  })
})
.then(response => response.json())
.then(data => {
  if (data.success) {
    // 이니시스 결제창으로 리다이렉트
    window.location.href = data.paymentUrl;
  } else {
    console.error('빌링키 발급 실패:', data.message);
  }
});

// 디버깅 요청
fetch('/api/inicis/billing/debug?oid=ORDER_123456789&price=1')
.then(response => response.json())
.then(data => {
  console.log('디버깅 정보:', data);
});
```

## 주요 기능

1. **서명 생성**: SHA-256 해시를 사용한 signature, verification, mKey 생성
2. **파라미터 검증**: 필수 파라미터(oid) 검증
3. **기본값 설정**: 선택적 파라미터에 대한 기본값 제공
4. **URL 인코딩**: 이니시스 결제창 URL 생성 시 파라미터 인코딩
5. **에러 처리**: 상세한 에러 메시지 및 로깅
6. **디버깅 지원**: 파라미터 생성 과정을 확인할 수 있는 디버깅 엔드포인트

## 수정된 주요 사항

### 1. 타임스탬프 형식
- **이전**: `yyyyMMddHHmmss` 형식
- **현재**: Unix timestamp (밀리초)

### 2. 해시 알고리즘
- **이전**: MD5
- **현재**: SHA-256

### 3. 파라미터 변경
- `gopaymethod`: `Card:Directbank:vbank` → `""` (빈 값)
- `acceptmethod`: `HPP(1):below1000:BILLAUTH(Card):centerCd(Y)` → `BILLAUTH(Card):CLOSE`
- `returnUrl`: `/inicis/billing/result` → `/inicis/return`
- `closeUrl`: `/inicis/billing/close` → `/inicis/cancel`
- 추가된 파라미터: `offerPeriod`, `charset`, `languageView`

## 설정

### 테스트 환경
- **상점아이디**: `INIBillTst`
- **서명키**: `SU5JTElURV9UUklQTEVERVNfS0VZU1RS`
- **결제창 URL**: `https://stgstdpay.inicis.com/stdjs/INIStdPay.js`

### 프로덕션 환경
실제 운영 시에는 다음 설정을 변경해야 합니다:
- 상점아이디 (mid)
- 서명키 (signKey)
- 결제창 URL
- returnUrl, closeUrl

## 파일 구조

```
src/main/java/saas/win/SaaSwin/inicis/
├── controller/
│   └── InicisController.java          # 메인 컨트롤러
├── dto/
│   ├── InicisBillingCreateRequestDTO.java   # 요청 DTO
│   └── InicisBillingCreateResponseDTO.java  # 응답 DTO
└── service/
    └── InicisBillingService.java      # 기존 빌링 서비스
```

## 주의사항

1. **보안**: 실제 운영 시 서명키는 환경변수나 설정 파일로 관리
2. **URL 설정**: returnUrl, closeUrl은 실제 프론트엔드 URL로 변경
3. **테스트**: 테스트 환경에서만 사용 가능한 설정값들
4. **로깅**: 상세한 로그가 출력되므로 운영 시 로그 레벨 조정 필요
5. **해시 알고리즘**: SHA-256을 사용하므로 이니시스 측에서도 동일한 알고리즘을 사용하는지 확인 