# Stage 1: Build
FROM oven/bun:latest AS build
WORKDIR /app
COPY admin/package.json admin/bun.lockb* ./ 
RUN bun clean && bun install --timeout 0 --no-save
RUN bun install
COPY admin/ . 
RUN bun run build

# Stage 2: Production
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]