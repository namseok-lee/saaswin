# Step 1: Base Image 설정 (OpenJDK 사용)
FROM gradle:8.10.2-jdk21 as build

# Step 2: 작업 디렉토리 설정 및 Gradle 빌드 수행
WORKDIR /app
COPY . .
RUN gradle clean build -x check

# Step 3: Base Image 설정 (Tomcat 10.1.30 버전)
FROM tomcat:10.1.30-jdk21

# Step 4: 환경 변수 설정
# JAVA_OPTS로 환경 변수 설정 (예: dev 환경)
#ENV JAVA_OPTS="-Dspring.profiles.active=dev -Djava.security.egd=file:/dev/./urandom -Xms256m -Xmx512m"
ENV JAVA_OPTS="-Dspring.profiles.active=dev"

# Step 5: 애플리케이션의 WAR 파일 복사
# Gradle을 사용하여 빌드한 WAR 파일을 Tomcat 웹앱 디렉토리에 복사합니다.
COPY --from=build /app/build/libs/SaaSwin.war /usr/local/tomcat/webapps/

# Step 6: Tomcat 포트 노출
EXPOSE 9001

# Step 7: Tomcat 시작
CMD ["catalina.sh", "run"]
