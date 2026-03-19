---
title: "PAYIN: способы и API-примеры"
description: "Полные примеры merchant и customer запросов для PAYIN"
tableOfContents: false
---

Эта страница собирает рабочие примеры для `payin` в `simple-pay`: выбор trade method, создание ордеров, чтение, подтверждение оплаты, загрузку чеков, диспуты и callback.

## Переменные для примеров

```bash
export BASE_URL="[[BASE_URL]]"
export SHOP_TOKEN="<SHOP_API_KEY>"
export SIGNATURE_KEY="<SIGNATURE_KEY>"
export CALLBACK_URL="[[CALLBACK_URL]]"
```

## 1. Узнать доступные способы оплаты

Перед H2H-интеграцией всегда вызывайте `GET /shop/trade-methods`. Это источник истины по доступным комбинациям `paymentType + bank` и по тому, какие поля нужно показать клиенту.

### Запрос

```bash
curl --location "$BASE_URL/shop/trade-methods" \
  --header "Authorization: Bearer $SHOP_TOKEN"
```

### Пример ответа

```json
[
  {
    "bank": "sberbank",
    "bankName": "Sberbank",
    "fiatCurrency": "RUB",
    "fiatCurrencySymbol": "₽",
    "fiatCurrencySymbolPosition": "after",
    "paymentType": "sbp",
    "paymentTypeName": "СБП",
    "fields": [
      { "type": "phone", "name": "phone", "required": true, "primary": true },
      { "type": "holder", "name": "cardholder", "required": false },
      { "type": "bank", "name": "bankName", "required": false }
    ],
    "customerFields": [
      { "type": "phone", "name": "phone", "required": false }
    ],
    "parallelGroupOrdersEnabled": false,
    "compareCardLast4DigitsEnabled": false,
    "compareAccountLast4DigitsEnabled": false,
    "compareUTREnabled": false,
    "enabled": true,
    "deeplinks": []
  },
  {
    "bank": "tbank",
    "bankName": "T-Bank",
    "fiatCurrency": "RUB",
    "fiatCurrencySymbol": "₽",
    "fiatCurrencySymbolPosition": "after",
    "paymentType": "card2card",
    "paymentTypeName": "Перевод с карты на карту",
    "fields": [
      { "type": "card", "name": "cardInfo", "required": true, "primary": true },
      { "type": "holder", "name": "cardholder", "required": false }
    ],
    "customerFields": [
      { "type": "card", "name": "customerCardLastDigits", "required": false }
    ],
    "parallelGroupOrdersEnabled": false,
    "compareCardLast4DigitsEnabled": true,
    "compareAccountLast4DigitsEnabled": false,
    "compareUTREnabled": false,
    "enabled": true,
    "deeplinks": []
  }
]
```

### Что смотреть в ответе

- `paymentType` и `bank` определяют, что можно передавать в `payment`.
- `fields[]` описывает, какие поля придут в `requisites`.
- `customerFields[]` подсказывает, какие данные клиента лучше собрать.
- `enabled=false` означает, что метод сейчас нерабочий.

## 2. Создать redirect-ордер

`POST /shop/orders` подходит для redirect-сценария и для пошагового H2H, когда метод оплаты ещё не выбран.

### Запрос

```bash
curl --location "$BASE_URL/shop/orders" \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer $SHOP_TOKEN" \
  --data '{
    "amount": 1500,
    "currency": "RUB",
    "customer": {
      "id": "order-10001",
      "email": "buyer@example.com",
      "phone": "+79990001122",
      "ip": "203.0.113.10",
      "fingerprint": "3a5d06df-5ce3-4ce0-a6ca-e29db8b1bc2d"
    },
    "integration": {
      "externalOrderId": "merchant-10001",
      "callbackUrl": "[[CALLBACK_URL]]",
      "callbackMethod": "post",
      "returnUrl": "[[RETURN_URL]]",
      "successUrl": "[[SUCCESS_URL]]",
      "failUrl": "[[FAIL_URL]]"
    }
  }'
```

### Пример ответа

