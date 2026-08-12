---
title: "PayIn H2H: по шагам — не рекомендуется"
description: "Сложный сценарий, в котором метод выбирается после создания ордера"
---

> **Сложный сценарий — не рекомендуется для новых интеграций.** Используйте его
> только если ордер необходимо создать до выбора способа оплаты. В остальных
> случаях выбирайте [H2H с реквизитами сразу](/doc/v2/h2h-sync/) или
> [Redirect](/doc/v2/red/).

Используйте этот сценарий, если клиент остаётся на UI магазина, но способ оплаты
выбирает после создания ордера.

## Сценарий

1. Создайте [`POST /shop/orders`](/doc/api/payin/02-orders/#post-shoporders) без `payment`.
2. Получите [`GET /shop/trade-methods`](/doc/api/shop/04-dictionaries/#получение-методов) и покажите доступные методы.
3. В статусе `new` передайте выбор через [`PATCH /shop/orders/{id}`](/doc/api/payin/04-actions/#patch-shopordersid).
4. Вызовите [`POST /shop/orders/{id}/start-payment`](/doc/api/payin/04-actions/#post-shopordersidstart-payment).
5. Покажите клиенту `amount` и `requisites`.
6. После перевода вызовите [`POST /shop/orders/{id}/confirm-payment`](/doc/api/payin/04-actions/#post-shopordersidconfirm-payment).
7. Дождитесь `completed` через callback.

Назначение кодов описано в [справочнике `payment.type`](/doc/api/shop/05-payment-types/).
Допустимые для магазина сочетания `paymentType + bank` всегда берите из
[`GET /shop/trade-methods`](/doc/api/shop/04-dictionaries/#получение-методов).

## Частые ошибки

| Ошибка | Что делать |
| --- | --- |
| `O10001` при `start-payment` | Передайте через `PATCH` [`payment.type`](/doc/api/shop/05-payment-types/) из [актуального списка методов](/doc/api/shop/04-dictionaries/#получение-методов), затем повторите старт |
| `O10000` при `PATCH`, старте или подтверждении | Прочитайте ордер: действие уже выполнено либо текущий статус его не допускает |
| `O10005` или реквизиты не появились | Предложите другой согласованный метод/банк; не подтверждайте перевод без реквизитов |
| Таймаут create (`S10002`) | Найдите ордер по `externalOrderId`; не создавайте дубль |
| Повторный callback | Обработайте идемпотентно и ответьте HTTP `200` |

- [Создание ордера](/doc/api/payin/02-orders/)
- [PATCH, start-payment и confirm-payment](/doc/api/payin/04-actions/)
- [Методы и поля](/doc/api/shop/04-dictionaries/)
