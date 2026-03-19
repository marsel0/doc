---
title: "PAYIN API"
description: "Все основные merchant-запросы для payin"
---

Папка `api/payin` содержит merchant API для приёма платежей.

Если вы интегрируетесь с нуля, минимальный сценарий такой:

1. проверить магазин через `GET /shop/info`;
2. получить методы через `GET /shop/trade-methods`;
3. создать ордер;
4. читать статусы через `GET`;
5. затем подключить callback и action-методы.

## Что входит

- создание и список ордеров;
- чтение ордера по `id` и `externalOrderId`;
- `update`, `start-payment`, `confirm-payment`, `cancel`;
- `payment-fields`, `receipts` и временные ссылки на чек;
- `dispute` и `dispute/cancel`;
- вспомогательные endpoint-ы.

## Что важно понимать

- ордер нельзя перевести в `completed` прямой записью статуса;
- статусы меняются через action-методы;
- для production лучше всегда передавать `externalOrderId`;
- если callback ещё не реализован, статусы можно читать по `GET`.

## Страницы

- [Создание и список ордеров](/doc/api/payin/02-orders/)
- [Чтение ордеров](/doc/api/payin/03-read/)
- [Действия над ордером](/doc/api/payin/04-actions/)
- [Payment fields и receipts](/doc/api/payin/05-receipts-and-fields/)
- [Dispute](/doc/api/payin/06-disputes/)
- [Вспомогательные endpoint-ы](/doc/api/payin/07-auxiliary/)
