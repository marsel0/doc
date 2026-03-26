---
title: "PAYIN API: чтение ордеров"
---

Оба endpoint-а ниже возвращают `GetShopOrderDto`. Полный состав полей описан в [PAYIN API: обзор](/doc/api/payin/01-overview/).

## 1. GET `/shop/orders/{id}`

Получить payin-ордер по внутреннему `id`.

```bash
curl --location "$BASE_URL/shop/orders/94215bfb-1963-4a41-9686-f90412e0a58f" \
  --header "Authorization: Bearer $SHOP_TOKEN"
```

### Ожидаемый ответ

```json
{
  "id": "94215bfb-1963-4a41-9686-f90412e0a58f",
  "initialAmount": 1500,
  "amount": 1500,
  "currency": "RUB",
  "status": "customer_confirm",
  "statusDetails": null,
  "statusTimeoutAt": "2026-03-14T12:40:00.000Z",
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
    "id": "order-20002",
    "name": null,
    "email": "buyer@example.com",
    "phone": "+79990001122"
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
    "externalOrderId": "merchant-20002",
    "callbackUrlStatus": "in_progress"
  }
}
```

## 2. GET `/shop/orders/external/{id}`

Получить payin-ордер по `externalOrderId`.

```bash
curl --location "$BASE_URL/shop/orders/external/merchant-20001" \
  --header "Authorization: Bearer $SHOP_TOKEN"
```

### Ожидаемый ответ

```json
{
  "id": "94215bfb-1963-4a41-9686-f90412e0a58f",
  "initialAmount": 1500,
  "amount": 1500,
  "currency": "RUB",
  "status": "completed",
  "statusDetails": null,
  "statusTimeoutAt": null,
  "shop": {
    "name": "simple-pay-demo",
    "customerDataCollectionOrder": "before_payment",
    "collectCustomerReceipts": true
  },
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
    "externalOrderId": "merchant-20001",
    "callbackUrlStatus": "success"
  }
}
```

Если по одному `externalOrderId` найдено больше одного ордера, API вернёт `O10007`.

## 3. Что проверять в ответе

### Для жизненного цикла

- `status`
- `statusDetails`
- `statusTimeoutAt`

### Для суммы и payment flow

- `initialAmount`
- `amount`
- `payment`
- `requisites`

### Для корреляции с системой магазина

- `id`
- `integration.externalOrderId`
- `integration.callbackUrlStatus`
- `customer.id`

Если create-запрос завершился таймаутом `S10002`, именно чтение по `externalOrderId` должно быть первым шагом для восстановления состояния.
