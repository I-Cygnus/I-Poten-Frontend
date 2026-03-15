# 1단계: 빌드
FROM node:20 AS builder
WORKDIR /app

# 빌드 시점 환경변수 선언
ARG REACT_POTEN_WORD_APP
ARG REACT_NAVIGATION_APP
ARG REACT_MYPAGE_APP
ARG VUE_ACCOUNT_APP
ARG VUE_AI_INTERVIEW_APP
ARG MFE_PUBLIC_SERVICE
ARG NODE_OPTIONS

# 환경변수로 설정
ENV REACT_POTEN_WORD_APP=${REACT_POTEN_WORD_APP}
ENV REACT_NAVIGATION_APP=${REACT_NAVIGATION_APP}
ENV REACT_MYPAGE_APP=${REACT_MYPAGE_APP}
ENV VUE_ACCOUNT_APP=${VUE_ACCOUNT_APP}
ENV VUE_AI_INTERVIEW_APP=${VUE_AI_INTERVIEW_APP}
ENV MFE_PUBLIC_SERVICE=${MFE_PUBLIC_SERVICE}
ENV NODE_OPTIONS=${NODE_OPTIONS:-"--max-old-space-size=4096"}

# -------------------------
# 의존성 설치 최적화 (Layer Caching)
# -------------------------
# 루트 및 사용 중인 워크스페이스의 package.json만 먼저 복사
COPY package.json package-lock.json* ./
COPY main-container/package.json main-container/
COPY next-seo-app/package.json next-seo-app/
COPY navigation-bar-app/package.json navigation-bar-app/
COPY vue-account-app/package.json vue-account-app/
COPY vue-ai-interview-app/package.json vue-ai-interview-app/
COPY mypage-app/package.json mypage-app/
COPY poten-word-app/package.json poten-word-app/
COPY packages/app-state/package.json packages/app-state/
COPY packages/theme-bridge/package.json packages/theme-bridge/

# -------------------------
# workspace 방어 로직 (공통 패키지용)
# -------------------------
RUN mkdir -p packages/app-state packages/theme-bridge

# workspace: 프로토콜 변환 및 의존성 설치
# package-lock.json을 제거해 Linux ARM64 환경에서 플랫폼 네이티브 바이너리를 새로 resolve
RUN find . -name "package.json" -type f -exec sed -i 's/"workspace:\*"/"*"/g' {} \; && \
    rm -f package-lock.json && \
    npm install --legacy-peer-deps

# -------------------------
# 전체 소스 복사 및 빌드
# -------------------------
COPY . .

# 공통 패키지 빌드
RUN npm -ws run build -w @jobspoon/theme-bridge -w @jobspoon/app-state

# 각 앱 빌드
RUN npm run build:next-seo
RUN npm run build:remotes && npm run build:host

# 2단계: Nginx
FROM nginx:alpine

COPY docker/nginx.conf /etc/nginx/nginx.conf
RUN rm -f /etc/nginx/conf.d/default.conf

# 빌드 결과물 복사
COPY --from=builder /app/next-seo-app/out /usr/share/nginx/html/next-seo-app
COPY --from=builder /app/main-container/dist /usr/share/nginx/html/html-container
COPY --from=builder /app/mypage-app/dist /usr/share/nginx/html/mypage-app
COPY --from=builder /app/navigation-bar-app/dist /usr/share/nginx/html/navigation-bar-app
COPY --from=builder /app/vue-account-app/dist /usr/share/nginx/html/vue-account-app
COPY --from=builder /app/vue-ai-interview-app/dist /usr/share/nginx/html/vue-ai-interview-app
COPY --from=builder /app/poten-word-app/dist /usr/share/nginx/html/poten-word-app

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
