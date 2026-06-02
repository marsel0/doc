---
title: "Выбор банка и типа оплаты"
description: "Как использовать trade methods для bank, payment.type, fields и customerFields"
---

`trade methods` — это основной источник истины для выбора банка, типа оплаты и набора полей, которые нужно показывать клиенту или собирать от него.

## Какие методы использовать

Для `PayIn`:

- `GET /public/api/v1/shop/trade-methods` <a href="[[DOMAIN_URL]]/public/api/payin#tag/v1shoptrade-methods/operation/ShopTradeMethodsController_getTradeMethods" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>

Для `PayOut`:

- `GET /public/api/v1/shop/trade-methods/payout` <a href="[[DOMAIN_URL]]/public/api/payout#tag/v1shoptrade-methodspayout/operation/ShopTradeMethodsController_getPayoutTradeMethods" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>

## Что именно выбирать

Если клиент выбрал конкретный способ оплаты, в ордер нужно передавать связку:

- `payment.bank`
- `payment.type`

Именно эта комбинация определяет:

- какие реквизиты вернёт платформа;
- какие `customerFields` желательно собрать;
- какой flow будет у конкретного метода.

## Как это выглядит на практике

Если `trade methods` вернул, например:

```json
{
  "bank": "sber",
  "bankName": "Сбербанк",
  "paymentType": "card2card",
  "paymentTypeName": "Карта банка"
}
```

то в ордере нужно использовать:

```json
{
  "payment": {
    "bank": "sber",
    "type": "card2card"
  }
}
```

## Где это применяется

### `PayIn H2H sync requisites`

`payment.bank` и `payment.type` известны до создания ордера, поэтому передаются сразу в:

- `POST /public/api/v1/shop/orders/sync-requisites` <a href="[[DOMAIN_URL]]/public/api/payin#tag/v1shoporders/operation/ShopOrdersControllerV1_createSyncRequisiteWithTimeout" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>

### `PayIn H2H step-by-step`

Сначала создаётся базовый ордер, а потом выбранные значения записываются в:

- `PATCH /public/api/v1/shop/orders/{id}` <a href="[[DOMAIN_URL]]/public/api/payin#tag/v1shoporders/operation/ShopOrdersControllerV1_update" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>

### `Payout H2H`

Для выплат связка `payment.bank` и `payment.type` обычно указывается сразу в:

- `POST /public/api/v1/shop/payout-orders` <a href="[[DOMAIN_URL]]/public/api/payout#tag/v1shoppayout-orders/operation/ShopPayoutOrdersControllerV1_createWithTimeout" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>

## Что важно

- Не хардкодьте список банков и типов оплаты в UI.
- Источником истины должны быть именно `trade methods`.
- Один и тот же `payment.type` у разных банков может давать разный UX по реквизитам и полям клиента.

## Куда идти дальше

- [Поля реквизитов и customerFields](/doc/v2/field-reference/)
- [Public API](/doc/v2/public-api/)
- [Shop API](/doc/v2/shop-api/)
