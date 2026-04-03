---
title: "PAYIN API: trade methods"
---

## GET `/shop/trade-methods`

Возвращает payin trade methods, доступные магазину в текущий момент.

```bash
curl --location "$BASE_URL/shop/trade-methods" \
  --header "Authorization: Bearer $SHOP_TOKEN"
```

### Ожидаемый ответ

```json
[
  {
    "bank": "sberbank",
    "bankName": "Sberbank",
    "fiatCurrency": "RUB",
    "fiatCurrencySymbol": "₽",
    "fiatCurrencySymbolPosition": "after",
    "paymentType": "sbp",
    "paymentTypeName": "СБП",
    "fields": [
      { "type": "phone", "name": "phone", "required": true, "primary": true }
    ],
    "customerFields": [
      { "type": "phone", "name": "phone", "required": false }
    ],
    "parallelGroupOrdersEnabled": false,
    "compareCardLast4DigitsEnabled": false,
    "compareAccountLast4DigitsEnabled": false,
    "compareUTREnabled": false,
    "enabled": true,
    "deeplinks": []
  }
]
```

### Что читать в ответе

- `paymentType` и `bank` для выбора `payment`
- `fields[]` для состава `requisites`
- `customerFields[]` для данных плательщика
- `enabled` для фильтрации нерабочих методов
- `deeplinks[]`, если конкретный метод поддерживает deeplink

### Типовые payin methods

Ниже приведён дефолтный mapping `paymentType` для payin. В конкретной инсталляции набор может быть расширен или изменён через базу данных и админские сценарии. Источник истины для конкретного магазина всегда `GET /shop/trade-methods`.

| `payment.type` | Что приходит в `fields[]` | Что может понадобиться от плательщика в `customerFields[]` | Особенности для payin |
| --- | --- | --- | --- |
| `sbp` | `phone`<br />`cardholder`<br />`accountLastDigits`<br />`paymentLink` | `customerPhoneLastDigits`<br />`customerName`<br />`customerBank` | Основной H2H-сценарий для перевода по номеру телефона. |
| `sberpay` | `phone`<br />`cardholder`<br />`accountLastDigits` | `customerPhoneLastDigits`<br />`customerName` | Специальный случай для `RUB + sberbank`. |
| `tsbp` | `phone`<br />`cardholder`<br />`accountLastDigits` | `customerPhoneLastDigits`<br />`customerName`<br />`customerBank` | Cross-border вариант СБП. |
| `card2card` | `cardInfo`<br />`cardholder`<br />`expirationDate` | `customerName`<br />`customerCardFirstDigits`<br />`customerCardLastDigits` | Для данных плательщика важны первые 6 и последние 4 цифры карты. |
| `tcard2card` | `cardInfo`<br />`cardholder`<br />`expirationDate` | `customerName`<br />`customerCardFirstDigits`<br />`customerCardLastDigits`<br />`customerBank` | Cross-border вариант `card2card`. |
| `account_number` | `accountNumber`<br />`cardholder`<br />`bic`<br />`accountLastDigits`<br />`taxId` | `customerName`<br />`customerAccountNumber` | Bank transfer по номеру счёта. |
| `phone_number` | `phone`<br />`cardholder`<br />`paymentLink` | `customerName` | Перевод по номеру телефона вне СБП-сценария. |
| `sim` | `phone`<br />`cardholder`<br />`paymentLink` | `customerName` | По полям совпадает с `phone_number`, но это top-up SIM. |
| `transfer_via_id_card` | `idCard`<br />`cardholder` | `customerName` | Перевод по номеру ID-карты. |
| `account_number_iban` | `accountNumber`<br />`cardholder` | `customerName`<br />`customerIBAN` | В `accountNumber` приходит IBAN реквизита; `customerIBAN` тоже есть в payer fields. |
| `account_number_sepa` | `accountNumber`<br />`cardholder`<br />`swiftBic` | `customerName` | SEPA-сценарий с обязательным `swiftBic` в реквизитах. |
| `upi` | `accountNumber`<br />`cardholder`<br />`paymentLink` | `customerUtr` | `accountNumber` содержит `upi_id`. |
| `imps` | `accountNumber`<br />`swiftBic`<br />`cardholder` | `customerUtr` | `swiftBic` используется как `IFSC`, `cardholder` как имя получателя. |
| `phone_pe` | `phone`<br />`accountNumber` | `customerUtr` | `accountNumber` содержит `upi_id`. |
| `erip` | `accountNumber` | `customerName` | `accountNumber` содержит ERIP identifier. |
| `payment_link` | `paymentLink`<br />`cardholder` | по умолчанию нет | Route с платёжной ссылкой. |
| `nspk` | `qrManagerApiKey`<br />`qrManagerLogin` | по умолчанию нет | Сервисный QR/NSPK route. |

Для payout-мэппинга по `customer.requisites` и `payment.bank` смотрите [PAYOUT API: trade methods и справочники](/doc/api/payout/04-dictionaries/).
