---
title: "PAYIN API: действия над ордером"
---

Ниже описаны merchant action endpoint-ы. Статусы и поля ордера вынесены в [PAYIN API: обзор](/doc/api/payin/01-overview/), чтобы не дублировать их на каждой странице.

## 1. PATCH `/shop/orders/{id}`

Обновляет ордер и возвращает актуальное состояние ордера.

### Когда использовать

- в статусе `new` для выбора `payment.type` и `payment.bank`;
- в статусе `customer_confirm` для записи данных о платеже клиента;
- в статусе `customer_confirm` для установки `customerConfirmStatusDetails`.

### Какие поля можно передавать

| Поле | Когда использовать |
| --- | --- |
| `payment.type` | только когда ордер в `new` |
| `payment.bank` | только когда ордер в `new` |
| `payment.customerCardFirstDigits` | только когда ордер в `customer_confirm` |
| `payment.customerCardLastDigits` | только когда ордер в `customer_confirm` |
| `payment.customerBank` | только когда ордер в `customer_confirm` |
| `payment.customerName` | только когда ордер в `customer_confirm` |
| `payment.customerPhoneLastDigits` | только когда ордер в `customer_confirm` |
| `payment.customerUtr` | только когда ордер в `customer_confirm` |
| `payment.customerIBAN` | только когда ордер в `customer_confirm` |
| `payment.customerAccountNumber` | только когда ордер в `customer_confirm` |
| `customerConfirmStatusDetails` | только когда ордер в `customer_confirm` |

### Пример: выбрать метод оплаты

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
  "requisites": null,
  "shop": {
    "name": "simple-pay-demo",
    "customerDataCollectionOrder": "before_payment",
    "collectCustomerReceipts": true
  },
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
  "customer": {
    "id": "order-20001",
    "name": null,
    "email": "buyer@example.com",
    "phone": "+79990001122",
    "ip": null,
    "fingerprint": null
  },
  "integration": {
    "externalOrderId": "merchant-20001",
    "callbackUrlStatus": null
  }
}
```

### Пример: записать данные плательщика

```bash
curl --location --request PATCH "$BASE_URL/shop/orders/0b98eb1a-9e3a-4536-bed6-d10e5a7e097a" \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer $SHOP_TOKEN" \
  --data '{
    "payment": {
      "customerCardLastDigits": "1234",
      "customerPhoneLastDigits": "1122",
      "customerBank": "tbank",
      "customerName": "IVAN IVANOV"
    },
    "customerConfirmStatusDetails": "customer_payed"
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
  "statusDetails": "customer_payed",
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
  "payment": {
    "type": "sbp",
    "bank": "sberbank",
    "customerCardFirstDigits": null,
    "customerCardLastDigits": "1234",
    "customerPhoneLastDigits": "1122",
    "customerBank": "tbank",
    "customerName": "IVAN IVANOV",
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
    "callbackUrlStatus": null
  }
}
```

## 2. POST `/shop/orders/{id}/start-payment`

Запускает поиск реквизитов. Нормальный merchant flow для этого endpoint-а: ордер в `new`, а `payment.type` уже выбран.

Если `payment.type` ещё не выбран, API вернёт `O10001`.

### `curl`

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
  "customer": {
    "id": "order-20001",
    "name": null,
    "email": "buyer@example.com",
    "phone": "+79990001122",
    "ip": null,
    "fingerprint": null
  },
  "integration": {
    "externalOrderId": "merchant-20001",
    "callbackUrlStatus": null
  }
}
```

После этого реквизиты будут подобраны асинхронно, а ордер перейдёт в `customer_confirm`.

Тело запроса может содержать `UpdateOrderDto`, если вы хотите обновить ордер непосредственно перед стартом.

## 3. POST `/shop/orders/{id}/confirm-payment`

Подтверждает, что клиент выполнил перевод.

### Когда использовать

По коду endpoint подтверждения работает только в статусе `customer_confirm`. В остальных случаях API вернёт `O10000`.

### `curl`

```bash
curl --location --request POST "$BASE_URL/shop/orders/0b98eb1a-9e3a-4536-bed6-d10e5a7e097a/confirm-payment" \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer $SHOP_TOKEN" \
  --data '{
    "payment": {
      "customerCardLastDigits": "1234",
      "customerPhoneLastDigits": "1122",
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
  "payment": {
    "type": "sbp",
    "bank": "sberbank",
    "customerCardFirstDigits": null,
    "customerCardLastDigits": "1234",
    "customerPhoneLastDigits": "1122",
    "customerBank": "tbank",
    "customerName": null,
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
    "callbackUrlStatus": null
  }
}
```

## 4. POST `/shop/orders/{id}/cancel`

Отменяет ордер.

```bash
curl --location --request POST "$BASE_URL/shop/orders/94215bfb-1963-4a41-9686-f90412e0a58f/cancel" \
  --header "Authorization: Bearer $SHOP_TOKEN"
```

### Когда использовать

По коду merchant cancel разрешён только для статусов:

- `new`
- `requisites`
- `customer_confirm`

В остальных случаях API вернёт `O10000`.

### Ожидаемый ответ

```json
{
  "id": "94215bfb-1963-4a41-9686-f90412e0a58f",
  "initialAmount": 1500,
  "amount": 1500,
  "currency": "RUB",
  "status": "cancelled",
  "statusDetails": "shop",
  "statusTimeoutAt": null,
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
  "customer": {
    "id": "order-20001",
    "name": null,
    "email": "buyer@example.com",
    "phone": "+79990001122",
    "ip": null,
    "fingerprint": null
  },
  "integration": {
    "externalOrderId": "merchant-20001",
    "callbackUrlStatus": "in_progress"
  }
}
```
