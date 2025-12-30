# Stage 1: Build
FROM oven/bun:latest AS build
WORKDIR /app
COPY user/package.json user/bun.lockb* ./ 
RUN rm -rf /root/.bun/install/cache && bun install --timeout 0
RUN bun install
COPY user/ . 
RUN bun run build

# Stage 2: Run
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]