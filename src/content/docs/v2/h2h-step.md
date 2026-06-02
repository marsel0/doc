---
title: "PayIn H2H step-by-step"
description: "Сценарий, где способ оплаты выбирается после создания ордера"
---

`PayIn H2H step-by-step` используется, когда клиент остаётся на вашем интерфейсе, но способ оплаты выбирается уже после создания ордера.

Это исходный сценарий из оригинальной документации Марселя: сначала создаётся базовый ордер, потом в него записывается выбранный способ оплаты, затем отдельно запускается поиск реквизитов и после оплаты вызывается подтверждение.

## Когда использовать

- клиент остаётся на вашем UI;
- способ оплаты выбирается позже;
- банк может выбираться после создания ордера;
- вы хотите разделить шаги интерфейса.

## Базовый flow

1. Создать базовый ордер через `POST /public/api/v1/shop/orders` <a href="[[DOMAIN_URL]]/public/api/payin#tag/v1shoporders/operation/ShopOrdersControllerV1_create" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>.
2. В статусе `new` записать `payment.type` и `payment.bank` через `PATCH /public/api/v1/shop/orders/{id}` <a href="[[DOMAIN_URL]]/public/api/payin#tag/v1shoporders/operation/ShopOrdersControllerV1_update" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>.
3. Запустить поиск реквизитов через `POST /public/api/v1/shop/orders/{id}/start-payment` <a href="[[DOMAIN_URL]]/public/api/payin#tag/v1shoporders/operation/ShopOrdersControllerV1_startPayment" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>.
4. Получить реквизиты и показать их клиенту.
5. После оплаты вызвать `POST /public/api/v1/shop/orders/{id}/confirm-payment` <a href="[[DOMAIN_URL]]/public/api/payin#tag/v1shoporders/operation/ShopOrdersControllerV1_confirmPayment" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>.
6. Зафиксировать финальный статус по callback или по `GET /public/api/v1/shop/orders/{id}` <a href="[[DOMAIN_URL]]/public/api/payin#tag/v1shoporders/operation/ShopOrdersControllerV1_findOne" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a> / `GET /public/api/v1/shop/orders/external/{externalOrderId}` <a href="[[DOMAIN_URL]]/public/api/payin#tag/v1shoporders/operation/ShopOrdersControllerV1_findOneByExternalOrderId" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>.

## Что делает магазин

- создаёт базовый ордер без выбранного метода;
- отдельно сохраняет выбор клиента;
- запускает выдачу реквизитов только после выбора метода;
- подтверждает оплату после фактического действия клиента;
- хранит `externalOrderId`, `id`, выбранные `payment.type` и `payment.bank`, статус и callback-статус.

## Поля запроса

### Шаг 1. Создание базового ордера

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
| `integration.returnUrl` | опциональное | Если нужен возврат клиента |

### Шаг 2. Обновление ордера через `PATCH`

| Поле | Статус | Комментарий |
| --- | --- | --- |
| `payment.type` | обязательное | Тип оплаты |
| `payment.bank` | обязательное | Банк для перевода |
| `payment.customerBank` | опциональное | Банк клиента |
| `payment.customerName` | опциональное | Имя держателя счёта или карты |

Дальше состав полей может расширяться конкретным методом оплаты. Источник истины для этого — `trade methods`.

## Что важно

- `POST /public/api/v1/shop/orders/{id}/start-payment` <a href="[[DOMAIN_URL]]/public/api/payin#tag/v1shoporders/operation/ShopOrdersControllerV1_startPayment" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a> нельзя вызывать до заполнения `payment.type`.
- Если действие не подходит текущему статусу, сначала дочитайте ордер.
- После таймаута create-запроса нельзя сразу создавать новый ордер: сначала дочитайте его через `GET /public/api/v1/shop/orders/external/{externalOrderId}` <a href="[[DOMAIN_URL]]/public/api/payin#tag/v1shoporders/operation/ShopOrdersControllerV1_findOneByExternalOrderId" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>.
- Callback-обработчик должен быть идемпотентным.

## Куда идти дальше

- [Примеры API](/doc/v2/examples/#payin-h2h-step-by-step)
- [PayIn: статусы и переходы](/doc/v2/payin-statuses/)
- [PayIn: диспуты](/doc/v2/payin-disputes/)
- [PayIn: чеки](/doc/v2/payin-receipts/)
- [Выбор банка и типа оплаты](/doc/v2/payment-methods/)
- [Поля реквизитов и customerFields](/doc/v2/field-reference/)
- <a href="/doc/api/payin/02-orders/" target="_blank" rel="noopener noreferrer">PAYIN API: создание и список ордеров</a>
- <a href="/doc/api/payin/04-actions/" target="_blank" rel="noopener noreferrer">PAYIN API: действия над ордером</a>

