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
# 전체 소스 복사
# -------------------------
COPY . .

# workspace: 프로토콜 변환
RUN find . -name "package.json" -type f -exec sed -i 's/"workspace:\*"/"*"/g' {} \;

# 의존성 설치
RUN rm -f package-lock.json && npm install --legacy-peer-deps

# 공통 패키지 빌드
RUN npm -ws run build -w @jobspoon/theme-bridge -w @jobspoon/app-state

# sveltekit-review-app 제외하고 빌드
RUN npm run build:remotes && npm run build:host

# 2단계: Nginx
FROM nginx:alpine

COPY docker/nginx.conf /etc/nginx/nginx.conf
RUN rm -f /etc/nginx/conf.d/default.conf

# 빌드 결과물 복사
COPY --from=builder /app/main-container/dist /usr/share/nginx/html/html-container
COPY --from=builder /app/mypage-app/dist /usr/share/nginx/html/mypage-app
COPY --from=builder /app/navigation-bar-app/dist /usr/share/nginx/html/navigation-bar-app
COPY --from=builder /app/vue-account-app/dist /usr/share/nginx/html/vue-account-app
COPY --from=builder /app/vue-ai-interview-app/dist /usr/share/nginx/html/vue-ai-interview-app
COPY --from=builder /app/poten-word-app/dist /usr/share/nginx/html/poten-word-app

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
