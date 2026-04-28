---
title: "PayIn H2H sync requisites"
description: "Сценарий, где реквизиты нужны сразу в ответе"
---

`PayIn H2H sync requisites` используется, когда клиент остаётся на вашем интерфейсе, метод оплаты известен заранее, а реквизиты нужно получить сразу в ответе на create-запрос.

Это исходный сценарий из оригинальной документации Марселя: мерчант заранее знает `payment.type` и `payment.bank`, создаёт ордер через `sync-requisites` и сразу получает реквизиты или ошибку, если реквизиты не найдены.

## Когда использовать

- клиент остаётся на вашем UI;
- метод оплаты известен заранее;
- банк уже выбран;
- реквизиты нужно получить сразу в ответе.

## Базовый flow

1. Прочитать доступные способы оплаты через `GET /public/api/v1/shop/trade-methods` <a href="[[DOMAIN_URL]]/public/api/payin#tag/v1shoptrade-methods/operation/ShopTradeMethodsController_getTradeMethods" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>.
2. Выбрать нужную связку `payment.type` и `payment.bank`.
3. Создать ордер через `POST /public/api/v1/shop/orders/sync-requisites` <a href="[[DOMAIN_URL]]/public/api/payin#tag/v1shoporders/operation/ShopOrdersControllerV1_createSyncRequisiteWithTimeout" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>.
4. Получить реквизиты или ошибку, если реквизиты не найдены.
5. После фактической оплаты вызвать `POST /public/api/v1/shop/orders/{id}/confirm-payment` <a href="[[DOMAIN_URL]]/public/api/payin#tag/v1shoporders/operation/ShopOrdersControllerV1_confirmPayment" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>.
6. Зафиксировать финальный статус по callback или по `GET /public/api/v1/shop/orders/{id}` <a href="[[DOMAIN_URL]]/public/api/payin#tag/v1shoporders/operation/ShopOrdersControllerV1_findOne" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a> / `GET /public/api/v1/shop/orders/external/{externalOrderId}` <a href="[[DOMAIN_URL]]/public/api/payin#tag/v1shoporders/operation/ShopOrdersControllerV1_findOneByExternalOrderId" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>.

## Что делает магазин

- читает `GET /public/api/v1/shop/trade-methods` <a href="[[DOMAIN_URL]]/public/api/payin#tag/v1shoptrade-methods/operation/ShopTradeMethodsController_getTradeMethods" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a> перед построением UI;
- создаёт ордер через `POST /public/api/v1/shop/orders/sync-requisites` <a href="[[DOMAIN_URL]]/public/api/payin#tag/v1shoporders/operation/ShopOrdersControllerV1_createSyncRequisiteWithTimeout" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a> уже с заполненными `payment.type` и `payment.bank`;
- показывает клиенту фактический `amount` и реквизиты из ответа;
- подтверждает оплату через `POST /public/api/v1/shop/orders/{id}/confirm-payment` <a href="[[DOMAIN_URL]]/public/api/payin#tag/v1shoporders/operation/ShopOrdersControllerV1_confirmPayment" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a> только после реального действия клиента;
- хранит `externalOrderId`, `id`, `status` и статус доставки callback.

## Поля запроса

### Что передаётся в `sync-requisites`

| Поле | Статус | Комментарий |
| --- | --- | --- |
| `amount` | обязательное | Сумма ордера в фиатной валюте |
| `currency` | обязательное | Фиатная валюта |
| `customer.id` | обязательное | Идентификатор клиента на стороне мерчанта |
| `customer.ip` | опциональное | Сейчас не обязательно, но лучше передавать |
| `customer.fingerprint` | опциональное | Сейчас не обязательно, но лучше передавать |
| `integration.externalOrderId` | опциональное, но рекомендуется | Ваш идентификатор операции |
| `integration.callbackUrl` | опциональное | URL для callback |
| `integration.callbackMethod` | опциональное | `get` или `post` |
| `integration.returnUrl` | опциональное | URL возврата клиента |
| `payment.type` | обязательное | Выбранный клиентом тип оплаты |
| `payment.bank` | опциональное | Выбранный банк, если он нужен методу |

Если для конкретного метода банк обязателен, ориентируйтесь на `trade methods`, а не на общую таблицу.

## Что важно

- `POST /public/api/v1/shop/orders/sync-requisites` <a href="[[DOMAIN_URL]]/public/api/payin#tag/v1shoporders/operation/ShopOrdersControllerV1_createSyncRequisiteWithTimeout" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a> нужен именно для сценария “реквизиты сразу”.
- Если реквизиты не найдены, типичная ошибка: `404` и `O10005`.
- Клиенту нужно показывать фактический `amount`, а не только `initialAmount`.
- После таймаута create-запроса нельзя сразу создавать новый ордер: сначала ищите его через `GET /public/api/v1/shop/orders/external/{externalOrderId}` <a href="[[DOMAIN_URL]]/public/api/payin#tag/v1shoporders/operation/ShopOrdersControllerV1_findOneByExternalOrderId" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>.
- Callback-обработчик должен быть идемпотентным.

## Куда идти дальше

- [Примеры API](/doc/v2/examples/#payin-h2h-sync-requisites)
- [PayIn: статусы и переходы](/doc/v2/payin-statuses/)
- [PayIn: диспуты](/doc/v2/payin-disputes/)
- [PayIn: чеки](/doc/v2/payin-receipts/)
- [Выбор банка и типа оплаты](/doc/v2/payment-methods/)
- [Поля реквизитов и customerFields](/doc/v2/field-reference/)
- <a href="/doc/api/payin/02-orders/" target="_blank" rel="noopener noreferrer">PAYIN API: создание и список ордеров</a>
- <a href="/doc/api/payin/04-actions/" target="_blank" rel="noopener noreferrer">PAYIN API: действия над ордером</a>

