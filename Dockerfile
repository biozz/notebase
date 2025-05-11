FROM golang:1.24-alpine AS backend
WORKDIR /app/
COPY . .
RUN go build -o bin/notebase .

FROM node:22-alpine AS frontend
WORKDIR /app
RUN corepack enable
COPY ./web/package.json ./web/pnpm-lock.yaml ./
RUN pnpm install
COPY ./web ./
RUN pnpm run generate

FROM alpine:3.19
WORKDIR /app/
COPY --from=backend /app/bin/notebase .
COPY --from=frontend /app/.output/public/ ./pb_public
ENTRYPOINT ["./notebase"]
