# LAN ARENA

Чистая версия LAN ARENA для публикации по схеме **GitHub → Render**.

## Что внутри

- тот же интерфейс LAN ARENA: главная, турниры, матчи, команды, игроки, прогнозы, The International;
- регистрация зрителей и игроков;
- вход по email/username;
- серверные HttpOnly-сессии;
- отдельный вход администратора через переменные окружения;
- панель организатора;
- команды, заявки, приглашения, турниры, check-in, сетка и результаты;
- LAN Points и прогнозы;
- PostgreSQL на Render для постоянного хранения данных;
- локальный JSON используется только при запуске без `DATABASE_URL` на компьютере.

## Локальный запуск

```bash
npm install
npm run dev
```

Или на Windows запусти `run-site.bat`.

Для локальной БД PostgreSQL не обязательна. Локальные данные сохраняются в `data/lan-arena.local.json` и не попадают в Git.

## Переменные окружения

Скопируй `.env.example` в `.env.local` для локального PostgreSQL или создай переменные в Render:

```env
DATABASE_URL=postgresql://...
# Необязательно: можно переопределить встроенную админку
ADMIN_EMAIL=admin@lanarena.ru
ADMIN_PASSWORD=mishalanarena
```

По умолчанию учебная админка: `admin@lanarena.ru` / `mishalanarena`. Эти данные видны в публичном репозитории. Для реального проекта обязательно замени пароль через `ADMIN_PASSWORD` в Render.

## Публикация

Подробно: `DEPLOY-RENDER.md`.
