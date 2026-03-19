---
title: "PAYIN API: dispute"
---

## POST `/shop/orders/{id}/dispute`

Открыть dispute по внутреннему ID ордера.

Тело: `multipart/form-data`

- `amount` , опционально;
- `file` , опционально.

```bash
curl --location "$BASE_URL/shop/orders/94215bfb-1963-4a41-9686-f90412e0a58f/dispute" \
  --header "Authorization: Bearer $TOKEN" \
  --form "amount=1500" \
  --form "file=@/tmp/receipt.jpg"
```

## POST `/shop/orders/external/{id}/dispute`

Открыть dispute по `externalOrderId`.

```bash
curl --location "$BASE_URL/shop/orders/external/merchant-20001/dispute" \
  --header "Authorization: Bearer $TOKEN" \
  --form "amount=1500"
```

## POST `/shop/orders/{id}/dispute/cancel`

Закрыть dispute по внутреннему ID.

```bash
curl --location --request POST "$BASE_URL/shop/orders/94215bfb-1963-4a41-9686-f90412e0a58f/dispute/cancel" \
  --header "Authorization: Bearer $TOKEN"
```

## POST `/shop/orders/external/{id}/dispute/cancel`

Закрыть dispute по `externalOrderId`.

```bash
curl --location --request POST "$BASE_URL/shop/orders/external/merchant-20001/dispute/cancel" \
  --header "Authorization: Bearer $TOKEN"
```

Во всех случаях ответом будет обновлённый `GetShopOrderDto`.
