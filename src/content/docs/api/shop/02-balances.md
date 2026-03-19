---
title: "Shop API: баланс и выводы"
---

Для этих методов используйте `Balance API key`.

## GET `/shop/assets`

Получить активы и балансы магазина.

```bash
curl --location "$BASE_URL/shop/assets" \
  --header "Authorization: Bearer $BALANCE_TOKEN"
```

Опциональный query:

- `exchange=default|payin|payout`

## POST `/shop/assets/withdrawals`

Создать заявку на вывод.

```bash
curl --location "$BASE_URL/shop/assets/withdrawals" \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer $BALANCE_TOKEN" \
  --data '{
    "withdrawAmount": 25,
    "address": "TRC20_WALLET_ADDRESS"
  }'
```

## GET `/shop/assets/withdrawals/{id}`

Получить информацию по заявке на вывод.

```bash
curl --location "$BASE_URL/shop/assets/withdrawals/9aa52b42-3cb7-402a-b655-0753e246ece8" \
  --header "Authorization: Bearer $BALANCE_TOKEN"
```
