---
title: "PayOut API: чтение и отмена"
---

## GET `/shop/payout-orders/{id}`

Получить PayOut-ордер по ID.

```bash
curl --location "$BASE_URL/shop/payout-orders/b4ad11f1-10b3-4684-8fe4-2d6f3969e77a" \
  --header "Authorization: Bearer $SHOP_TOKEN"
```

## GET `/shop/payout-orders/external/{id}`

Получить PayOut-ордер по `externalOrderId`.

```bash
curl --location "$BASE_URL/shop/payout-orders/external/merchant-payout-20001" \
  --header "Authorization: Bearer $SHOP_TOKEN"
```

## POST `/shop/payout-orders/{id}/cancel`

Отменить PayOut-ордер можно только в `requisites` или `trader_accept`. В
`trader_payment`, финальных и спорных статусах метод недоступен.

```bash
curl --location --request POST "$BASE_URL/shop/payout-orders/b4ad11f1-10b3-4684-8fe4-2d6f3969e77a/cancel" \
  --header "Authorization: Bearer $SHOP_TOKEN"
```

Если статус не допускает отмену, API вернёт `O10000`. Успешная отмена переводит
PayOut-ордер в `cancelled`, устанавливает `statusDetails: shop` и отправляет уведомление.

Типичный успешный результат:

- `status = cancelled`
- `statusDetails = shop`
