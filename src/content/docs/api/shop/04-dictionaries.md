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

### Что важно в ответе

- `paymentType` и `bank` задают payout route, который нужно передать в `POST /shop/payout-orders`.
- `fields[]` показывает, какие ключи нужно заполнить в `customer.requisites`.
- `fields[].required=true` означает, что поле обязательно для выбранного `paymentType`.
- `customerFields[]` приходит в общей модели trade method, но в `POST /shop/payout-orders` не отправляется. Для payout-create ориентируйтесь на `fields[]`.

### Типовые payout methods и обязательные поля

Точный список методов зависит от магазина и текущих доступных route. Источник истины всегда `GET /shop/trade-methods/payout`. Ниже приведён дефолтный mapping для методов, которые укладываются в текущую схему `customer.requisites` public payout API.

| `payment.type` | Обязательные поля в `customer.requisites` | Требования к обязательным полям |
| --- | --- | --- |
| `sbp`<br />`sberpay`<br />`tsbp` | `phone` | `phone`:<br />строка длиной от `7` до `16` символов |
| `card2card` | `cardInfo` | `cardInfo`:<br />только цифры<br />длина от `16` до `19` символов |
| `tcard2card` | `cardInfo` | `cardInfo`:<br />только цифры<br />длина от `16` до `19` символов |
| `account_number` | `accountNumber` | `accountNumber`:<br />строка<br />дополнительной валидации public DTO нет |
| `account_number_iban` | `accountNumber` | `accountNumber`:<br />строка<br />для IBAN передавайте значение в формате IBAN |
| `account_number_sepa` | `accountNumber`<br />`cardholder`<br />`swiftBic` | `accountNumber`:<br />строка<br /><br />`cardholder`:<br />строка до `200` символов<br /><br />`swiftBic`:<br />строка |
| `phone_number`<br />`sim` | `phone` | `phone`:<br />строка длиной от `7` до `16` символов |
| `transfer_via_id_card` | `idCard` | `idCard`:<br />строка<br />дополнительной валидации public DTO нет |
| `upi` | `accountNumber` | `accountNumber`:<br />строка<br />дополнительной валидации public DTO нет |
| `imps` | `accountNumber`<br />`swiftBic`<br />`cardholder` | `accountNumber`:<br />строка<br /><br />`swiftBic`:<br />строка<br /><br />`cardholder`:<br />строка до `200` символов |
| `phone_pe` | `phone`<br />`accountNumber` | `phone`:<br />строка длиной от `7` до `16` символов<br /><br />`accountNumber`:<br />строка |
| `erip` | `accountNumber` | `accountNumber`:<br />строка<br />дополнительной валидации public DTO нет |

### Практические замечания

- `payment.bank` для payout route обычно обязателен. Исключение: для `card2card` его можно не передавать, сервис попробует определить банк по BIN карты и, если не сможет, подставит fallback-банк.
- В request используйте `customer.requisites.cardInfo`, а в response это значение возвращается как `customer.requisites.card`.
- Если метод требует поле вне текущего набора `customer.requisites`, не используйте такой route в `POST /shop/payout-orders` без отдельной проверки совместимости.

## Когда использовать

- до создания payin-ордера;
- до создания payout-ордера;
- для построения UI выбора банка и метода;
- для проверки обязательных полей реквизитов.
