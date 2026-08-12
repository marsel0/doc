---
title: "Уведомления о статусах и подпись"
description: "Как принимать статусы и проверять signature"
---

При изменении статуса PayIn или PayOut площадка отправляет запрос на
`integration.callbackUrl`. Это основной способ получать результат.

## Какие статусы обрабатывать

Сохраняйте каждое уведомление и принимайте все статусы. Основные события:

- PayIn: `cancelled`, `completed`, `dispute`;
- PayOut: `requisites`, `cancelled`, `completed`, `dispute`.

Неизвестное новое значение не должно приводить к HTTP `500`: сохраните его,
ответьте `200` и не меняйте бизнес-результат до обновления интеграции.

## Что нужно передать при создании ордера

| Поле | Статус | Комментарий |
| --- | --- | --- |
| `integration.callbackUrl` | нет по API, рекомендуется | URL обработчика уведомлений |
| `integration.callbackMethod` | нет | По умолчанию `post`, можно `get` |

Параметры статуса передаются в URL и для `get`, и для `post`. Тело `post` пустое.
Для PayIn параметры, которые уже были в `callbackUrl`, сохраняются, но не входят
в `signature`. Для PayOut они заменяются. Поэтому свой ID передавайте через
`externalOrderId`, а не в `callbackUrl`.

## Что приходит в уведомлении

Основные параметры:

| Поле | Значение |
| --- | --- |
| `id` | `order.id` |
| `status` | `order.status` |
| `amount` | `order.amount` |
| `statusDetails` | `order.statusDetails` |
| `customerId` | `order.customer.id` |
| `externalOrderId` | `order.integration.externalOrderId` |
| `signature` | Подпись уведомления |

Дополнительно могут приходить:

- `disputeAmount`
- `statusReason`
- `assetCurrencyAmount`
- `shopFee`
- `currencyRate`
- для PayIn — ваши собственные query-параметры из `callbackUrl`

## Как считать `signature`

Правило:

- берутся поля, добавленные площадкой, кроме самой `signature`;
- добавляется `signatureKey`;
- ключи сортируются по алфавиту;
- пары `key=value` соединяются через `|`;
- `null` и отсутствующие значения не включаются;
- результат хэшируется через `SHA-1`.

Не включайте в подпись собственные параметры, которые уже были в PayIn
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

## Как обрабатывать уведомление

- если уведомление повторилось, не выполняйте действие второй раз;
- после сохранения статуса возвращайте `200`;
- переход клиента по ссылке не заменяет уведомление о статусе;
- на время подключения сохраняйте полученные параметры в логах.

## Повторная доставка

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

Если доставка долго не удаётся, её статус у ордера может перейти в `error`.

## Что логировать

- `id`
- `externalOrderId`
- `status`
- `statusDetails`
- результат валидации `signature`
- код ответа обработчика

## Куда идти дальше

- [PayIn: статусы и переходы](/doc/v2/payin-statuses/)
- [Payout: статусы и переходы](/doc/v2/payout-statuses/)
