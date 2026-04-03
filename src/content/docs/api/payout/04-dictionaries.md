---
title: "PAYOUT API: trade methods и справочники"
---

## GET `/shop/trade-methods/payout`

Возвращает payout trade methods, доступные магазину в текущий момент.

```bash
curl --location "$BASE_URL/shop/trade-methods/payout" \
  --header "Authorization: Bearer $SHOP_TOKEN"
```

### Что важно в ответе

- `paymentType` и `bank` задают payout route, который нужно передать в `POST /shop/payout-orders`.
- `fields[]` показывает, какие ключи нужно заполнить в `customer.requisites`.
- `fields[].required=true` означает, что поле обязательно для выбранного `paymentType`.
- `customerFields[]` приходит в общей модели trade method, но в `POST /shop/payout-orders` не отправляется. Для payout-create ориентируйтесь на `fields[]`.

### Типовые payout methods и обязательные поля

Точный список методов зависит от магазина и текущих доступных route. Источник истины всегда `GET /shop/trade-methods/payout`. Ниже приведён дефолтный mapping для методов, которые укладываются в текущую схему `customer.requisites` public payout API.

| `payment.type` | Что обязательно передавать в `customer.requisites` | `payment.bank` | Комментарий |
| --- | --- | --- | --- |
| `sbp`<br />`sberpay`<br />`tsbp` | `phone` | обычно да | `phone` в public DTO: строка длиной от `7` до `16` символов. |
| `card2card` | `cardInfo` | обычно да, но можно не передавать | Если `payment.bank` не передан, сервис попробует определить банк по BIN карты; если не сможет, подставит fallback-банк. `cardInfo`: только цифры, длина от `16` до `19` символов. |
| `tcard2card` | `cardInfo` | да | `cardInfo`: только цифры, длина от `16` до `19` символов. |
| `account_number` | `accountNumber` | да | `accountNumber`: строка, дополнительной валидации public DTO нет. |
| `account_number_iban` | `accountNumber` | да | Для IBAN передавайте значение в `accountNumber`. |
| `account_number_sepa` | `accountNumber`<br />`cardholder`<br />`swiftBic` | да | `cardholder`: строка до `200` символов. `swiftBic`: строка. |
| `phone_number`<br />`sim` | `phone` | да | `phone`: строка длиной от `7` до `16` символов. |
| `transfer_via_id_card` | `idCard` | да | `idCard`: строка, дополнительной валидации public DTO нет. |
| `upi` | `accountNumber` | да | В `accountNumber` передавайте `upi_id`. |
| `imps` | `accountNumber`<br />`swiftBic`<br />`cardholder` | да | В public payout DTO `swiftBic` используется для `IFSC`, а `cardholder` для `beneficiary name`. |
| `phone_pe` | `phone`<br />`accountNumber` | да | В `accountNumber` передавайте `upi_id`. |
| `erip` | `accountNumber` | да | В `accountNumber` передавайте ERIP identifier. |
| `payment_link` | не поддержан текущим public payout DTO | да | У route есть `fields[]`, но поле `paymentLink` не входит в текущий DTO `POST /shop/payout-orders`. |
| `nspk` | не поддержан текущим public payout DTO | да | Поля `qrManagerApiKey` / `qrManagerLogin` не входят в текущий DTO `POST /shop/payout-orders`. |

### Практические замечания

- `payment.bank` для payout route обычно обязателен. Исключение: для `card2card` его можно не передавать, сервис попробует определить банк по BIN карты и, если не сможет, подставит fallback-банк.
- В request используйте `customer.requisites.cardInfo`, а в response это значение возвращается как `customer.requisites.card`.
- Если метод требует поле вне текущего набора `customer.requisites`, не используйте такой route в `POST /shop/payout-orders` без отдельной проверки совместимости.
