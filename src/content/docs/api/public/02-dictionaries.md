---
title: "Public API: справочники"
pagefind: false
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

`Trade method` — это не отдельный enum, а конкретная связка:

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

## Где смотреть соответствия PayIn и PayOut

- Для PayIn смотрите [доступные способы и состав полей](/doc/api/shop/04-dictionaries/),
  а также [назначение `payment.type`](/doc/api/shop/05-payment-types/).
- Для PayOut смотрите [способы и обязательные поля](/doc/api/payout/04-dictionaries/).

## Примечание по `phone_tm`

Код `phone_tm` присутствует в enum-ах проекта, но не входит в дефолтный список `paymentType` и по умолчанию не создаётся.

## GET `/meta`

Публичные метаданные API.

```bash
curl --location "$PUBLIC_BASE_URL/meta"
```
