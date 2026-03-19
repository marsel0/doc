---
title: "PAYIN API: действия над ордером"
---

## PATCH `/shop/orders/{id}`

Обновляет ордер и возвращает его актуальное состояние.

Чаще всего используется:

- в статусе `new` для задания `payment.type` и `payment.bank`;
- в статусе `customer_confirm` для записи данных о платеже клиента.

```bash
curl --location --request PATCH "$BASE_URL/shop/orders/94215bfb-1963-4a41-9686-f90412e0a58f" \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer $TOKEN" \
  --data '{
    "payment": {
      "type": "card2card",
      "bank": "tbank"
    }
  }'
```

## POST `/shop/orders/{id}/start-payment`

Запускает поиск реквизитов.

```bash
curl --location --request POST "$BASE_URL/shop/orders/94215bfb-1963-4a41-9686-f90412e0a58f/start-payment" \
  --header "Authorization: Bearer $TOKEN"
```

Тело может содержать `UpdateOrderDto`, если вы хотите обновить ордер непосредственно перед стартом.

Если `payment.type` не выбран, API вернёт `O10001`.

## POST `/shop/orders/{id}/confirm-payment`

Подтверждает, что клиент выполнил перевод.

```bash
curl --location --request POST "$BASE_URL/shop/orders/94215bfb-1963-4a41-9686-f90412e0a58f/confirm-payment" \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer $TOKEN" \
  --data '{
    "payment": {
      "customerCardLastDigits": "1234",
      "customerPhoneLastDigits": "1122",
      "customerBank": "tbank"
    }
  }'
```

Работает только в допустимом статусе, обычно `customer_confirm`. Иначе будет `O10000`.

## POST `/shop/orders/{id}/cancel`

Отменяет ордер.

```bash
curl --location --request POST "$BASE_URL/shop/orders/94215bfb-1963-4a41-9686-f90412e0a58f/cancel" \
  --header "Authorization: Bearer $TOKEN"
```

Типичный результат:

- `status = cancelled`
- `statusDetails = shop`
