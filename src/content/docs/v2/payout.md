---
title: "Payout H2H"
description: "Сценарий, где вы создаёте выплаты и отслеживаете их статус"
---

`Payout H2H` — это исходный payout-сценарий из оригинальной документации Марселя: вы создаёте выплаты и отслеживаете их статус. Здесь нет выдачи реквизитов для оплаты, но есть своя логика по trade methods, реквизитам получателя, балансу магазина и финальным статусам выплаты.

Здесь описан только процесс. Готовые запросы и ответы вынесены в отдельную страницу примеров.

## Когда использовать

- нужно отправить выплату клиенту;
- мерчант сам инициирует payout-ордер;
- требуется собирать реквизиты получателя в формате выбранного метода;
- важно контролировать баланс магазина и финальный статус выплаты.

## Базовая схема payout

Типовой payout flow выглядит так:

1. Проверить доступные payout methods через `GET /public/api/v1/shop/trade-methods/payout` <a href="[[DOMAIN_URL]]/public/api/payout#tag/v1shoptrade-methodspayout/operation/ShopTradeMethodsController_getPayoutTradeMethods" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>.
2. Собрать `customer.requisites` по правилам выбранного метода.
3. Создать payout-ордер через `POST /public/api/v1/shop/payout-orders` <a href="[[DOMAIN_URL]]/public/api/payout#tag/v1shoppayout-orders/operation/ShopPayoutOrdersControllerV1_createWithTimeout" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>.
4. Ждать callback или читать статус через `GET /public/api/v1/shop/payout-orders/{id}` <a href="[[DOMAIN_URL]]/public/api/payout#tag/v1shoppayout-orders/operation/ShopPayoutOrdersControllerV1_findOne" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a> / `GET /public/api/v1/shop/payout-orders/external/{externalOrderId}` <a href="[[DOMAIN_URL]]/public/api/payout#tag/v1shoppayout-orders/operation/ShopPayoutOrdersControllerV1_findOneByExternalOrderId" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>.
5. Завершить бизнес-операцию только после финального статуса.

## Что подготовить заранее

### Ключи

- `Shop API key` для работы с payout-ордерами;
- `Balance API key`, если нужно заранее читать баланс магазина;
- `Signature key` для проверки callback.

### Что должно быть настроено у магазина

- доступные payout trade methods из `GET /public/api/v1/shop/trade-methods/payout` <a href="[[DOMAIN_URL]]/public/api/payout#tag/v1shoptrade-methodspayout/operation/ShopTradeMethodsController_getPayoutTradeMethods" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>;
- достаточный баланс магазина;
- `callbackUrl`, если вы хотите получать асинхронные статусы.

Если баланс магазина ниже нужного, создание payout-ордера завершится бизнес-ошибкой.

## Как проходит Payout H2H

### Шаг 1. Получить доступные payout methods

`GET /public/api/v1/shop/trade-methods/payout` <a href="[[DOMAIN_URL]]/public/api/payout#tag/v1shoptrade-methodspayout/operation/ShopTradeMethodsController_getPayoutTradeMethods" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a> — это источник истины для:

- списка доступных `payment.type`;
- необходимости передавать `bank`;
- обязательных полей в `customer.requisites`.

Обязательные поля нельзя хардкодить: они зависят от конкретного payout method.

### Шаг 2. Собрать реквизиты получателя

`customer.requisites` заполняется по полям из trade method.

Типовые варианты:

- для `sbp` обычно нужен `phone`;
- для `card2card` нужен `cardInfo`, а `cardholder` часто опционален;
- для банковских методов могут требоваться `accountNumber`, `bic`, `swiftBic`, `beneficiaryName`, `taxId`.

### Шаг 3. Создать payout-ордер

После успешного создания ордер обычно не становится финальным сразу. Нормальный первый рабочий статус после создания — промежуточный статус обработки.

Это значит, что система приняла payout и передала его в работу.

## Поля запроса

### Что передаётся при создании payout-ордера

