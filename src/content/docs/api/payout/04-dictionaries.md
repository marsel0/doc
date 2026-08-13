---
title: "PayOut API: способы и поля"
---

## GET `/shop/trade-methods/payout`

Возвращает доступные магазину способы PayOut.

```bash
curl --location "$BASE_URL/shop/trade-methods/payout" \
  --header "Authorization: Bearer $SHOP_TOKEN"
```

### Что важно в ответе

- `paymentType` и `bank` задают способ выплаты для [`POST /shop/payout-orders`](/doc/api/payout/02-orders/#post-shoppayout-orders).
- `fields[]` показывает, какие ключи нужно заполнить в `customer.requisites`.
- `fields[].required=true` означает, что поле обязательно для выбранного `paymentType`.
- `customerFields[]` приходит в общем ответе, но в [`POST /shop/payout-orders`](/doc/api/payout/02-orders/#post-shoppayout-orders) не отправляется. Для создания PayOut-ордера используйте `fields[]`.

### Типовые методы PayOut и обязательные поля

Точный список методов зависит от настроек магазина. Можно использовать
согласованную таблицу кодов или получить список через
[`GET /shop/trade-methods/payout`](#get-shoptrade-methodspayout). Ниже приведён
типовую таблицу методов, которые поддерживает текущая схема
`customer.requisites` публичного PayOut API.

| `payment.type` | Что обязательно передавать в `customer.requisites` | `payment.bank` | Комментарий |
| --- | --- | --- | --- |
| `sbp`<br />`sberpay`<br />`tsbp` | `phone` | рекомендуется | `phone`: строка длиной от `7` до `16` символов. |
| `card2card` | `cardInfo` | необязательно | Без банка сервис попробует определить его по первым 6 цифрам карты, затем выберет настроенный вариант. `cardInfo`: ровно `16` цифр. |
| `tcard2card` | `cardInfo` | рекомендуется | `cardInfo`: ровно `16` цифр. |
| `account_number` | `accountNumber` | рекомендуется | `accountNumber`: строка; API не проверяет формат дополнительно. |
| `account_number_iban` | `accountNumber` | рекомендуется | Для IBAN передавайте значение в `accountNumber`. |
| `account_number_sepa` | `accountNumber`<br />`cardholder`<br />`swiftBic` | рекомендуется | `cardholder`: строка до `200` символов. `swiftBic`: строка. |
| `phone_number`<br />`sim` | `phone` | рекомендуется | `phone`: строка длиной от `7` до `16` символов. |
| `transfer_via_id_card` | `idCard` | рекомендуется | `idCard`: строка; API не проверяет формат дополнительно. |
| `upi` | `accountNumber` | рекомендуется | В `accountNumber` передавайте `upi_id`. |
| `imps` | `accountNumber`<br />`swiftBic`<br />`cardholder` | рекомендуется | В DTO публичного PayOut API `swiftBic` используется для `IFSC`, а `cardholder` — для имени получателя. |
| `phone_pe` | `phone`<br />`accountNumber` | рекомендуется | В `accountNumber` передавайте `upi_id`. |
| `erip` | `accountNumber` | рекомендуется | В `accountNumber` передавайте ERIP identifier. |
| `payment_link` | не поддерживается в запросе PayOut | — | `paymentLink` нельзя передать в [`POST /shop/payout-orders`](/doc/api/payout/02-orders/#post-shoppayout-orders). |
| `nspk` | не поддерживается в запросе PayOut | — | `qrManagerApiKey` и `qrManagerLogin` нельзя передать в [`POST /shop/payout-orders`](/doc/api/payout/02-orders/#post-shoppayout-orders). |

### Практические замечания

- `payment.bank` необязателен по схеме API, но явный согласованный `bank` делает
  маршрут предсказуемым. При необходимости код можно получить из списка методов
  PayOut. Без банка сервис определяет его по карте или выбирает настроенный вариант.
- В request используйте `customer.requisites.cardInfo`, а в response это значение возвращается как `customer.requisites.card`.
- Если нужного поля нет в `customer.requisites`, не используйте этот способ в [`POST /shop/payout-orders`](/doc/api/payout/02-orders/#post-shoppayout-orders) без согласования.
- Назначение остальных кодов: [справочник `payment.type`](/doc/api/shop/05-payment-types/).
