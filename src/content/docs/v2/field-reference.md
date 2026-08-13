---
title: "Поля реквизитов и customerFields"
description: "Какие поля показывать и какие данные собирать у клиента"
---

Здесь описано, какие поля:

- показывать клиенту как реквизиты для оплаты;
- собирать от клиента в `payment` или `customer.requisites`;
- считать обязательными.

## Откуда берутся поля

Список можно получить через:

- [`GET /shop/trade-methods`](/doc/api/shop/04-dictionaries/#получение-методов)
- [`GET /shop/trade-methods/payout`](/doc/api/payout/04-dictionaries/#get-shoptrade-methodspayout)

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

Такие данные обычно передаются в `payment` у PayIn-ордера. Например:

```json
{
  "payment": {
    "customerCardLastDigits": "1111"
  }
}
```

## Как использовать в `PayIn`

Для `PayIn`:

- `fields` показывают, какие реквизиты нужно вывести клиенту;
- `customerFields` помогают собрать дополнительные данные клиента;
- необязательные `customerFields` можно не передавать, если они не нужны вашему сценарию.

## Как использовать в `PayOut`

Для `PayOut` похожая логика работает уже на входных реквизитах клиента. Обычно платформа ждёт данные в:

- `customer.requisites.cardInfo`
- `customer.requisites.cardholder`
- других полях, которые требует выбранный метод PayOut

## Короткая памятка по полям

| Поле | Где используется | Что означает |
| :---- | :---- | :---- |
| `fields.name` | список методов | имя поля реквизита |
| `fields.type` | список методов | тип поля |
| `fields.required` | список методов | обязательность поля |
| `fields.unique` | список методов | признак уникального реквизита |
| `customerFields.name` | список методов | имя поля, которое нужно собрать от клиента |
| `customerFields.type` | список методов | тип поля клиента |
| `customerFields.required` | список методов | обязательность ввода |

## Короткая памятка по `requisites`

| Поле | Что обычно показывать клиенту |
| :---- | :---- |
| `cardInfo` | номер карты |
| `cardholder` | владелец карты |
| `phone` | номер телефона для перевода |
| `accountNumber` | номер счёта |
| `swiftBic` | банковский идентификатор |
| `paymentLink` | ссылка оплаты |
| `qrImageUrl` | ссылка на QR-код |

## Что важно

- Не пытайтесь угадывать набор реквизитов по названию банка.
- Используйте согласованную таблицу полей или данные из списка методов и `order.requisites`.
- Для `PayIn` реквизиты показываются клиенту.
- Для `PayOut` реквизиты клиента обычно собираются у вас на форме и отправляются в `customer.requisites`.

## Куда идти дальше

- [Выбор банка и типа оплаты](/doc/v2/payment-methods/)
- [PayIn H2H: реквизиты сразу](/doc/v2/h2h-sync/)
- [PayOut H2H](/doc/v2/payout/)
