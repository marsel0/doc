---
title: "PAYIN API: dispute"
---

В merchant API `dispute` открывается только по уже отменённому ордеру. Если статус не подходит, API вернёт `O10000`.

## 1. POST `/shop/orders/{id}/dispute`

Открыть dispute по внутреннему `id`.

Тело: `multipart/form-data`

- `amount` , опционально;
- `file` , опционально.

```bash
curl --location "$BASE_URL/shop/orders/94215bfb-1963-4a41-9686-f90412e0a58f/dispute" \
  --header "Authorization: Bearer $SHOP_TOKEN" \
  --form "amount=1500" \
  --form "file=@/tmp/receipt.jpg"
```

### Ожидаемый ответ

```json
{
  "id": "94215bfb-1963-4a41-9686-f90412e0a58f",
  "initialAmount": 1500,
  "amount": 1500,
  "currency": "RUB",
  "status": "dispute",
  "statusDetails": "revert_cancelled",
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
  "integration": {
    "externalOrderId": "merchant-20001",
    "callbackUrlStatus": "in_progress"
  }
}
```

## 2. POST `/shop/orders/external/{id}/dispute`

Открыть dispute по `externalOrderId`.

```bash
curl --location "$BASE_URL/shop/orders/external/merchant-20001/dispute" \
  --header "Authorization: Bearer $SHOP_TOKEN" \
  --form "amount=1500"
```

### Ожидаемый ответ

```json
{
  "id": "94215bfb-1963-4a41-9686-f90412e0a58f",
  "initialAmount": 1500,
  "amount": 1500,
  "currency": "RUB",
  "status": "dispute",
  "statusDetails": "revert_cancelled",
  "statusTimeoutAt": null,
  "integration": {
    "externalOrderId": "merchant-20001",
    "callbackUrlStatus": "in_progress"
  }
}
```

## 3. POST `/shop/orders/{id}/dispute/cancel`

Закрыть dispute по внутреннему ID.

```bash
curl --location --request POST "$BASE_URL/shop/orders/94215bfb-1963-4a41-9686-f90412e0a58f/dispute/cancel" \
  --header "Authorization: Bearer $SHOP_TOKEN"
```

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
  "integration": {
    "externalOrderId": "merchant-20001",
    "callbackUrlStatus": "in_progress"
  }
}
```

## 4. POST `/shop/orders/external/{id}/dispute/cancel`

Закрыть dispute по `externalOrderId`.

```bash
curl --location --request POST "$BASE_URL/shop/orders/external/merchant-20001/dispute/cancel" \
  --header "Authorization: Bearer $SHOP_TOKEN"
```

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
  "integration": {
    "externalOrderId": "merchant-20001",
    "callbackUrlStatus": "in_progress"
  }
}
```
