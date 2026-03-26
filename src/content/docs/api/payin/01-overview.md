---
title: "PAYIN API"
description: "Merchant API, модель payin-ордера, статусы, поля и callback"
---

Этот раздел описывает merchant-facing часть `payin`: endpoint-ы магазина, объект ордера, статусы, поля и callback.

## 1. Аутентификация и общая схема

### Аутентификация

Во всех merchant-запросах используется заголовок:

```text
Authorization: Bearer <SHOP_API_KEY>
```

### Минимальная последовательность

1. Проверить магазин и `signatureKey` через [Shop API](/doc/api/shop/01-overview/).
2. Прочитать `GET /shop/trade-methods`.
3. Создать ордер.
4. Получать статусы через callback.
5. Использовать `GET /shop/orders/{id}` или `GET /shop/orders/external/{externalOrderId}` как резервный канал контроля.

## 2. Карта merchant endpoint-ов

| Endpoint | Для чего нужен |
| --- | --- |
| `GET /shop/trade-methods` | Получить доступные `paymentType + bank` и состав полей |
| `GET /shop/orders` | Список ордеров магазина |
| `POST /shop/orders` | Создать redirect-ордер или базовый H2H-ордер |
| `POST /shop/orders/sync-requisites` | Создать H2H-ордер и сразу получить реквизиты |
| `GET /shop/orders/{id}` | Прочитать ордер по внутреннему `id` |
| `GET /shop/orders/external/{id}` | Прочитать ордер по `externalOrderId` |
| `PATCH /shop/orders/{id}` | Обновить `payment`-данные |
| `POST /shop/orders/{id}/start-payment` | Запустить поиск реквизитов |
| `POST /shop/orders/{id}/confirm-payment` | Подтвердить оплату клиента |
| `POST /shop/orders/{id}/cancel` | Отменить ордер |
| `GET /shop/orders/{id}/payment-fields` | Получить переопределения payment-полей |
| `GET /shop/orders/{id}/receipts` | Список чеков |
| `POST /shop/orders/{id}/receipts` | Загрузить чек |
| `POST /shop/orders/{id}/remove-receipt` | Удалить чек |
| `POST /shop/orders/{id}/receipts/url` | Получить временную ссылку на чек |
| `POST /shop/orders/{id}/dispute` | Открыть dispute по отменённому ордеру |
| `POST /shop/orders/external/{id}/dispute` | То же по `externalOrderId` |
| `POST /shop/orders/{id}/dispute/cancel` | Закрыть dispute |
| `POST /shop/orders/external/{id}/dispute/cancel` | То же по `externalOrderId` |

Подробные примеры по endpoint-ам идут на следующих страницах этого раздела.

## 3. Модель merchant-ордера

### Верхний уровень

| Поле | Что означает |
| --- | --- |
| `id` | Внутренний идентификатор ордера |
| `initialAmount` | Исходная сумма до возможной randomization |
| `amount` | Фактическая сумма, которую нужно показывать клиенту |
| `currency` | Fiat-валюта ордера |
| `status` | Текущий статус ордера |
| `statusDetails` | Уточнение причины или промежуточного состояния |
| `statusTimeoutAt` | Крайний срок, после которого платформа автоматически двинет ордер дальше |

### Коммерческие поля

| Поле | Что означает |
| --- | --- |
| `assetCurrencyAmount` | Сумма в цифровой валюте |
| `shopAmount` | Сумма, зачисляемая магазину в цифровой валюте |
| `shopFee` | Комиссия магазина в цифровой валюте |
| `initialShopCommission` | Комиссия магазина в процентах |
| `currencyRate` | Использованный курс |

### Блок `shop`

| Поле | Что означает |
| --- | --- |
| `name` | Имя магазина |
| `customerDataCollectionOrder` | Когда собирать данные клиента: `before_payment` или `after_payment` |
| `collectCustomerReceipts` | Нужно ли просить клиента загрузить чек |

### Блок `payment`

| Поле | Что означает |
| --- | --- |
| `type` | Код метода оплаты |
| `bank` | Код банка |
| `customerCardFirstDigits` | Первые 6 цифр карты плательщика |
| `customerCardLastDigits` | Последние 4 цифры карты плательщика |
| `customerBank` | Банк плательщика |
| `customerName` | Имя владельца карты/счёта плательщика |
| `customerPhoneLastDigits` | Последние 4 цифры телефона плательщика |
| `customerUtr` | UTR плательщика |
| `customerIBAN` | IBAN плательщика |
| `customerAccountNumber` | Номер счёта плательщика |

### Блок `requisites`

`requisites` зависит от trade method. В ответах могут встречаться:

- card/phone поля: `phone`, `cardInfo`, `bank`, `bankName`, `sameBank`, `cardholder`
- банковские реквизиты: `swiftBic`, `bic`, `email`, `idCard`, `beneficiaryName`, `accountNumber`, `taxId`, `expirationDate`
- QR и deeplink поля: `paymentLink`, `rawQrCodeData`, `qrImageUrl`, `sberPayUrl`
- country поля для cross-border: `countryCode`, `countryNameRu`, `countryNameEn`

### Блок `customer`

| Поле | Что означает |
| --- | --- |
| `id` | Идентификатор клиента в системе магазина |
| `name` | Имя клиента |
| `email` | Email клиента |
| `phone` | Телефон клиента |
| `ip` | IP клиента |
| `fingerprint` | Fingerprint клиента |

### Блок `integration`

| Поле | Что означает |
| --- | --- |
| `link` | Ссылка для redirect customer flow |
| `token` | Токен ордера, если дальше нужен frontend/customer flow |
| `callbackUrl` | URL для merchant callback |
| `callbackMethod` | `get` или `post`, по умолчанию `post` |
| `callbackUrlStatus` | Статус доставки callback |
| `externalOrderId` | Идентификатор ордера в системе магазина |
| `returnUrl` | URL возврата клиента |
| `successUrl` | URL возврата при успехе |
| `failUrl` | URL возврата при неуспехе |

