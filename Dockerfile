# =========================
# 1단계: Build
# =========================
FROM node:20 AS builder

WORKDIR /app

# -------------------------
# workspace에 있지만 실제 폴더 없는 경우 방어
# -------------------------
RUN test -d studyroom-app || \
  (mkdir -p studyroom-app && \
   printf '{"name":"studyroom-app","version":"0.0.0","private":true}' > studyroom-app/package.json)

RUN test -d packages/app-state || \
  (mkdir -p packages/app-state && \
   printf '{"name":"@jobspoon/app-state","version":"0.1.0","private":true}' > packages/app-state/package.json)

RUN test -d packages/theme-bridge || \
  (mkdir -p packages/theme-bridge && \
   printf '{"name":"@jobspoon/theme-bridge","version":"0.1.0","private":true}' > packages/theme-bridge/package.json)

# -------------------------
# 1. 의존성 메타데이터만 복사 (캐시 활용)
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

# ❌ package-lock.json 복사 금지 (Mac ARM64 지옥 방지)

# -------------------------
# 2. 의존성 설치 (Linux 환경 기준)
# -------------------------
# workspace:* 프로토콜을 npm 호환 형식으로 변경
RUN find . -name "package.json" -type f -exec sed -i 's/"workspace:\*"/"*"/g' {} \;

# 의존성 설치
RUN npm install --no-audit --no-fund

# -------------------------
# 3. 전체 소스 복사
# -------------------------
COPY . .

# -------------------------
# 3.5. 빌드 시점 환경변수 (GitHub Actions에서 --build-arg로 전달)
# -------------------------
ARG REACT_POTEN_WORD_APP
ARG REACT_NAVIGATION_APP
ARG REACT_MYPAGE_APP
ARG VUE_ACCOUNT_APP
ARG VUE_AI_INTERVIEW_APP
ARG REACT_STUDYROOM_APP
ARG MFE_PUBLIC_SERVICE
ARG REACT_APP_API_BASE_URL

# -------------------------
# 4. 빌드 (ARG를 RUN 명령 시점에 환경변수로 전달)
# -------------------------
RUN REACT_POTEN_WORD_APP=${REACT_POTEN_WORD_APP} \
    REACT_NAVIGATION_APP=${REACT_NAVIGATION_APP} \
    REACT_MYPAGE_APP=${REACT_MYPAGE_APP} \
    VUE_ACCOUNT_APP=${VUE_ACCOUNT_APP} \
    VUE_AI_INTERVIEW_APP=${VUE_AI_INTERVIEW_APP} \
    REACT_STUDYROOM_APP=${REACT_STUDYROOM_APP} \
    MFE_PUBLIC_SERVICE=${MFE_PUBLIC_SERVICE} \
    REACT_APP_API_BASE_URL=${REACT_APP_API_BASE_URL} \
    npm -ws run build -w @jobspoon/theme-bridge -w @jobspoon/app-state \
  && REACT_POTEN_WORD_APP=${REACT_POTEN_WORD_APP} \
    REACT_NAVIGATION_APP=${REACT_NAVIGATION_APP} \
    REACT_MYPAGE_APP=${REACT_MYPAGE_APP} \
    VUE_ACCOUNT_APP=${VUE_ACCOUNT_APP} \
    VUE_AI_INTERVIEW_APP=${VUE_AI_INTERVIEW_APP} \
    REACT_STUDYROOM_APP=${REACT_STUDYROOM_APP} \
    MFE_PUBLIC_SERVICE=${MFE_PUBLIC_SERVICE} \
    REACT_APP_API_BASE_URL=${REACT_APP_API_BASE_URL} \
    npm run build -w main-container \
  && MFE_PUBLIC_SERVICE=${REACT_NAVIGATION_APP} \
    npm run build -w navigation-bar-app \
  && MFE_PUBLIC_SERVICE=${VUE_ACCOUNT_APP} \
    npm run build -w vue-account-app \
  && MFE_PUBLIC_SERVICE=${VUE_AI_INTERVIEW_APP} \
    npm run build -w vue-ai-interview-app \
  && MFE_PUBLIC_SERVICE=${REACT_MYPAGE_APP} \
    npm run build -w mypage-app \
  && MFE_PUBLIC_SERVICE=${MFE_PUBLIC_SERVICE} \
    REACT_APP_API_BASE_URL=${REACT_APP_API_BASE_URL} \
    npm run build -w poten-word-app

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
COPY --from=builder /app/navigation-bar-app/dist /usr/share/nginx/html/navigation-bar-app
COPY --from=builder /app/vue-account-app/dist /usr/share/nginx/html/vue-account-app
COPY --from=builder /app/vue-ai-interview-app/dist /usr/share/nginx/html/vue-ai-interview-app
COPY --from=builder /app/mypage-app/dist /usr/share/nginx/html/mypage-app
COPY --from=builder /app/poten-word-app/dist /usr/share/nginx/html/poten-word-app

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