```json
{
  "id": "94215bfb-1963-4a41-9686-f90412e0a58f",
  "initialAmount": 1500,
  "amount": 1500,
  "currency": "RUB",
  "status": "new",
  "statusDetails": null,
  "statusTimeoutAt": "2026-03-14T12:30:00.000Z",
  "requisites": null,
  "shop": {
    "name": "simple-pay-demo",
    "customerDataCollectionOrder": "before_payment_type",
    "collectCustomerReceipts": true
  },
  "payment": {
    "type": null,
    "bank": null,
    "customerCardFirstDigits": null,
    "customerCardLastDigits": null,
    "customerBank": null,
    "customerName": null,
    "customerPhoneLastDigits": null,
    "customerUtr": null,
    "customerIBAN": null,
    "customerAccountNumber": null
  },
  "customer": {
    "id": "order-10001",
    "name": null,
    "email": "buyer@example.com",
    "phone": "+79990001122",
    "ip": "203.0.113.10",
    "fingerprint": "3a5d06df-5ce3-4ce0-a6ca-e29db8b1bc2d"
  },
  "assetCurrencyAmount": 15,
  "shopAmount": 14.7,
  "shopFee": 0.3,
  "initialShopCommission": 2,
  "currencyRate": 100,
  "integration": {
    "link": "[[PAY_URL]]/order/94215bfb-1963-4a41-9686-f90412e0a58f/91efd176-8511-4793-834d-a1b38effb16d",
    "token": "91efd176-8511-4793-834d-a1b38effb16d",
    "callbackUrl": "[[CALLBACK_URL]]",
    "callbackMethod": "post",
    "externalOrderId": "merchant-10001"
  }
}
```

### Что делать дальше

- Для redirect перенаправьте клиента на `integration.link`.
- Для ручного H2H сохраните `id` и позже вызовите `PATCH /shop/orders/{id}` и `POST /shop/orders/{id}/start-payment`.

## 3. Создать H2H-ордер с реквизитами сразу

`POST /shop/orders/sync-requisites` создаёт ордер и сразу пытается подобрать реквизиты.

### Пример: SBP

```bash
curl --location "$BASE_URL/shop/orders/sync-requisites" \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer $SHOP_TOKEN" \
  --data '{
    "amount": 1500,
    "currency": "RUB",
    "customer": {
      "id": "order-10002",
      "phone": "+79990001122",
      "email": "buyer@example.com"
    },
    "payment": {
      "type": "sbp",
      "bank": "sberbank",
      "customerBank": "tbank"
    },
    "integration": {
      "externalOrderId": "merchant-10002",
      "callbackUrl": "[[CALLBACK_URL]]",
      "callbackMethod": "post"
    }
  }'
```

### Пример ответа

```json
{
  "id": "0b98eb1a-9e3a-4536-bed6-d10e5a7e097a",
  "initialAmount": 1500,
  "amount": 1500,
  "currency": "RUB",
  "status": "customer_confirm",
  "statusDetails": null,
  "statusTimeoutAt": "2026-03-14T12:40:00.000Z",
  "requisites": {
    "phone": "+79995554433",
    "bank": "sberbank",
    "bankName": "Sberbank",
    "sameBank": false,
    "cardholder": "IVAN IVANOV",
    "paymentLink": null,
    "rawQrCodeData": null,
    "qrImageUrl": null
  },
  "shop": {
    "name": "simple-pay-demo",
    "customerDataCollectionOrder": "before_payment_type",
    "collectCustomerReceipts": true
  },
  "payment": {
    "type": "sbp",
    "bank": "sberbank",
    "customerCardFirstDigits": null,
    "customerCardLastDigits": null,
    "customerBank": "tbank",
    "customerName": null,
    "customerPhoneLastDigits": null,
    "customerUtr": null,
    "customerIBAN": null,
    "customerAccountNumber": null
  },
  "customer": {
    "id": "order-10002",
    "name": null,
    "email": "buyer@example.com",
    "phone": "+79990001122",
    "ip": null,
    "fingerprint": null
  },
  "assetCurrencyAmount": 15,
  "shopAmount": 14.7,
  "shopFee": 0.3,
  "initialShopCommission": 2,
  "currencyRate": 100,
  "integration": {
    "link": "[[PAY_URL]]/order/0b98eb1a-9e3a-4536-bed6-d10e5a7e097a/4c0d8778-62e6-4b20-9d6f-6a4bcaf06f43",
    "token": "4c0d8778-62e6-4b20-9d6f-6a4bcaf06f43",
    "callbackUrl": "[[CALLBACK_URL]]",
    "callbackMethod": "post",
    "externalOrderId": "merchant-10002"
  }
}
```