## 4. Статусы ордера

### Основные статусы

| Статус | Что означает |
| --- | --- |
| `new` | Ордер создан |
| `requisites` | Идёт поиск реквизитов |
| `customer_confirm` | Реквизиты найдены, ждём оплату клиента |
| `trader_confirm` | Магазин подтвердил оплату, ждём финальное подтверждение платформы |
| `hold_completed` | Технический переходный статус перед автоподтверждением |
| `completed` | Платёж успешно завершён |
| `cancelled` | Ордер закрыт без успешной оплаты |
| `dispute` | Нужен ручной разбор |
| `error` | Техническая ошибка flow |

### Что для магазина считается финалом

- `completed`
- `cancelled`
- `dispute`
- `error`

### `statusDetails`

| Где встречается | Значение | Что означает |
| --- | --- | --- |
| `new` | `start_payment_sync_attempt` | Идёт попытка синхронного поиска реквизитов |
| `customer_confirm` | `customer_payed` | Клиент подтвердил оплату в промежуточном flow |
| `cancelled` | `shop` | Ордер отменил магазин |
| `cancelled` | `admin` | Ордер отменил администратор платформы |
| `cancelled` | `operator` | Ордер отменил оператор платформы |
| `cancelled` | `customer` | Ордер отменил клиент |
| `cancelled` | `trader` | Ордер отменил трейдер |
| `cancelled` | `new_timeout` | Клиент не продолжил flow вовремя |
| `cancelled` | `requisites_timeout` | Реквизиты не были найдены вовремя |
| `cancelled` | `sync_requisites_attempts` | Исчерпаны попытки синхронного поиска реквизитов |
| `cancelled` | `customer_confirm_timeout` | Клиент не успел подтвердить оплату |
| `cancelled` | `requisites_verification_order` | Служебный cancel в verification flow |
| `cancelled` | `trader_confirm_timeout` | Платформа не получила финального подтверждения вовремя |
| `dispute` | `no_payment` | Спор: платежа нет |
| `dispute` | `different_amount` | Спор: другая сумма |
| `dispute` | `admin_created` | Диспут создал администратор |
| `dispute` | `revert_cancelled` | Отменённый ордер был возвращён в dispute |
| `dispute` | `trader_confirm_timeout` | Финальное подтверждение не пришло вовремя, но чек уже был загружен |
| `legacy` | `trader_confirm_timeout_cancel` | Устаревшее значение из старого flow |

### Таймауты по умолчанию

| Статус | Дефолтный timeout | Что делает платформа |
| --- | --- | --- |
| `new` | `30` минут | переводит в `cancelled/new_timeout` |
| `requisites` | `1` минута | переводит в `cancelled/requisites_timeout` |
| `customer_confirm` | `15` минут | переводит в `cancelled/customer_confirm_timeout` |
| `trader_confirm` | `15` минут | без чека: `cancelled/trader_confirm_timeout`; с чеком: `dispute/trader_confirm_timeout` |

Для конкретного ордера ориентируйтесь на `statusTimeoutAt`: это и есть фактический deadline, который магазин должен показывать или учитывать.

## 5. Callback

### Что приходит

Callback уходит на `integration.callbackUrl`. Параметры статуса передаются в query string. `callbackMethod` можно выбрать как `get` или `post`, но payload в обоих случаях один и тот же.

Пример успешного callback:

```text
id=0b98eb1a-9e3a-4536-bed6-d10e5a7e097a&amount=1500&customerId=order-10002&status=completed&externalOrderId=merchant-10002&signature=8f3eb9...
```

Пример callback для отмены:

```text
id=0b98eb1a-9e3a-4536-bed6-d10e5a7e097a&amount=1500&customerId=order-10002&status=cancelled&statusDetails=shop&externalOrderId=merchant-10002&signature=7dc2a4...
```

### Как считать `signature`

`signature` считается как `sha1` от всех callback-параметров, кроме самой `signature`, плюс `signatureKey`. Ключи нужно отсортировать по алфавиту, а `null`-значения не включать.

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

### Как читать `callbackUrlStatus`

| Значение | Что означает |
| --- | --- |
| `in_progress` | callback поставлен в доставку |
| `success` | callback успешно доставлен |
| `error` | callback не удалось доставить, ордер нужно дочитать через `GET` |

Callback может приходить повторно. Обработчик должен быть идемпотентным.

## 6. Частые ошибки

| Код | Когда встречается | Что делать |
| --- | --- | --- |
| `S10002` | платформе не хватило времени вернуть ответ | искать ордер по `externalOrderId`, не дублировать create вслепую |
| `O10000` | действие не подходит текущему статусу | сначала прочитать ордер |
| `O10001` | не выбран `payment.type` | перед `start-payment` заполнить `payment` |
| `O10005` | реквизиты не найдены | предложить другой метод или банк |
| `O10006` | duplicate `externalOrderId` | дочитать существующий ордер |
| `O10007` | по `externalOrderId` найдено больше одного ордера | использовать внутренний `id` или разбирать дубль |

## 7. Страницы раздела

- [Создание и список ордеров](/doc/api/payin/02-orders/)
- [Чтение ордеров](/doc/api/payin/03-read/)
- [Действия над ордером](/doc/api/payin/04-actions/)
- [Payment fields и receipts](/doc/api/payin/05-receipts-and-fields/)
- [Dispute](/doc/api/payin/06-disputes/)
- [Trade methods](/doc/api/payin/07-auxiliary/)
