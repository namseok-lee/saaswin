import 'dotenv/config'; // .env 파일 → process.env 로드
import Fastify from 'fastify';
import cors from '@fastify/cors';
import sswRoute0002 from './routes/ssw/0002';

const fastify = Fastify({
    logger: true,
});

// CORS 설정
fastify.register(cors, {
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'access_token',
        'refresh_token',
        'rprs_ognz_no',
        'x-requested-with',
    ],
    credentials: true,
});

// Health check 엔드포인트
fastify.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
});

// SSW 라우트 등록
fastify.register(sswRoute0002);

// 서버 시작
const start = async () => {
    try {
        const port = Number(process.env.PORT) || 4000;
        await fastify.listen({ port, host: '0.0.0.0' });
        console.log(`Server running on http://localhost:${port}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
