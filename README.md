# SmartLink / OneQR Platform

Production-minded MVP платформа для smart-редиректов и QR-кодов.

Один короткий URL и один QR-код направляют пользователя на нужную цель в зависимости от платформы:

- iOS → App Store URL
- Android → Google Play URL
- Desktop/Web → fallback web URL

Дополнительно поддерживаются: аналитика, срок действия, лимит кликов, Turnstile captcha и админ-панель.

---

## 1) Технологический стек

- Next.js (App Router) + React + TypeScript (strict)
- TailwindCSS
- Prisma ORM
- PostgreSQL
- Zod
- Cloudflare Turnstile
- `qrcode`
- Cookie-based auth (кастомная credentials/session схема)
- Docker + Docker Compose

---

## 2) Что реализовано

### Smart Links

- Создание/редактирование/удаление smart-ссылок
- Поля:
  - `title`
  - `description` (optional)
  - `slug` (unique, auto/custom)
  - `iosUrl`, `androidUrl`, `webUrl`
  - `deepLinkUrl` (optional)
  - `isActive`
  - `expiresAt` (optional)
  - `maxClicks` (optional)
  - `captchaEnabled`
  - `captchaMode` (`off | always`)

### Redirect flow

Для публичного URL (по умолчанию `/:slug`, либо `/<LINK_PREFIX>/:slug` если задан `LINK_PREFIX`):

1. Поиск ссылки по slug
2. Проверка существования
3. Проверка `isActive`
4. Проверка `expiresAt`
5. Проверка `maxClicks`
6. Если включена captcha — переход на `/captcha/:slug` (или `/<LINK_PREFIX>/captcha/:slug` при включенном префиксе)
7. Детект платформы из User-Agent
8. Редирект на целевой URL
9. Запись события клика в аналитику

### Analytics

По каждому клику хранится:

- `smartLinkId`, `clickedAt`
- `platform`, `os`, `browser`, `deviceType`
- `userAgent`, `referrer`, `country`
- `ipHash` (raw IP не хранится)
- `isUnique`
- `captchaPassed`
- `redirectTarget`

Уникальность (MVP-эвристика):

- `sha256(ip + userAgent + salt)`
- окно уникальности: 24 часа

В admin-аналитике добавлены Chart.js визуализации (без удаления существующих карточек/таблиц):

- `Clicks over time` (line): total vs unique клики за последние 7 дней
- `Platform distribution` (doughnut): iOS / Android / Web
- графики есть на dashboard и на странице деталей ссылки

### Admin Panel

- `/admin/login`
- `/admin` (dashboard)
- `/admin/links` (search + filters)
- `/admin/links/new`
- `/admin/links/[id]`
- `/admin/links/[id]/edit`
- После успешного логина используется полный переход на `/admin`, чтобы сессионная cookie гарантированно учитывалась сразу на первом заходе

Роли и права доступа:

- `admin`: видит все ссылки, может создавать/редактировать/удалять любые ссылки, смотреть stats/events по всем ссылкам.
- `user`: видит только свои ссылки, может создавать ссылки, редактировать/удалять только свои, смотреть stats/events только по своим.

User management (только для `admin`):

- список пользователей: `/admin/users`
- создание пользователя: `/admin/users/new`
- просмотр пользователя: `/admin/users/[id]`
- редактирование пользователя: `/admin/users/[id]/edit`
- через UI/API можно менять email, роль (`admin|user`), пароль и активность (`isActive`)

Модель ownership:

- каждая `SmartLink` имеет обязательного владельца (`ownerId`)
- при создании ссылки владелец всегда = текущий авторизованный пользователь
- серверные проверки выполняются и в страницах admin, и в admin API

Фильтры в списке ссылок:

- active/inactive
- captcha enabled/disabled
- expired/non-expired

### QR

- Генерация PNG/SVG
- Предпросмотр на странице деталей ссылки рендерится через стандартный `<img>` с `src=/api/qr/[slug]?format=png`
- Скачивание PNG/SVG

---

## 3) Структура проекта

