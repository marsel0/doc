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

## Что важно в ответе

- `paymentType` и `bank` задают route.
- `fields[]` описывает поля реквизитов.
- `customerFields[]` описывает дополнительные поля клиента или плательщика.
- `enabled` и `deeplinks[]` помогают собрать UI и фильтровать недоступные методы.

## Куда смотреть mapping

- Для payin mapping по `fields[]` / `customerFields[]` смотрите [PAYIN API: trade methods](/doc/api/payin/07-auxiliary/).
- Для payout mapping по `customer.requisites` и `payment.bank` смотрите [PAYOUT API: trade methods и справочники](/doc/api/payout/04-dictionaries/).

## Когда использовать

- до создания payin-ордера;
- до создания payout-ордера;
- для построения UI выбора банка и метода;
- для проверки обязательных полей реквизитов.
