---
title: "PAYIN API: чтение ордеров"
---

## GET `/shop/orders/{id}`

Получить payin-ордер по внутреннему ID.

```bash
curl --location "$BASE_URL/shop/orders/94215bfb-1963-4a41-9686-f90412e0a58f" \
  --header "Authorization: Bearer $TOKEN"
```

## GET `/shop/orders/external/{id}`

Получить payin-ордер по `externalOrderId`.

```bash
curl --location "$BASE_URL/shop/orders/external/merchant-20001" \
  --header "Authorization: Bearer $TOKEN"
```

## Что проверять в ответе

- `status`
- `statusDetails`
- `statusTimeoutAt`
- `amount` и `initialAmount`
- `payment`
- `requisites`
- `integration.externalOrderId`
- `integration.callbackUrlStatus`

Если create-запрос завершился таймаутом `S10002`, именно чтение по `externalOrderId` должно быть первым шагом для восстановления состояния.
