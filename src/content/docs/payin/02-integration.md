---
title: "PAYIN: сценарии и curl-примеры"
description: "Практические сценарии merchant-интеграции PAYIN"
---

Эта страница собирает сценарии интеграции для магазина. Полное описание полей и всех merchant endpoint-ов находится в [PAYIN API](/doc/api/payin/01-overview/).

## 1. Переменные

```bash
export BASE_URL="[[BASE_URL]]"
export SHOP_TOKEN="<SHOP_API_KEY>"
export CALLBACK_URL="[[CALLBACK_URL]]"
```

## 2. Сценарий Redirect

### Создать ордер

```bash
curl --location "$BASE_URL/shop/orders" \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer $SHOP_TOKEN" \
  --data '{
    "amount": 1500,
    "currency": "RUB",
    "customer": {
      "id": "order-10001"
    },
    "integration": {
      "externalOrderId": "merchant-10001",
      "callbackUrl": "[[CALLBACK_URL]]",
      "callbackMethod": "post"
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
    "id": "order-10001",
    "name": null,
    "email": null,
    "phone": null,
    "ip": null,
    "fingerprint": null
  },
  "assetCurrencyAmount": 15,
  "shopAmount": 14.7,
  "shopFee": 0.3,
  "initialShopCommission": 2,
  "currencyRate": 100,
  "integration": {
    "link": "[[PAY_URL]]/order/...",
    "token": "91efd176-...",
    "callbackUrl": "[[CALLBACK_URL]]",
    "callbackMethod": "post",
    "callbackUrlStatus": null,
    "externalOrderId": "merchant-10001"
  }
}
```

Дальше переведите клиента на `integration.link` и ждите callback или читайте ордер по `GET`.

## 3. Сценарий H2H с реквизитами сразу

### Прочитать доступные методы

```bash
curl --location "$BASE_URL/shop/trade-methods" \
  --header "Authorization: Bearer $SHOP_TOKEN"
```

### Ожидаемый ответ

```json
[
  {
    "bank": "sberbank",
    "bankName": "Sberbank",
    "fiatCurrency": "RUB",
    "paymentType": "sbp",
    "fields": [
      { "type": "phone", "name": "phone", "required": true, "primary": true }
    ],
    "customerFields": [
      { "type": "phone", "name": "phone", "required": false }
    ],
    "enabled": true
  }
]
```

### Создать ордер с реквизитами

```bash
curl --location "$BASE_URL/shop/orders/sync-requisites" \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer $SHOP_TOKEN" \
  --data '{
    "amount": 1500,
    "currency": "RUB",
    "customer": {
      "id": "order-10002"
    },
    "payment": {
      "type": "sbp",
      "bank": "sberbank"
    },
    "integration": {
      "externalOrderId": "merchant-10002",
      "callbackUrl": "[[CALLBACK_URL]]",
      "callbackMethod": "post"
    }
  }'
```

### Ожидаемый ответ

```json
{
  "id": "0b98eb1a-9e3a-4536-bed6-d10e5a7e097a",
  "initialAmount": 1500,
  "amount": 1500,
  "currency": "RUB",
  "status": "customer_confirm",
  "statusDetails": null,
  "statusTimeoutAt": "2026-03-14T12:40:00.000Z",
  "payment": {
    "type": "sbp",
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
  "customer": {
    "id": "order-10002",
    "name": null,
    "email": null,
    "phone": null,
    "ip": null,
    "fingerprint": null
  },
  "integration": {
    "externalOrderId": "merchant-10002",
    "callbackUrlStatus": null
  }
}
```

### Подтвердить оплату

```bash
curl --location --request POST "$BASE_URL/shop/orders/0b98eb1a-9e3a-4536-bed6-d10e5a7e097a/confirm-payment" \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer $SHOP_TOKEN" \
  --data '{
    "payment": {
      "customerCardLastDigits": "1234",
      "customerBank": "tbank"
    }
  }'
```

### Ожидаемый ответ

```json
{
  "id": "0b98eb1a-9e3a-4536-bed6-d10e5a7e097a",
  "initialAmount": 1500,
  "amount": 1500,
  "currency": "RUB",
  "status": "trader_confirm",
  "statusDetails": null,
  "statusTimeoutAt": "2026-03-14T12:55:00.000Z",
  "payment": {
    "type": "sbp",
    "bank": "sberbank",
    "customerCardFirstDigits": null,
    "customerCardLastDigits": "1234",
    "customerBank": "tbank",
    "customerName": null,
    "customerPhoneLastDigits": null,
    "customerUtr": null,
    "customerIBAN": null,
    "customerAccountNumber": null
  },
  "integration": {
    "externalOrderId": "merchant-10002",
    "callbackUrlStatus": null
  }
}
```

Если реквизиты не найдены на шаге создания, API вернёт `404` и `O10005`.

## 4. Сценарий H2H по шагам

### Создать базовый ордер

```bash
curl --location "$BASE_URL/shop/orders" \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer $SHOP_TOKEN" \
  --data '{
    "amount": 1500,
    "currency": "RUB",
    "customer": {
      "id": "order-10003"
    },
    "integration": {
      "externalOrderId": "merchant-10003",
      "callbackUrl": "[[CALLBACK_URL]]",
      "callbackMethod": "post"
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
  "integration": {
    "externalOrderId": "merchant-10003",
    "callbackUrlStatus": null
  }
}
```

