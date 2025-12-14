# 베이스 이미지를 선택 (Node.js 20버전을 사용하는 예)
FROM node:22.14.0

# 작업 디렉터리를 설정 (컨테이너 내부)
WORKDIR /app

# 로컬의 패키지 파일들을 컨테이너로 복사
COPY package*.json ./
COPY joint-plus.tgz ./

# 필요한 패키지 설치
RUN npm ci
#RUN npm run bulid

# 애플리케이션 파일들을 모두 복사
COPY . .

# 환경변수 설정
#ENV NODE_ENV=production
ENV NODE_ENV=test

# 애플리케이션의 포트를 지정
EXPOSE 3000

# 애플리케이션 실행 명령어
CMD ["npm", "run", "start"]