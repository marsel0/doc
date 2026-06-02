---
title: "PayIn Redirect"
description: "Сценарий, где клиент переходит на платёжную страницу simple-pay"
---

`PayIn Redirect` — это сценарий, в котором клиент может быть переадресован на платёжную страницу `simple-pay`. На стороне мерчанта остаётся создание ордера, хранение идентификаторов, приём callback и контроль итогового статуса.

Это самый короткий сценарий запуска, если не требуется строить собственный платёжный flow и показывать реквизиты на своей стороне.

## Когда использовать

- нужен быстрый запуск;
- UI оплаты можно отдать платформе;
- не требуется показывать реквизиты на стороне мерчанта;
- достаточно получить ссылку на оплату и отслеживать итоговый статус.

## Базовый flow

1. Магазин создаёт ордер.
2. В ответе получает `integration.link`.
3. Переводит клиента на платёжную страницу.
4. Ждёт callback или дочитывает ордер через `GET /public/api/v1/shop/orders/{id}` <a href="[[DOMAIN_URL]]/public/api/payin#tag/v1shoporders/operation/ShopOrdersControllerV1_findOne" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a> или `GET /public/api/v1/shop/orders/external/{externalOrderId}` <a href="[[DOMAIN_URL]]/public/api/payin#tag/v1shoporders/operation/ShopOrdersControllerV1_findOneByExternalOrderId" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>.
5. Завершает свою внутреннюю бизнес-операцию только после финального статуса.

## Что делает магазин

- создаёт ордер через `POST /public/api/v1/shop/orders` <a href="[[DOMAIN_URL]]/public/api/payin#tag/v1shoporders/operation/ShopOrdersControllerV1_create" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>;
- использует уникальный `externalOrderId`;
- сохраняет внутренний `id` ордера и ссылку на оплату;
- перенаправляет клиента по `integration.link`;
- принимает callback и проверяет `signature`;
- дочитывает ордер через `GET /public/api/v1/shop/orders/{id}` <a href="[[DOMAIN_URL]]/public/api/payin#tag/v1shoporders/operation/ShopOrdersControllerV1_findOne" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a> или `GET /public/api/v1/shop/orders/external/{externalOrderId}` <a href="[[DOMAIN_URL]]/public/api/payin#tag/v1shoporders/operation/ShopOrdersControllerV1_findOneByExternalOrderId" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>, если нужно перепроверить спорный кейс.

## Поля запроса

### Что передаётся при создании ордера

| Поле | Статус | Комментарий |
| --- | --- | --- |
| `amount` | обязательное | Сумма ордера в фиатной валюте |
| `currency` | обязательное | Фиатная валюта |
| `customer.id` | обязательное | Идентификатор клиента на стороне мерчанта |
| `customer.ip` | опциональное | Сейчас не обязательно, но лучше передавать |
| `customer.fingerprint` | опциональное | Сейчас не обязательно, но лучше передавать |
| `integration.externalOrderId` | опциональное, но рекомендуется | Ваш уникальный идентификатор операции |
| `integration.callbackUrl` | опциональное | URL для callback по статусам |
| `integration.callbackMethod` | опциональное | `get` или `post` |
| `integration.returnUrl` | опциональное | URL возврата клиента после redirect |

Для `Redirect` обычно не требуется заранее передавать `payment.type` и `payment.bank`: выбор сценария оплаты происходит на стороне платёжной страницы.

## Что делает платформа

- создаёт платёжный сценарий;
- отдаёт ссылку на оплату;
- ведёт ордер по внутреннему flow;
- отправляет callback при смене статуса;
- закрывает ордер по timeout или переводит его в финальный статус.

## Что важно

- `RED` не отменяет требования к callback: callback всё равно должен быть реализован.
- `externalOrderId` лучше считать обязательным.
- После таймаута create-запроса нельзя сразу создавать новый ордер без дочитывания.
- Финальный статус нужно фиксировать по callback или по `GET /public/api/v1/shop/orders/{id}` <a href="[[DOMAIN_URL]]/public/api/payin#tag/v1shoporders/operation/ShopOrdersControllerV1_findOne" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>, а не по факту редиректа клиента.
- Возврат клиента на сайт мерчанта и финальный статус ордера — это не одно и то же.

## Что хранить у себя

- внутренний `id` ордера;
- ваш `externalOrderId`;
- `integration.link`;
- `status`;
- `statusDetails`;
- статус доставки callback.

## Типовые риски

- считать возврат клиента подтверждением оплаты;
- не хранить `externalOrderId`;
- не проверять `signature` callback;
- повторно создавать ордер после таймаута ответа без дочитывания существующего.

## Куда идти дальше

 - [Примеры API](/doc/v2/examples/#payin-redirect)
- [PayIn: статусы и переходы](/doc/v2/payin-statuses/)
- [Callback и подпись](/doc/v2/callback-signature/)
- [Системная информация](/doc/v2/system-info/)
- <a href="/doc/api/payin/02-orders/" target="_blank" rel="noopener noreferrer">PAYIN API: создание и список ордеров</a>
- <a href="/doc/api/payin/03-read/" target="_blank" rel="noopener noreferrer">PAYIN API: чтение ордеров</a>

