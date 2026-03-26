---
title: "PAYIN API: payment fields и receipts"
---

## 1. GET `/shop/orders/{id}/payment-fields`

Возвращает переопределения payment-полей по настройкам магазина.

```bash
curl --location "$BASE_URL/shop/orders/94215bfb-1963-4a41-9686-f90412e0a58f/payment-fields" \
  --header "Authorization: Bearer $SHOP_TOKEN"
```

### Ожидаемый ответ

```json
[
  {
    "name": "customerCardLastDigits",
    "hidden": false,
    "pattern": "^[0-9]{4}$",
    "patternExample": "1234",
    "maxLength": 4
  }
]
```

## 2. GET `/shop/orders/{id}/receipts`

Возвращает список загруженных чеков.

```bash
curl --location "$BASE_URL/shop/orders/94215bfb-1963-4a41-9686-f90412e0a58f/receipts" \
  --header "Authorization: Bearer $SHOP_TOKEN"
```

### Ожидаемый ответ

```json
[
  {
    "filename": "receipt_20260314_120501.jpg"
  }
]
```

## 3. POST `/shop/orders/{id}/receipts`

Загрузка чека.

### Когда использовать

По коду чек можно загружать, когда ордер в одном из статусов:

- `customer_confirm`
- `trader_confirm`
- `completed`
- `cancelled`
- `dispute`
- `error`

Размер файла в проекте ограничен `3 MB`.

```bash
curl --location "$BASE_URL/shop/orders/94215bfb-1963-4a41-9686-f90412e0a58f/receipts" \
  --header "Authorization: Bearer $SHOP_TOKEN" \
  --form "file=@/tmp/receipt.jpg"
```

### Ожидаемый ответ

Если ордер не был `cancelled`, API вернёт обновлённый ордер в текущем статусе:

```json
{
  "id": "94215bfb-1963-4a41-9686-f90412e0a58f",
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
    "customerName": "IVAN IVANOV",
    "customerPhoneLastDigits": "1122",
    "customerUtr": null,
    "customerIBAN": null,
    "customerAccountNumber": null
  },
  "integration": {
    "externalOrderId": "merchant-20002",
    "callbackUrlStatus": null
  }
}
```

Если чек загружается в уже отменённый ордер, платформа автоматически переведёт его в `dispute`:

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
    "externalOrderId": "merchant-20002",
    "callbackUrlStatus": "in_progress"
  }
}
```

## 4. POST `/shop/orders/{id}/remove-receipt`

Удаление чека по имени файла.

```bash
curl --location --request POST "$BASE_URL/shop/orders/94215bfb-1963-4a41-9686-f90412e0a58f/remove-receipt" \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer $SHOP_TOKEN" \
  --data '{
    "filename": "receipt.jpg"
  }'
```

Успешный ответ: `200 OK`, тело пустое.

## 5. POST `/shop/orders/{id}/receipts/url`

Получить временную ссылку на чек.

```bash
curl --location --request POST "$BASE_URL/shop/orders/94215bfb-1963-4a41-9686-f90412e0a58f/receipts/url" \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer $SHOP_TOKEN" \
  --data '{
    "filename": "receipt.jpg"
  }'
```

### Ожидаемый ответ

```json
{
  "url": "[[STORAGE_URL]]/receipts/order/94215bfb-1963-4a41-9686-f90412e0a58f/receipt.jpg?X-Amz-Expires=60"
}
```
