---
title: "Обзор проекта simple-pay"
description: "Краткая карта сервисов и локальной инфраструктуры simple-pay"
---

Эта страница описывает, из каких приложений состоит репозиторий `simple-pay` и как соотнести их с разделами документации в `doc`.

## Основные приложения

### Frontend

- `platform-frontend` - основной кабинет платформы для ролей `admin`, `operator`, `merchant`, `trader`.
- `sci-frontend` - платёжный интерфейс, который видит конечный пользователь.
- `demo-frontend` - внутренний фронт для эмуляции магазина и проверки merchant-интеграции.

### Backend

- `backend/apps/platform` - основной backend платформы и внутренних кабинетов.
- `backend/apps/public` - публичный merchant API, на который ссылаются разделы `payin`, `payout` и `api/shop`.
- `backend/apps/cron` - фоновые задачи, webhooks, автоматизация и периодические процессы.
- `backend/apps/data` - выгрузки и сервисные data-сценарии.
- `backend/apps/bots` - интеграции с ботами и сервисной автоматизацией.
- `demo-backend` - демонстрационный backend для локальной и внутренней проверки сценариев магазина.
- `currency-exchange-backend` - сервис получения и агрегации курсов валют.

## Локальные адреса из репозитория

| Сервис | URL |
| --- | --- |
| `platform-frontend` | `http://localhost:3010` |
| `sci-frontend` | `http://localhost:3011` |
| `demo-frontend` | `http://localhost:3012` |
| `platform-backend` | `http://localhost:3030` |
| `public-backend` | `http://localhost:3031` |
| `cron-backend` | `http://localhost:3032` |
| `data-backend` | `http://localhost:3033` |
| `demo-backend` | `http://localhost:3040` |
| `currency-exchange-backend` | `http://localhost:3050` |

## Инфраструктура

- `PostgreSQL` используется как основная база данных и по умолчанию работает на `5432`.
- `Redis` используется для кэша и вспомогательных сценариев и по умолчанию работает на `6379`.
- `nginx` маршрутизирует запросы между frontend и backend сервисами.
- Для production-развёртывания в репозитории есть Helm chart в папке `simple-pay/Chart`.

## Как это связано с документацией

- Разделы [PAYIN](/doc/payin/01-redirect_integration/) и [PAYOUT](/doc/payout/01-integration/) описывают merchant-сценарии поверх `public-backend`.
- Разделы [PAYIN API](/doc/api/payin/01-overview/), [PAYOUT API](/doc/api/payout/01-overview/) и [Shop API](/doc/api/shop/01-overview/) документируют merchant endpoint-ы.
- Раздел [System API](/doc/api/system/01-overview/) относится к внутренним и сервисным endpoint-ам платформы.

## Когда какой сервис нужен

- Если вы внедряете оплату или выплаты со стороны магазина, основной контур для вас - `public-backend`.
- Если вы дорабатываете кабинеты сотрудников или мерчанта, основной контур - `platform-frontend` и `backend/apps/platform`.
- Если вы проверяете пользовательский сценарий оплаты, нужен `sci-frontend`.
- Если вы разбираете фоновые процессы, webhook-доставку или автоматизацию, смотрите `backend/apps/cron`.
