# 1단계: 빌드
FROM node:20 AS builder

WORKDIR /app

# 소스 전체 복사
COPY . .
# 먼저 모든 의존성 설치
RUN npm install

# 공통 패키지 빌드
RUN npm -ws run build -w @jobspoon/theme-bridge -w @jobspoon/app-state


# 각 앱 빌드 (npx를 사용하여 로컬 바이너리 실행)
RUN cd main-container && npx rspack build && cd .. \
  && cd navigation-bar-app && npx rspack build && cd .. \
  && cd vue-account-app && npx rspack build && cd .. \
  && cd vue-ai-interview-app && npx rspack build && cd .. \
  && cd studyroom-app && npx rspack build && cd .. \
  && cd mypage-app && npx rspack build && cd .. \
  && cd spoon-word-app && npx rspack build && cd ..


# 2단계: Nginx
FROM nginx:alpine

# nginx 설정 복사
COPY docker/nginx.conf /etc/nginx/nginx.conf

# 기본 conf 제거 (중요!)
RUN rm -f /etc/nginx/conf.d/default.conf

# 각 앱 dist를 nginx 경로에 맞게 복사
COPY --from=builder /app/main-container/dist /usr/share/nginx/html/html-container
COPY --from=builder /app/mypage-app/dist /usr/share/nginx/html/mypage-app
COPY --from=builder /app/navigation-bar-app/dist /usr/share/nginx/html/navigation-bar-app
COPY --from=builder /app/studyroom-app/dist /usr/share/nginx/html/studyroom-app
#COPY --from=builder /app/svelte-review-app/dist /usr/share/nginx/html/svelte-review-app
COPY --from=builder /app/vue-account-app/dist /usr/share/nginx/html/vue-account-app
COPY --from=builder /app/vue-ai-interview-app/dist /usr/share/nginx/html/vue-ai-interview-app
COPY --from=builder /app/spoon-word-app/dist /usr/share/nginx/html/spoon-word-app

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
