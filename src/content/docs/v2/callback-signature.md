---
title: "Callback и подпись"
description: "Как приходят статусы, что проверять в callback и как считать signature"
---

`Callback` — основной канал статусов и для `PayIn`, и для `PayOut`. Если он реализован плохо, вся интеграция выглядит рабочей только на happy path.

## Какие статусы обрабатывать

Не ограничивайте обработчик одним финальным статусом: сохраняйте каждый callback
и принимайте все значения из статусной модели. Основные бизнес-события:

- PayIn: `cancelled`, `completed`, `dispute`;
- PayOut: `requisites`, `cancelled`, `completed`, `dispute`.

Неизвестное новое значение не должно приводить к HTTP `500`: сохраните его,
ответьте `200` и не меняйте бизнес-результат до обновления интеграции.

## Что нужно передать при создании ордера

| Поле | Статус | Комментарий |
| --- | --- | --- |
| `integration.callbackUrl` | необязательное по API, обязательное для надёжной интеграции | URL для callback |
| `integration.callbackMethod` | опциональное | По умолчанию `post`, можно `get` |

Параметры статуса передаются в query-строке URL и при `get`, и при `post`; тело
`post` пустое. Для PayIn исходные query-параметры `callbackUrl` сохраняются, но не
входят в `signature`. Для PayOut текущая реализация заменяет исходную query-строку,
поэтому идентификаторы передавайте через `externalOrderId`, а не через URL.

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
- для PayIn — ваши собственные query-параметры из `callbackUrl`

## Как считать `signature`

Правило:

- берутся добавленные платформой callback-поля, кроме самой `signature`;
- добавляется `signatureKey`;
- ключи сортируются по алфавиту;
- пары `key=value` соединяются через `|`;
- `null` и отсутствующие значения не включаются;
- результат хэшируется через `SHA-1`.

Не включайте в подпись собственные query-параметры, которые уже были в PayIn
`callbackUrl`: платформа сохраняет их в итоговом URL, но считает `signature` без
них. Надёжнее хранить такой контекст по `externalOrderId`.

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

Если доставка завершилась ошибкой — сетевым сбоем, таймаутом или ответом не из
диапазона `2xx` — после первой отправки платформа планирует повторы:

- 1 минута
- 5 минут
- 10 минут
- 30 минут
- 1 час
- 2 часа
- 3 часа
- 6 часов
- ещё 6 часов

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