### Пример: Card2Card

```bash
curl --location "$BASE_URL/shop/orders/sync-requisites" \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer $SHOP_TOKEN" \
  --data '{
    "amount": 2500,
    "currency": "RUB",
    "customer": {
      "id": "order-10003",
      "phone": "+79990001122"
    },
    "payment": {
      "type": "card2card",
      "bank": "tbank"
    },
    "integration": {
      "externalOrderId": "merchant-10003",
      "callbackUrl": "[[CALLBACK_URL]]",
      "callbackMethod": "post"
    }
  }'
```

### Что будет, если реквизитов нет

В этом случае API возвращает `404` и бизнес-ошибку `O10005`.

```json
{
  "statusCode": 404,
  "errorMessage": "No requisites found for specific payment type and bank at this moment",
  "errorCode": "O10005",
  "order": {
    "id": "1d481bac-61e0-4e9b-8b54-2c48d474d394",
    "amount": 132,
    "currency": "RUB",
    "status": "cancelled",
    "statusDetails": "requisites_timeout",
    "requisites": null,
    "payment": {
      "bank": "sberbank",
      "type": "card2card"
    },
    "customer": {
      "id": "2e"
    }
  }
}
```

Практически это означает: ордер уже создан, но в работу не пошёл. Его можно логировать и связать с `externalOrderId`.

## 4. Дополнительные запросы чтения

### Прочитать ордер по внутреннему ID

```bash
curl --location "$BASE_URL/shop/orders/0b98eb1a-9e3a-4536-bed6-d10e5a7e097a" \
  --header "Authorization: Bearer $SHOP_TOKEN"
```

### Прочитать ордер по `externalOrderId`

```bash
curl --location "$BASE_URL/shop/orders/external/merchant-10002" \
  --header "Authorization: Bearer $SHOP_TOKEN"
```

### Получить список ордеров магазина

```bash
curl --location "$BASE_URL/shop/orders?from=2026-03-01&to=2026-03-14&status=completed&take=50&page=1" \
  --header "Authorization: Bearer $SHOP_TOKEN"
```

### Пример ответа списка

```json
{
  "items": [
    {
      "id": "0b98eb1a-9e3a-4536-bed6-d10e5a7e097a",
      "initialAmount": 1500,
      "amount": 1500,
      "currency": "RUB",
      "status": "completed",
      "statusDetails": null,
      "customer": {
        "id": "order-10002",
        "email": "buyer@example.com",
        "phone": "+79990001122"
      },
      "integration": {
        "externalOrderId": "merchant-10002",
        "callbackUrlStatus": "success"
      }
    }
  ],
  "page": 1,
  "pages": 1,
  "count": 1
}
```

### Что проверять в ответе

- `status`
- `statusDetails`
- `requisites`
- `payment`
- `integration.callbackUrlStatus`
- `amount` и `initialAmount`

## 5. Ручные действия над ордером

### 5.1 Обновить выбранный метод оплаты

Используется в статусе `new`, если вы строите пошаговый H2H flow.

```bash
curl --location --request PATCH "$BASE_URL/shop/orders/94215bfb-1963-4a41-9686-f90412e0a58f" \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer $SHOP_TOKEN" \
  --data '{
    "payment": {
      "type": "card2card",
      "bank": "tbank"
    }
  }'
```

Ответ: обновлённый `GetShopOrderDto`.

### 5.2 Запустить поиск реквизитов

```bash
curl --location --request POST "$BASE_URL/shop/orders/94215bfb-1963-4a41-9686-f90412e0a58f/start-payment" \
  --header "Authorization: Bearer $SHOP_TOKEN"
```

