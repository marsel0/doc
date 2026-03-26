---
title: "PAYIN: обзор для магазина"
description: "Как выбрать сценарий, как живёт ордер и что важно магазину"
---

Эта страница описывает `payin` только с точки зрения магазина: какой сценарий выбрать, как проходит ордер, что считать финалом и какие данные важно сохранять у себя.

За сценарными `curl`-примерами идите в [PAYIN: сценарии и curl-примеры](/doc/payin/02-integration/). За полным reference по merchant endpoint-ам идите в [PAYIN API](/doc/api/payin/01-overview/).

## 1. С чего начать

### Минимальный маршрут интеграции

1. Проверить доступ магазина и `signatureKey` через [Shop API](/doc/api/shop/01-overview/).
2. Прочитать `GET /shop/trade-methods`.
3. Выбрать один из трёх payin-сценариев.
4. Передавать уникальный `integration.externalOrderId`.
5. Подключить callback и оставить `GET /shop/orders/{id}` или `GET /shop/orders/external/{externalOrderId}` как резервный канал контроля.

### Какой сценарий выбрать

| Сценарий | Когда использовать | Ключевые endpoint-ы |
| --- | --- | --- |
| `Redirect` | Нужен самый быстрый запуск, а UI можно отдать платформе | `POST /shop/orders` |
| `H2H sync` | Метод оплаты известен заранее и реквизиты нужны сразу | `POST /shop/orders/sync-requisites` |
| `H2H step-by-step` | Метод и банк клиент выбирает уже после создания ордера | `POST /shop/orders` -> `PATCH /shop/orders/{id}` -> `POST /shop/orders/{id}/start-payment` |

## 2. Как проходит PAYIN

### Redirect

1. Магазин создаёт ордер через `POST /shop/orders`.
2. Получает `integration.link`.
3. Переводит клиента на платёжную страницу.
4. Ждёт callback или читает ордер по `GET`.

### H2H с реквизитами сразу

1. Магазин читает `GET /shop/trade-methods`.
2. Создаёт ордер через `POST /shop/orders/sync-requisites`.
3. Сразу получает `requisites` или `404/O10005`.
4. После оплаты вызывает `POST /shop/orders/{id}/confirm-payment`.

### H2H по шагам

1. Магазин создаёт базовый ордер через `POST /shop/orders`.
2. В статусе `new` записывает `payment.type` и `payment.bank`.
3. Вызывает `POST /shop/orders/{id}/start-payment`.
4. Ждёт `customer_confirm`, показывает реквизиты и после оплаты вызывает `confirm-payment`.

## 3. Как живёт ордер

### Что делает магазин

- передаёт `amount`, `currency` и `customer.id`;
- использует уникальный `integration.externalOrderId`;
- перед H2H читает `GET /shop/trade-methods`;
- показывает клиенту `amount` и `requisites` из ответа;
- вызывает `confirm-payment`, когда клиент реально оплатил;
- отменяет ордер, если платёж больше не нужен;
- при необходимости открывает и закрывает `dispute`.

### Что делает платформа

- подбирает реквизиты;
- двигает ордер по статусам;
- отправляет callback;
- закрывает ордер по timeout;
- переводит спорные кейсы в `dispute`.

### Что считается финалом

- `completed`
- `cancelled`
- `dispute`
- `error`

Промежуточные статусы и все поля ордера описаны в [PAYIN API: обзор](/doc/api/payin/01-overview/).

## 4. Что хранить у себя

### Идентификаторы и суммы

- внутренний `id` ордера;
- ваш `integration.externalOrderId`;
- `initialAmount` и фактический `amount`;
- выбранные `payment.type` и `payment.bank`, если вы строите H2H flow.

### Статус и доставка callback

- `status`;
- `statusDetails`;
- `statusTimeoutAt`;
- `integration.callbackUrlStatus`.

Если create-запрос закончился `S10002`, не создавайте новый ордер вслепую: сначала ищите его по `externalOrderId`.

## 5. Что важно

- Магазин не ставит статусы вручную, а вызывает endpoint-ы.
- В H2H не хардкодьте поля реквизитов: ориентируйтесь на `GET /shop/trade-methods`.
- Показывайте клиенту `amount`, а не только `initialAmount`.
- После `S10002` сначала дочитайте ордер по `externalOrderId`.
- Callback-обработчик должен быть идемпотентным.
- В merchant API `dispute` открывается по уже отменённому ордеру.

## 6. Куда идти дальше

- [PAYIN: сценарии и curl-примеры](/doc/payin/02-integration/)
- [PAYIN API: создание и список ордеров](/doc/api/payin/02-orders/)
- [PAYIN API: чтение ордеров](/doc/api/payin/03-read/)
- [PAYIN API: действия над ордером](/doc/api/payin/04-actions/)
- [PAYIN API: payment fields и receipts](/doc/api/payin/05-receipts-and-fields/)
- [PAYIN API: dispute](/doc/api/payin/06-disputes/)
