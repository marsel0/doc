---
title: "Поля реквизитов и customerFields"
description: "Как читать fields, requisites и customerFields без лишнего reference-шума"
---

Эта страница нужна, чтобы мерчант понимал, какие поля:

- показывать клиенту как реквизиты для оплаты;
- собирать от клиента в `payment` или `customer.requisites`;
- считать обязательными.

## Откуда берутся поля

Основной источник:

- `GET /public/api/v1/shop/trade-methods` <a href="[[DOMAIN_URL]]/public/api/payin#tag/v1shoptrade-methods/operation/ShopTradeMethodsController_getTradeMethods" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>
- `GET /public/api/v1/shop/trade-methods/payout` <a href="[[DOMAIN_URL]]/public/api/payout#tag/v1shoptrade-methodspayout/operation/ShopTradeMethodsController_getPayoutTradeMethods" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>

## Что такое `fields`

`fields` описывают реквизиты, которые платформа вернёт для конкретного способа оплаты.

Пример:

```json
[
  {
    "name": "cardInfo",
    "type": "card",
    "unique": true,
    "required": true
  },
  {
    "name": "cardholder",
    "type": "cardholder"
  }
]
```

Для `PayIn` это означает, что после выдачи реквизитов клиенту нужно показать значения из:

- `order.requisites.cardInfo`
- `order.requisites.cardholder`

## Что такое `customerFields`

`customerFields` описывают данные, которые желательно или обязательно собрать от клиента.

Пример:

```json
[
  {
    "name": "customerCardLastDigits",
    "type": "sci_card",
    "required": true
  }
]
```

Такие данные обычно передаются в `payment` у `PayIn`-ордера. Например:

```json
{
  "payment": {
    "customerCardLastDigits": "1111"
  }
}
```

## Как использовать в `PayIn`

Для `PayIn`:

- `fields` помогают отрисовать реквизиты, куда клиент должен перевести деньги;
- `customerFields` помогают собрать дополнительные данные клиента;
- часть `customerFields` может быть необязательной, но полезной для аналитики и ускорения обработки.

## Как использовать в `PayOut`

Для `PayOut` похожая логика работает уже на входных реквизитах клиента. Обычно платформа ждёт данные в:

- `customer.requisites.cardInfo`
- `customer.requisites.cardholder`
- других полях, которые требует выбранный payout method

## Короткая памятка по полям

| Поле | Где используется | Что означает |
| :---- | :---- | :---- |
| `fields.name` | `trade methods` | имя поля реквизита |
| `fields.type` | `trade methods` | тип для UI и форматирования |
| `fields.required` | `trade methods` | обязательность поля в реквизитах |
| `fields.unique` | `trade methods` | системное уникальное поле |
| `customerFields.name` | `trade methods` | имя поля, которое нужно собрать от клиента |
| `customerFields.type` | `trade methods` | тип клиентского поля |
| `customerFields.required` | `trade methods` | обязательность ввода |

## Короткая памятка по `requisites`

| Поле | Что обычно показывать клиенту |
| :---- | :---- |
| `cardInfo` | номер карты |
| `cardholder` | владелец карты |
| `phone` | номер телефона для перевода |
| `accountNumber` | номер счёта |
| `swiftBic` | банковский идентификатор |
| `paymentLink` | redirect-ссылка |
| `qrImageUrl` | ссылка на QR-код |

## Что важно

- Не пытайтесь угадывать набор реквизитов по названию банка.
- Поля нужно читать из `trade methods` и из фактического `order.requisites`.
- Для `PayIn` реквизиты показываются клиенту.
- Для `PayOut` реквизиты клиента обычно собираются у вас на форме и отправляются в `customer.requisites`.

## Куда идти дальше

- [Выбор банка и типа оплаты](/doc/v2/payment-methods/)
- [PayIn H2H sync requisites](/doc/v2/h2h-sync/)
- [Payout H2H](/doc/v2/payout/)
