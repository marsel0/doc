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

### Обязательные поля body

| Поле | Обязательность | Требование |
| --- | --- | --- |
| `amount` | да | положительное число больше `0` |
| `currency` | да | строка с кодом фиатной валюты, например `RUB` |
| `customer` | да | объект |
| `customer.id` | да | непустая строка |
| `customer.requisites` | да | объект<br />обязательные вложенные keys зависят от `payment.type` |
| `payment` | да | объект |
| `payment.type` | да | строка<br />должна совпадать с одним из методов из `GET /shop/trade-methods/payout` |
| `payment.bank` | да, кроме исключения | строка<br />обычно обязательна для route<br />для `card2card` может быть опущена, тогда сервис попробует определить банк по BIN карты или подставит fallback |

### Какие поля обязательны внутри `customer.requisites`

Точный набор обязательных полей нужно брать из `GET /shop/trade-methods/payout` по `fields[].required`. Для текущей public payout схемы используются такие значения:

| `payment.type` | Обязательные поля в `customer.requisites` | Требования к обязательным полям |
| --- | --- | --- |
| `sbp`<br />`sberpay`<br />`tsbp` | `phone` | `phone`:<br />строка длиной от `7` до `16` символов<br />рекомендуется передавать номер в полном формате с кодом страны |
| `card2card`<br />`tcard2card` | `cardInfo` | `cardInfo`:<br />только цифры<br />длина от `16` до `19` символов |
| `account_number`<br />`account_number_iban`<br />`upi`<br />`erip` | `accountNumber` | `accountNumber`:<br />строка<br />дополнительной валидации public DTO нет |
| `account_number_sepa` | `accountNumber`<br />`cardholder`<br />`swiftBic` | `accountNumber`:<br />строка<br /><br />`cardholder`:<br />строка до `200` символов<br /><br />`swiftBic`:<br />строка |
| `phone_number`<br />`sim` | `phone` | `phone`:<br />строка длиной от `7` до `16` символов |
| `transfer_via_id_card` | `idCard` | `idCard`:<br />строка<br />дополнительной валидации public DTO нет |
| `imps` | `accountNumber`<br />`swiftBic`<br />`cardholder` | `accountNumber`:<br />строка<br /><br />`swiftBic`:<br />строка<br /><br />`cardholder`:<br />строка до `200` символов |
| `phone_pe` | `phone`<br />`accountNumber` | `phone`:<br />строка длиной от `7` до `16` символов<br /><br />`accountNumber`:<br />строка |

### Отдельные требования integration-полей

| Поле | Требование |
| --- | --- |
| `integration.callbackUrl` | валидный абсолютный URL с протоколом |
| `integration.callbackMethod` | одно из значений `get` или `post` |

### Поля `customer.requisites`, которые принимает public payout API

- `phone`
- `cardInfo`
- `cardholder`
- `swiftBic`
- `bic`
- `idCard`
- `beneficiaryName`
- `accountNumber`
- `expirationDate`
- `taxId`

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
- в request используйте `customer.requisites.cardInfo`, а в response это значение возвращается как `customer.requisites.card`.
