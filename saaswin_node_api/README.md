# SaaSwin Node API

Fastify 기반 API 서버 (Next.js API Routes에서 전환)

## 기술 스택

- **Runtime**: Node.js
- **Framework**: Fastify
- **Language**: TypeScript
- **Database**: PostgreSQL

## 설치

```bash
npm install
```

## 환경 설정

프로젝트 루트에 `.env.development` 파일 생성:

```
DB_HOST=your_db_host
DB_PORT=5432
DB_NAME=your_db_name
DB_USER=your_db_user
DB_PASSWORD=your_db_password
PORT=4000
```

## 실행

```bash
# 개발 서버
npm run dev

# 빌드
npm run build

# 프로덕션 실행
npm start
```

## API 엔드포인트

| Method | URL | 설명 |
|--------|-----|------|
| GET | `/health` | 헬스체크 |
| POST | `/api/ssw/0002` | X타입 화면 공통 API |

## 프로젝트 구조

```
src/
├── index.ts          # 서버 진입점
├── lib/
│   └── db.ts         # DB 연결 풀 & 함수 실행
└── routes/
    └── ssw/
        └── 0002.ts   # X타입 화면 공통 API
```

