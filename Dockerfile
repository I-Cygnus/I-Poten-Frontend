# =========================
# 1단계: Build
# =========================
FROM node:20 AS builder

WORKDIR /app

# workspaces에 있지만 실제 폴더가 없는 경우 대비
RUN test -d studyroom-app || \
  (mkdir -p studyroom-app && \
   printf '{"name":"studyroom-app","version":"0.0.0","private":true}' > studyroom-app/package.json)

# -------------------------
# 1. 의존성 파일만 먼저 복사 (캐시 핵심)
# -------------------------
COPY package.json package-lock.json* ./

COPY main-container/package.json main-container/
COPY navigation-bar-app/package.json navigation-bar-app/
COPY vue-account-app/package.json vue-account-app/
COPY vue-ai-interview-app/package.json vue-ai-interview-app/
COPY mypage-app/package.json mypage-app/
COPY poten-word-app/package.json poten-word-app/
COPY packages/app-state/package.json packages/app-state/
COPY packages/theme-bridge/package.json packages/theme-bridge/

# -------------------------
# 2. 의존성 설치
# -------------------------
RUN npm install

# -------------------------
# 3. 전체 소스 복사
# -------------------------
COPY . .

# -------------------------
# 4. 빌드
# -------------------------
RUN npm -ws run build -w @jobspoon/theme-bridge -w @jobspoon/app-state \
  && npm run build -w main-container \
  && npm run build -w navigation-bar-app \
  && npm run build -w vue-account-app \
  && npm run build -w vue-ai-interview-app \
  && npm run build -w mypage-app \
  && npm run build -w poten-word-app


# =========================
# 2단계: Nginx
# =========================
FROM nginx:alpine

# 기본 설정 제거
RUN rm -f /etc/nginx/conf.d/default.conf

# nginx 설정 복사
COPY docker/nginx.conf /etc/nginx/nginx.conf

# 빌드 결과물 복사
COPY --from=builder /app/main-container/dist /usr/share/nginx/html/html-container
COPY --from=builder /app/mypage-app/dist /usr/share/nginx/html/mypage-app
COPY --from=builder /app/navigation-bar-app/dist /usr/share/nginx/html/navigation-bar-app
COPY --from=builder /app/vue-account-app/dist /usr/share/nginx/html/vue-account-app
COPY --from=builder /app/vue-ai-interview-app/dist /usr/share/nginx/html/vue-ai-interview-app
COPY --from=builder /app/poten-word-app/dist /usr/share/nginx/html/poten-word-app

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]