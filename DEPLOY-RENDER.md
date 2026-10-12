# Публикация LAN ARENA на Render

## 1. GitHub

Создай новый пустой репозиторий и загрузи **содержимое этой папки** в корень репозитория.
Не загружай ZIP одним файлом.

## 2. PostgreSQL на Render

В Render создай **PostgreSQL** базу.
После создания скопируй **Internal Database URL**.

## 3. Web Service

Создай новый **Web Service** → подключи GitHub-репозиторий LAN ARENA.

Настройки:

- Runtime: `Node`
- Build Command: `npm install && npm run build`
- Start Command: `npm start`

Добавь Environment Variables:

- `DATABASE_URL` = Internal Database URL из Render PostgreSQL
- `ADMIN_EMAIL` и `ADMIN_PASSWORD` можно не добавлять для учебного деплоя. По умолчанию: `admin@lanarena.ru` / `mishalanarena`. Если хочешь сменить их, добавь переменные в Render.
- `NODE_VERSION` = `20.19.0`

Не вставляй пароль в код или README.

## 4. Deploy

Нажми Deploy. При первом запросе сайт сам создаст в PostgreSQL таблицу `lan_arena_state` и начальные данные.

Проверка сервера:

`https://ТВОЙ-САЙТ.onrender.com/api/health`

Должен вернуться JSON с `"ok": true`.

После этого проверь:

1. `/register` — зарегистрировать новый аккаунт;
2. выйти и снова войти через `/login`;
3. войти админом: `admin@lanarena.ru` / `mishalanarena` (если не переопределял переменные в Render);
4. открыть `/organizer`.