Если реквизиты ещё не подобраны, ордер перейдёт в `requisites`.

### 5.3 Подтвердить оплату клиента

```bash
curl --location --request POST "$BASE_URL/shop/orders/0b98eb1a-9e3a-4536-bed6-d10e5a7e097a/confirm-payment" \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer $SHOP_TOKEN" \
  --data '{
    "payment": {
      "customerCardLastDigits": "1234",
      "customerPhoneLastDigits": "1122",
      "customerBank": "tbank",
      "customerName": "IVAN IVANOV"
    }
  }'
```

### Пример ответа

```json
{
  "id": "0b98eb1a-9e3a-4536-bed6-d10e5a7e097a",
  "amount": 1500,
  "currency": "RUB",
  "status": "trader_confirm",
  "statusDetails": null,
  "payment": {
    "type": "sbp",
    "bank": "sberbank",
    "customerCardLastDigits": "1234",
    "customerBank": "tbank",
    "customerName": "IVAN IVANOV",
    "customerPhoneLastDigits": "1122"
  },
  "integration": {
    "externalOrderId": "merchant-10002",
    "callbackUrlStatus": "in_progress"
  }
}
```

### 5.4 Отменить ордер

```bash
curl --location --request POST "$BASE_URL/shop/orders/0b98eb1a-9e3a-4536-bed6-d10e5a7e097a/cancel" \
  --header "Authorization: Bearer $SHOP_TOKEN"
```

### Пример ответа

```json
{
  "id": "0b98eb1a-9e3a-4536-bed6-d10e5a7e097a",
  "amount": 1500,
  "currency": "RUB",
  "status": "cancelled",
  "statusDetails": "shop",
  "integration": {
    "externalOrderId": "merchant-10002",
    "callbackUrlStatus": "in_progress"
  }
}
```

## 6. Дополнительные методы: поля оплаты и чеки

### 6.1 Узнать, какие payment-поля показывать клиенту

```bash
curl --location "$BASE_URL/shop/orders/0b98eb1a-9e3a-4536-bed6-d10e5a7e097a/payment-fields" \
  --header "Authorization: Bearer $SHOP_TOKEN"
```

### Пример ответа

```json
[
  {
    "name": "customerCardLastDigits",
    "label": "Последние 4 цифры карты",
    "required": true
  }
]
```

### 6.2 Получить список чеков

```bash
curl --location "$BASE_URL/shop/orders/0b98eb1a-9e3a-4536-bed6-d10e5a7e097a/receipts" \
  --header "Authorization: Bearer $SHOP_TOKEN"
```

Пример ответа:

```json
[
  { "filename": "receipt_20260314_120501.jpg" }
]
```

### 6.3 Загрузить чек

Размер файла по коду проекта ограничен `3 MB`.

```bash
curl --location "$BASE_URL/shop/orders/0b98eb1a-9e3a-4536-bed6-d10e5a7e097a/receipts" \
  --header "Authorization: Bearer $SHOP_TOKEN" \
  --form "file=@/tmp/receipt.jpg"
```

Ответ: обновлённый `GetShopOrderDto`.

### 6.4 Получить временную ссылку на чек

```bash
curl --location --request POST "$BASE_URL/shop/orders/0b98eb1a-9e3a-4536-bed6-d10e5a7e097a/receipts/url" \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer $SHOP_TOKEN" \
  --data '{
    "filename": "receipt_20260314_120501.jpg"
  }'
```

Пример ответа:

```json
{
  "url": "[[STORAGE_URL]]/receipts/order/0b98eb1a-9e3a-4536-bed6-d10e5a7e097a/receipt_20260314_120501.jpg?X-Amz-Expires=60"
}
```

### 6.5 Удалить чек

```bash
curl --location --request POST "$BASE_URL/shop/orders/0b98eb1a-9e3a-4536-bed6-d10e5a7e097a/remove-receipt" \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer $SHOP_TOKEN" \
  --data '{
    "filename": "receipt_20260314_120501.jpg"
  }'
```

