---
title: "Public API: справочники"
---

```bash
export PUBLIC_BASE_URL="[[BASE_URL]]"
```

## GET `/banks`

Список банков.

Поддерживает query:

- `orderId`
- `fiatCurrency`
- `bank`
- `paymentType`

```bash
curl --location "$PUBLIC_BASE_URL/banks?fiatCurrency=RUB&paymentType=sbp"
```

## GET `/payment-types`

Список payment types.

```bash
curl --location "$PUBLIC_BASE_URL/payment-types?fiatCurrency=RUB&bank=sberbank"
```

## GET `/currencies/fiat`

Список фиатных валют.

```bash
curl --location "$PUBLIC_BASE_URL/currencies/fiat"
```

## GET `/currencies/asset`

Список asset-валют.

```bash
curl --location "$PUBLIC_BASE_URL/currencies/asset"
```

## GET `/trade-methods`

Общий публичный список trade methods.

```bash
curl --location "$PUBLIC_BASE_URL/trade-methods"
```

## Что такое `trade method`

В `simple-pay` `trade method` это не отдельный enum, а конкретная связка:

- банк
- фиатная валюта
- `paymentType`

Публичный endpoint `/trade-methods` возвращает уже обогащённую структуру с полями вроде:

- `bank`
- `bankName`
- `fiatCurrency`
- `paymentType`
- `paymentTypeName`
- `fields`
- `customerFields`

По умолчанию платформа создаёт `trade method` как комбинации всех дефолтных `paymentType` со всеми неархивными банками для дефолтной фиатной валюты.

## Дефолтные `paymentType`

Ниже приведён дефолтный набор `paymentType`, который зашит в код платформы. В конкретной инсталляции набор может быть расширен или изменён через базу данных и админские сценарии.

`QR-код`: `+` — генерируется, `+/-` — генерируется не всегда, `-` — не генерируется.

| Русское название | code/type | QR-код | Особенности |
| --- | --- | --- | --- |
| СБП | `sbp` | `+/-` | Реквизиты: телефон, держатель, последние цифры счёта, опционально `payment_link`; от клиента: последние цифры телефона, ФИО, банк. |
| SberPay | `sberpay` | `-` | По структуре близок к СБП; от клиента: последние цифры телефона и ФИО. Специальный случай: допустим только для `RUB + sberbank`. |
| Трансграничный СБП | `tsbp` | `-` | Как СБП, но для cross-border сценария; от клиента тоже обязателен банк. |
| Перевод с карты на карту | `card2card` | `-` | Реквизиты: номер карты, держатель, опционально срок действия; от клиента: ФИО, первые 6 и последние 4 цифры карты. |
| Трансграничный перевод с карты на карту | `tcard2card` | `-` | Как `card2card`, но дополнительно у клиента обязателен банк. |
| Перевод по номеру счёта | `account_number` | `+/-` | Реквизиты: счёт, держатель, БИК, последние цифры счёта, ИНН; от клиента: ФИО и номер счёта. |
| Перевод по номеру телефона | `phone_number` | `+/-` | Реквизиты: телефон, держатель, опционально `payment_link`; от клиента: ФИО. |
| Пополнение баланса SIM карты | `sim` | `+/-` | По полям совпадает с `phone_number`, но семантически это top-up SIM. |
| Перевод по номеру ID карты | `transfer_via_id_card` | `-` | Реквизиты: `id_card` и держатель; от клиента: ФИО. |
| Перевод по номеру счёта (IBAN) | `account_number_iban` | `-` | Реквизиты: IBAN и держатель; от клиента: ФИО и скрытый `customer_iban`, есть отдельная валидация формата и длины. |
| Перевод по номеру счёта (SEPA) | `account_number_sepa` | `-` | Реквизиты: IBAN, обязательный держатель, обязательный `swift_bic`; от клиента: ФИО. |
| UPI | `upi` | `+/-` | Реквизиты: `upi_id`, держатель, опционально `payment_link`; от клиента: `UTR`. |
| IMPS | `imps` | `-` | Реквизиты: номер счёта IMPS, `IFSC`, имя получателя; от клиента: `UTR`. |
| PhonePe | `phone_pe` | `-` | Реквизиты: телефон и `upi_id`; от клиента: `UTR`. |
| ЕРИП | `erip` | `-` | Один основной реквизит `erip`; от клиента: ФИО. |
| Платёжная ссылка | `payment_link` | `-` | Реквизиты: `payment_link` и держатель; клиентские поля по умолчанию не заданы. |
| НСПК | `nspk` | `+` | Сервисный метод: реквизиты `QRManagerAPIKey` и опционально `QRManagerLogin`; клиентские поля по умолчанию не заданы. |

## Примечание по `phone_tm`

Код `phone_tm` присутствует в enum-ах проекта, но не входит в дефолтный список `paymentType` и по умолчанию не создаётся.

## GET `/meta`

Публичные метаданные API.

```bash
curl --location "$PUBLIC_BASE_URL/meta"
```
