---
title: "PAYIN API: payment fields и receipts"
---

## GET `/shop/orders/{id}/payment-fields`

Возвращает переопределения payment-полей по настройкам магазина.

```bash
curl --location "$BASE_URL/shop/orders/94215bfb-1963-4a41-9686-f90412e0a58f/payment-fields" \
  --header "Authorization: Bearer $TOKEN"
```

Ответ: массив `FormFieldOverride`.

## GET `/shop/orders/{id}/receipts`

Возвращает список загруженных чеков.

```bash
curl --location "$BASE_URL/shop/orders/94215bfb-1963-4a41-9686-f90412e0a58f/receipts" \
  --header "Authorization: Bearer $TOKEN"
```

Ответ: массив `GetReceiptDto` с полем `filename`.

## POST `/shop/orders/{id}/receipts`

Загрузка чека.

По коду проекта размер файла ограничен `3 MB`.

```bash
curl --location "$BASE_URL/shop/orders/94215bfb-1963-4a41-9686-f90412e0a58f/receipts" \
  --header "Authorization: Bearer $TOKEN" \
  --form "file=@/tmp/receipt.jpg"
```

Ответ: обновлённый `GetShopOrderDto`.

## POST `/shop/orders/{id}/remove-receipt`

Удаление чека по имени файла.

```bash
curl --location --request POST "$BASE_URL/shop/orders/94215bfb-1963-4a41-9686-f90412e0a58f/remove-receipt" \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer $TOKEN" \
  --data '{
    "filename": "receipt.jpg"
  }'
```

Успешный ответ: `200 OK`, тело пустое.

## POST `/shop/orders/{id}/receipts/url`

Получить временную ссылку на чек.

```bash
curl --location --request POST "$BASE_URL/shop/orders/94215bfb-1963-4a41-9686-f90412e0a58f/receipts/url" \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer $TOKEN" \
  --data '{
    "filename": "receipt.jpg"
  }'
```

Ответ: `GetReceiptUrlDto`.
