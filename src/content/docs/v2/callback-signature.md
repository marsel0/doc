---
title: "Callback и подпись"
description: "Как приходят статусы, что проверять в callback и как считать signature"
---

`Callback` — основной канал статусов и для `PayIn`, и для `PayOut`. Если он реализован плохо, вся интеграция выглядит рабочей только на happy path.

## Какие статусы приходят в callback

### PayIn

- `cancelled`
- `completed`
- `dispute`

### PayOut

- `requisites`
- `cancelled`
- `completed`
- `dispute`

## Что нужно передать при создании ордера

| Поле | Статус | Комментарий |
| --- | --- | --- |
| `integration.callbackUrl` | опциональное, но practically обязательное | URL для callback |
| `integration.callbackMethod` | опциональное | По умолчанию `post`, можно `get` |

Если в `callbackUrl` уже есть query-параметры, платформа сохраняет их при вызове callback.

## Что приходит в callback

Основные параметры:

| Поле | Значение |
| --- | --- |
| `id` | `order.id` |
| `status` | `order.status` |
| `amount` | `order.amount` |
| `statusDetails` | `order.statusDetails` |
| `customerId` | `order.customer.id` |
| `externalOrderId` | `order.integration.externalOrderId` |
| `signature` | Подпись callback |

Дополнительно могут приходить:

- `disputeAmount`
- `statusReason`
- `assetCurrencyAmount`
- `shopFee`
- `currencyRate`
- ваши собственные query-параметры из `callbackUrl`

## Как считать `signature`

Правило:

- берутся все callback-поля, кроме самой `signature`;
- добавляется `signatureKey`;
- ключи сортируются по алфавиту;
- пары `key=value` соединяются через `|`;
- пустые значения отфильтровываются;
- результат хэшируется через `SHA-1`.

Пример:

```js
function getSignature(payload, signatureKey) {
  const keys = [...Object.keys(payload), "signatureKey"].sort();

  const stringToSign = keys
    .map((key) => {
      const value = key === "signatureKey" ? signatureKey : payload[key];
      return value == null ? null : `${key}=${value}`;
    })
    .filter(Boolean)
    .join("|");

  return sha1(stringToSign);
}
```

## Как обрабатывать callback правильно

- обработчик должен быть идемпотентным;
- после успешной обработки возвращайте `200`;
- не считайте redirect клиента заменой callback;
- сохраняйте сырые payload-ы в логах хотя бы на период интеграции.

## Retry-поведение

Если callback не получил `200`, платформа будет повторять отправку с увеличивающимися интервалами. В старой доке зафиксированы интервалы:

- 1 минута
- 5 минут
- 10 минут
- 30 минут
- 1 час
- 2 часа
- 3 часа
- 6 часов

При устойчивой ошибке статус доставки callback у ордера может перейти в `error`.

## Что логировать

- `id`
- `externalOrderId`
- `status`
- `statusDetails`
- результат валидации `signature`
- код ответа callback-обработчика

## Куда идти дальше

- [PayIn: статусы и переходы](/doc/v2/payin-statuses/)
- [Payout: статусы и переходы](/doc/v2/payout-statuses/)
