---
title: "PayOut API: способы и поля"
---

## GET `/shop/trade-methods/payout`

Возвращает payout trade methods, доступные магазину в текущий момент.

```bash
curl --location "$BASE_URL/shop/trade-methods/payout" \
  --header "Authorization: Bearer $SHOP_TOKEN"
```

### Что важно в ответе

- `paymentType` и `bank` задают payout route для [`POST /shop/payout-orders`](/doc/api/payout/02-orders/#post-shoppayout-orders).
- `fields[]` показывает, какие ключи нужно заполнить в `customer.requisites`.
- `fields[].required=true` означает, что поле обязательно для выбранного `paymentType`.
- `customerFields[]` приходит в общей модели trade method, но в [`POST /shop/payout-orders`](/doc/api/payout/02-orders/#post-shoppayout-orders) не отправляется. Для payout-create ориентируйтесь на `fields[]`.

### Типовые payout methods и обязательные поля

Точный список методов зависит от магазина и текущих доступных route. Источник истины — [`GET /shop/trade-methods/payout`](#get-shoptrade-methodspayout). Ниже приведён дефолтный mapping для методов, которые укладываются в текущую схему `customer.requisites` public payout API.

| `payment.type` | Что обязательно передавать в `customer.requisites` | `payment.bank` | Комментарий |
| --- | --- | --- | --- |
| `sbp`<br />`sberpay`<br />`tsbp` | `phone` | рекомендуется | `phone` в public DTO: строка длиной от `7` до `16` символов. |
| `card2card` | `cardInfo` | необязательно | Без банка сервис попробует определить его по BIN карты, затем подставит fallback. `cardInfo`: ровно `16` цифр. |
| `tcard2card` | `cardInfo` | рекомендуется | `cardInfo`: ровно `16` цифр. |
| `account_number` | `accountNumber` | рекомендуется | `accountNumber`: строка, дополнительной валидации public DTO нет. |
| `account_number_iban` | `accountNumber` | рекомендуется | Для IBAN передавайте значение в `accountNumber`. |
| `account_number_sepa` | `accountNumber`<br />`cardholder`<br />`swiftBic` | рекомендуется | `cardholder`: строка до `200` символов. `swiftBic`: строка. |
| `phone_number`<br />`sim` | `phone` | рекомендуется | `phone`: строка длиной от `7` до `16` символов. |
| `transfer_via_id_card` | `idCard` | рекомендуется | `idCard`: строка, дополнительной валидации public DTO нет. |
| `upi` | `accountNumber` | рекомендуется | В `accountNumber` передавайте `upi_id`. |
| `imps` | `accountNumber`<br />`swiftBic`<br />`cardholder` | рекомендуется | В public payout DTO `swiftBic` используется для `IFSC`, а `cardholder` для `beneficiary name`. |
| `phone_pe` | `phone`<br />`accountNumber` | рекомендуется | В `accountNumber` передавайте `upi_id`. |
| `erip` | `accountNumber` | рекомендуется | В `accountNumber` передавайте ERIP identifier. |
| `payment_link` | не поддержан текущим public payout DTO | — | У route есть `fields[]`, но поле `paymentLink` не входит в DTO [`POST /shop/payout-orders`](/doc/api/payout/02-orders/#post-shoppayout-orders). |
| `nspk` | не поддержан текущим public payout DTO | — | Поля `qrManagerApiKey` / `qrManagerLogin` не входят в DTO [`POST /shop/payout-orders`](/doc/api/payout/02-orders/#post-shoppayout-orders). |

### Практические замечания

- `payment.bank` необязателен по схеме API, но явный `bank` из payout trade methods делает маршрут предсказуемым. Без банка используется определение по BIN карты или fallback.
- В request используйте `customer.requisites.cardInfo`, а в response это значение возвращается как `customer.requisites.card`.
- Если метод требует поле вне текущего набора `customer.requisites`, не используйте такой route в [`POST /shop/payout-orders`](/doc/api/payout/02-orders/#post-shoppayout-orders) без отдельной проверки совместимости.
- Назначение остальных кодов: [справочник `payment.type`](/doc/api/shop/05-payment-types/).
