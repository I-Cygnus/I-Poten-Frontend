# 1단계: 빌드
FROM node:20 AS builder
WORKDIR /app

COPY . .

# workspace: 프로토콜 변환
RUN find . -name "package.json" -type f -exec sed -i 's/"workspace:\*"/"*"/g' {} \;

# package-lock.json 제거 후 설치
RUN rm -f package-lock.json && npm install --legacy-peer-deps

# 공통 패키지 빌드
RUN npm -ws run build -w @jobspoon/theme-bridge -w @jobspoon/app-state

# lerna를 사용한 나머지 빌드
RUN npm run build

# 2단계: Nginx
FROM nginx:alpine

COPY docker/nginx.conf /etc/nginx/nginx.conf
RUN rm -f /etc/nginx/conf.d/default.conf

COPY --from=builder /app/main-container/dist /usr/share/nginx/html/html-container
COPY --from=builder /app/mypage-app/dist /usr/share/nginx/html/mypage-app
COPY --from=builder /app/navigation-bar-app/dist /usr/share/nginx/html/navigation-bar-app
COPY --from=builder /app/studyroom-app/dist /usr/share/nginx/html/studyroom-app
COPY --from=builder /app/vue-account-app/dist /usr/share/nginx/html/vue-account-app
COPY --from=builder /app/vue-ai-interview-app/dist /usr/share/nginx/html/vue-ai-interview-app
COPY --from=builder /app/poten-word-app/dist /usr/share/nginx/html/spoon-word-app

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