```txt
prisma/
  schema.prisma
  seed.ts

src/
  app/
    (public)/status
    [slug]
    captcha/[slug]
    admin/*
    api/*
  components/
    admin/
    ui/
  features/
    analytics/
    auth/
    links/
  lib/
  server/
    repositories/
    schemas/
    services/
```

---

## 4) Переменные окружения

Создайте `.env` из шаблона:

```bash
cp .env.example .env
```

Минимально необходимые переменные:

- `DATABASE_URL`
- `APP_BASE_URL`
- `AUTH_SECRET`
- `APP_HASH_SALT`
- `TURNSTILE_SECRET_KEY`
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`

Для пользователей seed:

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `USER_EMAIL` (optional)
- `USER_PASSWORD` (optional)

Опционально:

- `LINK_PREFIX` — префикс публичных ссылок. Поддерживаются значения вида `prefix`, `/prefix`, `/prefix/`; внутри приложения нормализуется до `prefix`.

См. шаблон: [`.env.example`](.env.example)

---

## 5) Запуск локально (без Docker)

1. Установить зависимости:

```bash
npm install
```

2. Поднять PostgreSQL и проверить `DATABASE_URL`.

3. Сгенерировать Prisma client и применить схему:

```bash
npm run prisma:generate
npm run prisma:push
```

4. Создать админа:

```bash
npm run seed
```

5. Запустить приложение:

```bash
npm run dev
```

После запуска:

- App: `http://localhost:3000`
- Admin: `http://localhost:3000/admin/login`

---

## 6) Запуск через Docker

```bash
docker compose up --build
```

Сервисы:

- app: `http://localhost:3000`
- postgres: `localhost:5432`

Файлы Docker:

- [`Dockerfile`](Dockerfile)
- [`docker-compose.yml`](docker-compose.yml)
- [`.dockerignore`](.dockerignore)

---

## 7) Основные маршруты

### Public

- `GET /:slug` (по умолчанию, если `LINK_PREFIX` не задан)
- `GET /<LINK_PREFIX>/:slug` (если `LINK_PREFIX` задан)
- `GET /captcha/:slug` (по умолчанию)
- `GET /<LINK_PREFIX>/captcha/:slug` (если `LINK_PREFIX` задан)
- `GET /api/qr/[slug]?format=png|svg&download=1`
- `POST /api/public/captcha/verify`

### Admin pages

- `/admin/login`
- `/admin`
- `/admin/links`
- `/admin/links/new`
- `/admin/links/[id]`
- `/admin/links/[id]/edit`
- `/admin/users` (admin only)
- `/admin/users/new` (admin only)
- `/admin/users/[id]` (admin only)
- `/admin/users/[id]/edit` (admin only)

### Admin API

- `POST /api/admin/links`
- `GET /api/admin/links`
- `GET /api/admin/links/[id]`
- `PATCH /api/admin/links/[id]`
- `DELETE /api/admin/links/[id]`
- `GET /api/admin/links/[id]/stats`
- `GET /api/admin/links/[id]/events`
- `POST /api/admin/users`
- `GET /api/admin/users`
- `GET /api/admin/users/[id]`
- `PATCH /api/admin/users/[id]`

---

## 8) Prisma и БД

Схема: [`prisma/schema.prisma`](prisma/schema.prisma)

Модели:

- `SmartLink`
- `ClickEvent`
- `User` (`role: admin | user`, `isActive`)

Seed:

- [`prisma/seed.ts`](prisma/seed.ts)

---

## 9) Безопасность (MVP)

- raw IP не сохраняется
- URL/slug валидируются через Zod
- captcha верифицируется server-side
- админ-маршруты защищены cookie-сессией
- авторизация основана на роли пользователя и ownership ссылки (`ownerId`)
- management пользователей доступен только `admin`
- секреты не хардкодятся (через env)

---

## 10) Полезные команды

```bash
npm run dev
npm run build
npm run lint
npm run prisma:generate
npm run prisma:push
npm run prisma:migrate
npm run prisma:studio
npm run seed
```

Скрипты определены в [`package.json`](package.json).
