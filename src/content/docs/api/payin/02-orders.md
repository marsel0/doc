---
title: "PAYIN API: создание и список ордеров"
---

Все успешные create endpoint-ы возвращают `GetShopOrderDto`. Полный состав полей описан в [PAYIN API: обзор](/doc/api/payin/01-overview/).

## 1. GET `/shop/orders`

Возвращает список payin-ордеров магазина в формате `PaginatedData<GetShopOrderDto>`.

### Query-параметры

| Параметр | Обязателен | Что означает |
| --- | --- | --- |
| `from` | да | начало диапазона дат |
| `to` | да | конец диапазона дат |
| `status` | нет | фильтр по статусу |
| `take` | нет | размер страницы, по умолчанию `100` |
| `page` | нет | номер страницы, по умолчанию `1` |

### `curl`

```bash
curl --location "$BASE_URL/shop/orders?from=2026-03-01&to=2026-03-14&status=completed&take=50&page=1" \
  --header "Authorization: Bearer $SHOP_TOKEN"
```

### Ожидаемый ответ

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
      "statusTimeoutAt": null,
      "payment": {
        "type": "sbp",
        "bank": "sberbank",
        "customerCardFirstDigits": null,
        "customerCardLastDigits": "1234",
        "customerBank": "tbank",
        "customerName": "IVAN IVANOV",
        "customerPhoneLastDigits": "1122",
        "customerUtr": null,
        "customerIBAN": null,
        "customerAccountNumber": null
      },
      "customer": {
        "id": "order-20002",
        "name": null,
        "email": "buyer@example.com",
        "phone": "+79990001122",
        "ip": null,
        "fingerprint": null
      },
      "integration": {
        "externalOrderId": "merchant-20002",
        "callbackUrlStatus": "success"
      },
      "shopAmount": 14.7,
      "shopFee": 0.3
    }
  ],
  "page": 1,
  "pages": 1,
  "count": 1
}
```

## 2. POST `/shop/orders`

Создаёт payin-ордер в статусе `new`.

### Когда использовать

- для redirect-интеграции;
- для H2H-сценария, если `payment.type` будет выбран позже.

Endpoint помечен в коде как deprecated, но остаётся рабочим именно для этих двух merchant-сценариев.

### Тело запроса

| Поле | Обязателен | Что означает |
| --- | --- | --- |
| `amount` | да | сумма ордера |
| `currency` | да | fiat-валюта |
| `customer.id` | да | идентификатор клиента в системе магазина |
| `customer.phone` | нет | телефон клиента |
| `customer.name` | нет | имя клиента |
| `customer.email` | нет | email клиента |
| `customer.ip` | нет | IP клиента |
| `customer.fingerprint` | нет | fingerprint клиента |
| `integration.externalOrderId` | нет, но рекомендуется | идентификатор ордера в системе магазина |
| `integration.callbackUrl` | нет | URL callback |
| `integration.callbackMethod` | нет | `get` или `post`, по умолчанию `post` |
| `integration.returnUrl` | нет | URL возврата клиента |
| `integration.successUrl` | нет | URL возврата при успехе |
| `integration.failUrl` | нет | URL возврата при неуспехе |

### `curl`

```bash
curl --location "$BASE_URL/shop/orders" \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer $SHOP_TOKEN" \
  --data '{
    "amount": 1500,
    "currency": "RUB",
    "customer": {
      "id": "order-20001",
      "email": "buyer@example.com",
      "phone": "+79990001122"
    },
    "integration": {
      "externalOrderId": "merchant-20001",
      "callbackUrl": "[[CALLBACK_URL]]",
      "callbackMethod": "post",
      "returnUrl": "[[RETURN_URL]]",
      "successUrl": "[[SUCCESS_URL]]",
      "failUrl": "[[FAIL_URL]]"
    }
  }'
```

### Ожидаемый ответ

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
    "customerDataCollectionOrder": "before_payment",
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
    "id": "order-20001",
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
    "link": "[[PAY_URL]]/order/94215bfb-1963-4a41-9686-f90412e0a58f/91efd176-...",
    "token": "91efd176-8511-4793-834d-a1b38effb16d",
    "callbackUrl": "[[CALLBACK_URL]]",
    "callbackMethod": "post",
    "callbackUrlStatus": null,
    "externalOrderId": "merchant-20001",
    "returnUrl": "[[RETURN_URL]]",
    "successUrl": "[[SUCCESS_URL]]",
    "failUrl": "[[FAIL_URL]]"
  }
}
```

## 3. POST `/shop/orders/sync-requisites`

Создаёт ордер и сразу пытается подобрать реквизиты. Это основной H2H endpoint.

### Дополнительные поля запроса

| Поле | Обязателен | Что означает |
| --- | --- | --- |
| `payment.type` | да | код метода оплаты |
| `payment.bank` | нет | код банка |
| `payment.customerBank` | нет | банк, из которого клиент делает перевод |

Остальная часть тела запроса совпадает с `POST /shop/orders`.

### `curl`

```bash
curl --location "$BASE_URL/shop/orders/sync-requisites" \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer $SHOP_TOKEN" \
  --data '{
    "amount": 1500,
    "currency": "RUB",
    "customer": {
      "id": "order-20002",
      "phone": "+79990001122",
      "email": "buyer@example.com"
    },
    "payment": {
      "type": "sbp",
      "bank": "sberbank",
      "customerBank": "tbank"
    },
    "integration": {
      "externalOrderId": "merchant-20002",
      "callbackUrl": "[[CALLBACK_URL]]",
      "callbackMethod": "post"
    }
  }'
```

### Ожидаемый успешный ответ

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
    "customerDataCollectionOrder": "before_payment",
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
    "id": "order-20002",
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
    "link": "[[PAY_URL]]/order/0b98eb1a-9e3a-4536-bed6-d10e5a7e097a/4c0d8778-...",
    "token": "4c0d8778-62e6-4b20-9d6f-6a4bcaf06f43",
    "callbackUrl": "[[CALLBACK_URL]]",
    "callbackMethod": "post",
    "callbackUrlStatus": null,
    "externalOrderId": "merchant-20002"
  }
}
```

### Ожидаемый ответ, если реквизиты не найдены

```json
{
  "statusCode": 404,
  "errorMessage": "No requisites found for specific payment type and bank at this moment",
  "errorCode": "O10005",
  "order": {
    "id": "1d481bac-61e0-4e9b-8b54-2c48d474d394",
    "initialAmount": 132,
    "amount": 132,
    "currency": "RUB",
    "status": "cancelled",
    "statusDetails": "requisites_timeout",
    "statusTimeoutAt": null,
    "requisites": null,
    "payment": {
      "type": "card2card",
      "bank": "sberbank",
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
      "id": "order-20002",
      "name": null,
      "email": null,
      "phone": null,
      "ip": null,
      "fingerprint": null
    },
    "integration": {
      "externalOrderId": "merchant-20002",
      "callbackUrlStatus": null
    }
  },
  "error": "Not Found"
}
```

Если на магазине включена randomization, ориентируйтесь на фактическое `amount`, а не только на `initialAmount`.