### Записать выбранный метод оплаты

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
  "payment": {
    "type": "card2card",
    "bank": "tbank",
    "customerCardFirstDigits": null,
    "customerCardLastDigits": null,
    "customerBank": null,
    "customerName": null,
    "customerPhoneLastDigits": null,
    "customerUtr": null,
    "customerIBAN": null,
    "customerAccountNumber": null
  },
  "integration": {
    "externalOrderId": "merchant-10003",
    "callbackUrlStatus": null
  }
}
```

### Запустить поиск реквизитов

```bash
curl --location --request POST "$BASE_URL/shop/orders/94215bfb-1963-4a41-9686-f90412e0a58f/start-payment" \
  --header "Authorization: Bearer $SHOP_TOKEN"
```

### Ожидаемый ответ

```json
{
  "id": "94215bfb-1963-4a41-9686-f90412e0a58f",
  "initialAmount": 1500,
  "amount": 1500,
  "currency": "RUB",
  "status": "requisites",
  "statusDetails": null,
  "statusTimeoutAt": "2026-03-14T12:26:00.000Z",
  "requisites": null,
  "payment": {
    "type": "card2card",
    "bank": "tbank",
    "customerCardFirstDigits": null,
    "customerCardLastDigits": null,
    "customerBank": null,
    "customerName": null,
    "customerPhoneLastDigits": null,
    "customerUtr": null,
    "customerIBAN": null,
    "customerAccountNumber": null
  },
  "integration": {
    "externalOrderId": "merchant-10003",
    "callbackUrlStatus": null
  }
}
```

Дальше ждите `customer_confirm` через callback или `GET`.

## 5. Читать итоговый статус

### По внутреннему `id`

```bash
curl --location "$BASE_URL/shop/orders/0b98eb1a-9e3a-4536-bed6-d10e5a7e097a" \
  --header "Authorization: Bearer $SHOP_TOKEN"
```

### По `externalOrderId`

```bash
curl --location "$BASE_URL/shop/orders/external/merchant-10002" \
  --header "Authorization: Bearer $SHOP_TOKEN"
```

### Ожидаемый ответ

```json
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
    "id": "order-10002",
    "name": null,
    "email": null,
    "phone": null,
    "ip": null,
    "fingerprint": null
  },
  "integration": {
    "externalOrderId": "merchant-10002",
    "callbackUrlStatus": "success"
  }
}
```

## 6. Отменить платёж или открыть dispute

### Отменить ордер

```bash
curl --location --request POST "$BASE_URL/shop/orders/0b98eb1a-9e3a-4536-bed6-d10e5a7e097a/cancel" \
  --header "Authorization: Bearer $SHOP_TOKEN"
```

### Ожидаемый ответ

```json
{
  "id": "0b98eb1a-9e3a-4536-bed6-d10e5a7e097a",
  "initialAmount": 1500,
  "amount": 1500,
  "currency": "RUB",
  "status": "cancelled",
  "statusDetails": "shop",
  "statusTimeoutAt": null,
  "integration": {
    "externalOrderId": "merchant-10002",
    "callbackUrlStatus": "in_progress"
  }
}
```

### Открыть dispute

```bash
curl --location "$BASE_URL/shop/orders/0b98eb1a-9e3a-4536-bed6-d10e5a7e097a/dispute" \
  --header "Authorization: Bearer $SHOP_TOKEN" \
  --form "amount=1500" \
  --form "file=@/tmp/receipt.jpg"
```

В merchant API `dispute` открывается по уже отменённому ордеру.

### Ожидаемый ответ

```json
{
  "id": "0b98eb1a-9e3a-4536-bed6-d10e5a7e097a",
  "initialAmount": 1500,
  "amount": 1500,
  "currency": "RUB",
  "status": "dispute",
  "statusDetails": "revert_cancelled",
  "statusTimeoutAt": null,
  "integration": {
    "externalOrderId": "merchant-10002",
    "callbackUrlStatus": "in_progress"
  }
}
```

## 7. Типовые ошибки

| Код | Когда встречается | Что делать |
| --- | --- | --- |
| `S10002` | create-запрос не успел вернуть ответ | дочитать ордер по `externalOrderId` |
| `O10000` | действие не подходит текущему статусу | сначала прочитать ордер |
| `O10001` | перед `start-payment` не выбран `payment.type` | сначала обновить `payment` |
| `O10005` | реквизиты не найдены | предложить другой метод или банк |
| `O10006` | дублируется `externalOrderId` | дочитать существующий ордер |
| `O10007` | по `externalOrderId` найдено больше одного ордера | использовать внутренний `id` или разбирать дубль |

## 8. Куда идти за полным API

- [PAYIN API: обзор](/doc/api/payin/01-overview/)
- [PAYIN API: создание и список ордеров](/doc/api/payin/02-orders/)
- [PAYIN API: действия над ордером](/doc/api/payin/04-actions/)
- [PAYIN API: payment fields и receipts](/doc/api/payin/05-receipts-and-fields/)
- [PAYIN API: dispute](/doc/api/payin/06-disputes/)
