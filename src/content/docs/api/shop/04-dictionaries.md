---
title: "Shop API: trade methods и справочники"
---

## GET `/shop/trade-methods`

Доступные методы для payin.

```bash
curl --location "$BASE_URL/shop/trade-methods" \
  --header "Authorization: Bearer $TOKEN"
```

## GET `/shop/trade-methods/payout`

Доступные методы для payout.

```bash
curl --location "$BASE_URL/shop/trade-methods/payout" \
  --header "Authorization: Bearer $TOKEN"
```

## Когда использовать

- до создания payin-ордера;
- до создания payout-ордера;
- для построения UI выбора банка и метода;
- для проверки обязательных полей реквизитов.
