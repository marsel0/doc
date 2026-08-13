---
title: "PayIn H2H: по шагам — не рекомендуется"
description: "Сложный сценарий, в котором метод выбирается после создания PayIn-ордера"
---

> **Сложный сценарий — не рекомендуется для новых интеграций.** Используйте его
> только если PayIn-ордер необходимо создать до выбора способа оплаты. В остальных
> случаях выбирайте [H2H с реквизитами сразу](/doc/v2/h2h-sync/) или
> [Redirect](/doc/v2/red/).

Используйте этот сценарий, если клиент остаётся на странице магазина, но способ оплаты
выбирает после создания PayIn-ордера.

## Сценарий

1. Создайте [`POST /shop/orders`](/doc/api/payin/02-orders/#post-shoporders) без `payment`.
2. Получите [`GET /shop/trade-methods`](/doc/api/shop/04-dictionaries/#получение-методов) и покажите доступные методы.
3. В статусе `new` передайте выбор через [`PATCH /shop/orders/{id}`](/doc/api/payin/04-actions/#patch-shopordersid).
4. Вызовите [`POST /shop/orders/{id}/start-payment`](/doc/api/payin/04-actions/#post-shopordersidstart-payment).
5. Покажите клиенту `amount` и `requisites`.
6. После перевода вызовите [`POST /shop/orders/{id}/confirm-payment`](/doc/api/payin/04-actions/#post-shopordersidconfirm-payment).
7. Дождитесь уведомления со статусом `completed`.

Назначение кодов описано в [справочнике `payment.type`](/doc/api/shop/05-payment-types/).
Сочетания `paymentType + bank` можно получить от платформы, хранить в собственном
таблице кодов или запросить через
[`GET /shop/trade-methods`](/doc/api/shop/04-dictionaries/#получение-методов).

## Частые ошибки

| Ошибка | Что делать |
| --- | --- |
| `O10001` при `start-payment` | Передайте через `PATCH` согласованный [`payment.type`](/doc/api/shop/05-payment-types/); при необходимости [получите методы через API](/doc/api/shop/04-dictionaries/#получение-методов), затем повторите старт |
| `O10000` при `PATCH`, старте или подтверждении | Прочитайте PayIn-ордер: действие уже выполнено либо текущий статус его не допускает |
| `O10005` или реквизиты не появились | Предложите другой согласованный метод/банк; не подтверждайте перевод без реквизитов |
| Таймаут создания (`S10002`) | Найдите PayIn-ордер по `externalOrderId`; не создавайте дубль |
| Уведомление пришло повторно | Не выполняйте действие второй раз и ответьте HTTP `200` |

- [Создание PayIn-ордера](/doc/api/payin/02-orders/)
- [PATCH, start-payment и confirm-payment](/doc/api/payin/04-actions/)
- [Методы и поля](/doc/api/shop/04-dictionaries/)
