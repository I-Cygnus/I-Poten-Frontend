# 1단계: 빌드
FROM node:20 AS builder

WORKDIR /app

# 소스 전체 복사
COPY . .

# package.json workspaces에 포함되어 있지만 레포에 폴더가 없을 경우(npm install 실패 방지)
RUN test -d studyroom-app || (mkdir -p studyroom-app && printf '{"name":"studyroom-app","version":"0.0.0","private":true}' > studyroom-app/package.json)

# 먼저 모든 의존성 설치
RUN find . -name node_modules -type d -prune -exec rm -rf '{}' + \
  && npm install

# 공통 패키지 + 각 앱 빌드
RUN npm -ws run build -w @jobspoon/theme-bridge -w @jobspoon/app-state \
  && npm run build -w main-container \
  && npm run build -w navigation-bar-app \
  && npm run build -w vue-account-app \
  && npm run build -w vue-ai-interview-app \
  && npm run build -w mypage-app \
  && npm run build -w spoon-word-app


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
#COPY --from=builder /app/svelte-review-app/dist /usr/share/nginx/html/svelte-review-app
COPY --from=builder /app/vue-account-app/dist /usr/share/nginx/html/vue-account-app
COPY --from=builder /app/vue-ai-interview-app/dist /usr/share/nginx/html/vue-ai-interview-app
COPY --from=builder /app/poten-word-app/dist /usr/share/nginx/html/poten-word-app

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
