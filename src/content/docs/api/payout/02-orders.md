---
title: "PAYOUT API: создание и список ордеров"
---

## GET `/shop/payout-orders`

Возвращает список payout-ордеров в формате `PaginatedData<GetShopPayoutOrderDto>`.

### Query

- `from` , обязательно
- `to` , обязательно
- `status` , опционально
- `take` , опционально
- `page` , опционально

```bash
curl --location "$BASE_URL/shop/payout-orders?from=2026-03-01&to=2026-03-14&status=completed&take=50&page=1" \
  --header "Authorization: Bearer $TOKEN"
```

## POST `/shop/payout-orders`

Создаёт payout-ордер.

```bash
curl --location "$BASE_URL/shop/payout-orders" \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer $TOKEN" \
  --data '{
    "amount": 1200,
    "currency": "RUB",
    "customer": {
      "id": "payout-20001",
      "requisites": {
        "phone": "+79990001122"
      }
    },
    "payment": {
      "type": "sbp",
      "bank": "sberbank"
    },
    "integration": {
      "externalOrderId": "merchant-payout-20001",
      "callbackUrl": "[[PAYOUT_CALLBACK_URL]]",
      "callbackMethod": "post"
    }
  }'
```

Ответ: `GetShopPayoutOrderDto`.

Практически важные поля:

- `status`, после успешного create обычно `requisites`;
- `payment.type` и `payment.bank`;
- `integration.externalOrderId`;
- `integration.callbackUrlStatus`.