| Поле | Статус | Комментарий |
| --- | --- | --- |
| `amount` | обязательное | Сумма перевода в фиатной валюте |
| `currency` | обязательное | Фиатная валюта выплаты |
| `customer.id` | обязательное | Идентификатор клиента на стороне мерчанта |
| `customer.requisites` | обязательное | Реквизиты клиента по правилам метода |
| `payment.type` | обязательное | Тип выплаты |
| `payment.bank` | обязательное | Банк для выплаты |
| `integration.callbackUrl` | опциональное | URL для callback |
| `integration.callbackMethod` | опциональное | `get` или `post` |
| `integration.externalOrderId` | опциональное, но рекомендуется | Ваш идентификатор payout-операции |

Состав `customer.requisites` не фиксированный: он зависит от выбранного payout method и должен браться из `trade methods/payout`.

### Шаг 4. Дождаться статуса

Рекомендуемый путь:

1. принять callback;
2. проверить `signature`;
3. зафиксировать новый статус.

Резервный путь:

- дочитывать payout через `GET /public/api/v1/shop/payout-orders/{id}` <a href="[[DOMAIN_URL]]/public/api/payout#tag/v1shoppayout-orders/operation/ShopPayoutOrdersControllerV1_findOne" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>;
- дочитывать payout через `GET /public/api/v1/shop/payout-orders/external/{externalOrderId}` <a href="[[DOMAIN_URL]]/public/api/payout#tag/v1shoppayout-orders/operation/ShopPayoutOrdersControllerV1_findOneByExternalOrderId" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>.

### Шаг 5. Обработать финальные статусы

Для мерчанта финальными обычно являются:

- `completed`
- `cancelled`
- `dispute`
- `error`

Промежуточные и технические статусы не должны автоматически считаться финалом бизнес-операции.

## Что особенно важно

### Баланс магазина

Payout использует баланс магазина, поэтому перед массовым запуском полезно читать баланс отдельно.

### `externalOrderId`

Поле технически может быть необязательным, но в production его лучше считать обязательным. Оно нужно, чтобы:

- переживать таймауты;
- исключать дубли;
- дочитывать payout по вашей внутренней операции.

### Автоподстановка банка для `card2card`

Если payout создаётся с `payment.type = card2card` и `payment.bank` не передан, сервис может попытаться определить банк по BIN карты получателя.

Практически это означает:

- банк не всегда обязателен для `card2card`;
- но итоговый `payment.bank` лучше читать из ответа и логировать.

## Callback payout

Механика callback такая же, как в `payin`:

- метод задаётся в `integration.callbackMethod`;
- статусные параметры передаются в query string;
- при `post` тело запроса пустое;
- callback может прийти повторно;
- обработчик должен быть идемпотентным.

## Практические рекомендации

- Валидируйте реквизиты клиента ещё до вызова API.
- После таймаута create-запроса сначала ищите payout через `GET /public/api/v1/shop/payout-orders/external/{externalOrderId}` <a href="[[DOMAIN_URL]]/public/api/payout#tag/v1shoppayout-orders/operation/ShopPayoutOrdersControllerV1_findOneByExternalOrderId" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>.
- Не считайте успешное создание payout финальным подтверждением выплаты.
- Логируйте `status`, `statusDetails`, `externalOrderId` и статус доставки callback.
- Для спорных кейсов сразу дочитывайте ордер через `GET /public/api/v1/shop/payout-orders/{id}` <a href="[[DOMAIN_URL]]/public/api/payout#tag/v1shoppayout-orders/operation/ShopPayoutOrdersControllerV1_findOne" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>, а не полагайтесь только на UI.

## Куда идти дальше

- [Примеры API](/doc/v2/examples/#payout-h2h)
- [Payout: статусы и переходы](/doc/v2/payout-statuses/)
- [Callback и подпись](/doc/v2/callback-signature/)
- [Выбор банка и типа оплаты](/doc/v2/payment-methods/)
- [Поля реквизитов и customerFields](/doc/v2/field-reference/)
- <a href="/doc/api/payout/02-orders/" target="_blank" rel="noopener noreferrer">PAYOUT API: создание и список ордеров</a>
- <a href="/doc/api/payout/03-read-and-cancel/" target="_blank" rel="noopener noreferrer">PAYOUT API: чтение и отмена</a>
- <a href="/doc/api/payout/04-dictionaries/" target="_blank" rel="noopener noreferrer">PAYOUT API: trade methods и справочники</a>

