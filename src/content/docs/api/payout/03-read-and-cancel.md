---
title: "PAYOUT API: чтение и отмена"
---

## GET `/shop/payout-orders/{id}`

Получить payout-ордер по ID.

```bash
curl --location "$BASE_URL/shop/payout-orders/b4ad11f1-10b3-4684-8fe4-2d6f3969e77a" \
  --header "Authorization: Bearer $TOKEN"
```

## GET `/shop/payout-orders/external/{id}`

Получить payout-ордер по `externalOrderId`.

```bash
curl --location "$BASE_URL/shop/payout-orders/external/merchant-payout-20001" \
  --header "Authorization: Bearer $TOKEN"
```

## POST `/shop/payout-orders/{id}/cancel`

Отменить payout-ордер.

```bash
curl --location --request POST "$BASE_URL/shop/payout-orders/b4ad11f1-10b3-4684-8fe4-2d6f3969e77a/cancel" \
  --header "Authorization: Bearer $TOKEN"
```

Если статус не допускает отмену, API вернёт `O10000`.

Типичный успешный результат:

- `status = cancelled`
- `statusDetails = shop`