Успешный ответ: `200 OK`, тело пустое.

## 7. Диспуты

### Открыть диспут по внутреннему ID

```bash
curl --location "$BASE_URL/shop/orders/0b98eb1a-9e3a-4536-bed6-d10e5a7e097a/dispute" \
  --header "Authorization: Bearer $SHOP_TOKEN" \
  --form "amount=1500" \
  --form "file=@/tmp/receipt.jpg"
```

### Открыть диспут по `externalOrderId`

```bash
curl --location "$BASE_URL/shop/orders/external/merchant-10002/dispute" \
  --header "Authorization: Bearer $SHOP_TOKEN" \
  --form "amount=1500"
```

### Отменить диспут

```bash
curl --location --request POST "$BASE_URL/shop/orders/0b98eb1a-9e3a-4536-bed6-d10e5a7e097a/dispute/cancel" \
  --header "Authorization: Bearer $SHOP_TOKEN"
```

```bash
curl --location --request POST "$BASE_URL/shop/orders/external/merchant-10002/dispute/cancel" \
  --header "Authorization: Bearer $SHOP_TOKEN"
```

Ответ: обновлённый ордер.

## 8. Customer API для клиентского UI

Если после создания ордера вы хотите отдать дальнейшие действия фронтенду, используйте `Customer API`.

### Логин клиента в ордер

```bash
curl --location "$BASE_URL/customer/auth/login" \
  --header "Content-Type: application/json" \
  --data '{
    "orderId": "94215bfb-1963-4a41-9686-f90412e0a58f",
    "token": "91efd176-8511-4793-834d-a1b38effb16d"
  }'
```

Пример ответа:

```json
{
  "accessToken": "eyJhbGciOi..."
}
```

Дальше этот токен можно использовать для:

- `GET /customer/orders/{id}`
- `PATCH /customer/orders/{id}`
- `POST /customer/orders/{id}/start-payment`
- `POST /customer/orders/{id}/start-payment-sync`
- `POST /customer/orders/{id}/confirm-payment`
- `POST /customer/orders/{id}/cancel`

## 9. Как выглядит callback

В merchant API callback отправляется на `integration.callbackUrl`.

### Пример callback для успешной оплаты

```text
[[CALLBACK_URL]]?id=0b98eb1a-9e3a-4536-bed6-d10e5a7e097a&amount=1500&customerId=order-10002&status=completed&externalOrderId=merchant-10002&signature=8f3eb9...
```

### Пример callback для отмены

```text
[[CALLBACK_URL]]?id=0b98eb1a-9e3a-4536-bed6-d10e5a7e097a&amount=1500&customerId=order-10002&status=cancelled&statusDetails=shop&externalOrderId=merchant-10002&signature=7dc2a4...
```

### Важные особенности callback

- параметры статуса передаются в query string;
- при `callbackMethod=post` тело запроса пустое;
- callback может быть отправлен повторно;
- статус доставки callback отражается в `integration.callbackUrlStatus`.

## 10. Тонкости работы PAYIN API

- `amount` может отличаться от `initialAmount`, если на магазине включена уникализация.
- `sync-requisites` не гарантирует `201` в любой момент времени: отсутствие реквизитов даёт `404/O10005`.
- После `S10002` ищите ордер по `externalOrderId`, а не создавайте новый сразу.
- `confirm-payment` допустим только в статусе `customer_confirm`, иначе получите `O10000`.
- Не хардкодьте набор полей в `requisites`; он зависит от trade method.
- Для антифрода полезно стабильно передавать `customer.id`, `customer.ip`, `customer.phone`, `customer.email`, `customer.fingerprint`.

## 11. Что смотреть дальше

- [Интеграции PAYIN](/doc/payin/01-redirect_integration/)
- [PAYIN API: создание и список ордеров](/doc/api/payin/02-orders/)
- [PAYIN API: чтение ордеров](/doc/api/payin/03-read/)
- [PAYIN API: действия над ордером](/doc/api/payin/04-actions/)
- [Ошибки и коды ответов](/doc/docs/02-api_error_guide/)
