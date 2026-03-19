---
title: "PAYOUT: способы и API-примеры"
description: "Полные примеры payout-запросов, статусов и callback"
tableOfContents: false
---

Эта страница собирает рабочие примеры для `payout` в `simple-pay`: получение trade methods, создание payout-ордеров, чтение, отмену, callback и служебные запросы, которые обычно нужны рядом с выплатами.

## Переменные для примеров

```bash
export BASE_URL="[[BASE_URL]]"
export SHOP_TOKEN="<SHOP_API_KEY>"
export BALANCE_TOKEN="<BALANCE_API_KEY>"
export CALLBACK_URL="[[PAYOUT_CALLBACK_URL]]"
```

## 1. Проверить баланс магазина

Для payout это не обязательно перед каждым запросом, но практически полезно перед массовыми выплатами.

```bash
curl --location "$BASE_URL/shop/assets" \
  --header "Authorization: Bearer $BALANCE_TOKEN"
```

### Пример ответа

```json
[
  {
    "id": "ff00d2c2-e50c-4dbb-a1f8-7d331aaae122",
    "currency": "USDT",
    "balance": 9192.59405,
    "holdBalance": 50,
    "shop": {
      "id": "374e21dc-0fa7-42f8-b523-f95a8c0e9a2c",
      "name": "simple-pay-demo"
    }
  }
]
```

Если средств недостаточно, `POST /shop/payout-orders` вернёт `S10001`.

## 2. Получить доступные способы выплаты

Источник истины для payout-полей это `GET /shop/trade-methods/payout`.

### Запрос

```bash
curl --location "$BASE_URL/shop/trade-methods/payout" \
  --header "Authorization: Bearer $SHOP_TOKEN"
```

### Пример ответа

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
    "customerFields": [],
    "parallelGroupOrdersEnabled": false,
    "compareCardLast4DigitsEnabled": false,
    "compareAccountLast4DigitsEnabled": false,
    "compareUTREnabled": false,
    "enabled": true,
    "deeplinks": []
  },
  {
    "bank": "tbank",
    "bankName": "T-Bank",
    "fiatCurrency": "RUB",
    "fiatCurrencySymbol": "₽",
    "fiatCurrencySymbolPosition": "after",
    "paymentType": "card2card",
    "paymentTypeName": "Перевод с карты на карту",
    "fields": [
      { "type": "card", "name": "cardInfo", "required": true, "primary": true },
      { "type": "holder", "name": "cardholder", "required": false }
    ],
    "customerFields": [],
    "parallelGroupOrdersEnabled": false,
    "compareCardLast4DigitsEnabled": false,
    "compareAccountLast4DigitsEnabled": false,
    "compareUTREnabled": false,
    "enabled": true,
    "deeplinks": []
  }
]
```

### Как использовать ответ

- `paymentType` и `bank` определяют доступный payout route.
- `fields[]` определяет, какие поля нужно заполнить в `customer.requisites`.
- если банк не обязателен, можно не передавать `payment.bank`.

## 3. Создать payout: SBP

### Запрос

```bash
curl --location "$BASE_URL/shop/payout-orders" \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer $SHOP_TOKEN" \
  --data '{
    "amount": 1200,
    "currency": "RUB",
    "customer": {
      "id": "payout-10001",
      "name": "Ivan Ivanov",
      "email": "buyer@example.com",
      "phone": "+79990001122",
      "requisites": {
        "phone": "+79990001122"
      }
    },
    "payment": {
      "type": "sbp",
      "bank": "sberbank"
    },
    "integration": {
      "externalOrderId": "merchant-payout-10001",
      "callbackUrl": "[[PAYOUT_CALLBACK_URL]]",
      "callbackMethod": "post"
    }
  }'
```

### Пример ответа

```json
{
  "id": "b4ad11f1-10b3-4684-8fe4-2d6f3969e77a",
  "amount": 1200,
  "currency": "RUB",
  "status": "requisites",
  "statusDetails": null,
  "shop": {
    "name": "simple-pay-demo"
  },
  "payment": {
    "type": "sbp",
    "bank": "sberbank"
  },
  "customer": {
    "id": "payout-10001",
    "name": "Ivan Ivanov",
    "email": "buyer@example.com",
    "telegram": null,
    "requisites": {
      "phone": "+79990001122",
      "card": null,
      "cardholder": null,
      "swiftBic": null,
      "bic": null,
      "idCard": null,
      "beneficiaryName": null,
      "accountNumber": null,
      "expirationDate": null,
      "taxId": null
    }
  },
  "assetCurrencyAmount": 12,
  "shopAmount": 12.12,
  "shopFee": 0.12,
  "currencyRate": 100,
  "integration": {
    "externalOrderId": "merchant-payout-10001",
    "callbackUrl": "[[PAYOUT_CALLBACK_URL]]",
    "callbackMethod": "post",
    "callbackUrlStatus": "in_progress"
  }
}
```

## 4. Создать payout: Card2Card без явного банка

Для `card2card` можно не передавать `payment.bank`. В этом случае сервис попробует определить банк по BIN карты.

### Запрос

```bash
curl --location "$BASE_URL/shop/payout-orders" \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer $SHOP_TOKEN" \
  --data '{
    "amount": 2300,
    "currency": "RUB",
    "customer": {
      "id": "payout-10002",
      "name": "Ivan Ivanov",
      "requisites": {
        "cardInfo": "2200702202207788",
        "cardholder": "IVAN IVANOV"
      }
    },
    "payment": {
      "type": "card2card"
    },
    "integration": {
      "externalOrderId": "merchant-payout-10002",
      "callbackUrl": "[[PAYOUT_CALLBACK_URL]]",
      "callbackMethod": "post"
    }
  }'
```

### Пример ответа

```json
{
  "id": "52272fa2-e68d-42c1-a92e-4e72f2a5b9e1",
  "amount": 2300,
  "currency": "RUB",
  "status": "requisites",
  "payment": {
    "type": "card2card",
    "bank": "tbank"
  },
  "customer": {
    "id": "payout-10002",
    "name": "Ivan Ivanov",
    "requisites": {
      "card": "2200702202207788",
      "cardholder": "IVAN IVANOV"
    }
  },
  "integration": {
    "externalOrderId": "merchant-payout-10002",
    "callbackUrlStatus": "in_progress"
  }
}
```

## 5. Чтение payout-ордеров

### Получить ордер по ID

```bash
curl --location "$BASE_URL/shop/payout-orders/b4ad11f1-10b3-4684-8fe4-2d6f3969e77a" \
  --header "Authorization: Bearer $SHOP_TOKEN"
```

### Получить ордер по `externalOrderId`

```bash
curl --location "$BASE_URL/shop/payout-orders/external/merchant-payout-10001" \
  --header "Authorization: Bearer $SHOP_TOKEN"
```

### Получить список payout-ордеров

```bash
curl --location "$BASE_URL/shop/payout-orders?from=2026-03-01&to=2026-03-14&status=completed&take=50&page=1" \
  --header "Authorization: Bearer $SHOP_TOKEN"
```

### Пример ответа списка

```json
{
  "items": [
    {
      "id": "b4ad11f1-10b3-4684-8fe4-2d6f3969e77a",
      "amount": 1200,
      "currency": "RUB",
      "status": "completed",
      "statusDetails": null,
      "payment": {
        "type": "sbp",
        "bank": "sberbank"
      },
      "customer": {
        "id": "payout-10001"
      },
      "integration": {
        "externalOrderId": "merchant-payout-10001",
        "callbackUrlStatus": "success"
      }
    }
  ],
  "page": 1,
  "pages": 1,
  "count": 1
}
```

## 6. Отменить payout-ордер

Отмена работает только в допустимых статусах. Если статус уже ушёл дальше, API вернёт `O10000`.

### Запрос

```bash
curl --location --request POST "$BASE_URL/shop/payout-orders/b4ad11f1-10b3-4684-8fe4-2d6f3969e77a/cancel" \
  --header "Authorization: Bearer $SHOP_TOKEN"
```

### Пример ответа

```json
{
  "id": "b4ad11f1-10b3-4684-8fe4-2d6f3969e77a",
  "amount": 1200,
  "currency": "RUB",
  "status": "cancelled",
  "statusDetails": "shop",
  "payment": {
    "type": "sbp",
    "bank": "sberbank"
  },
  "integration": {
    "externalOrderId": "merchant-payout-10001",
    "callbackUrlStatus": "in_progress"
  }
}
```

## 7. Как выглядит payout callback

Payout callback работает по той же модели, что и payin:

- параметры статуса передаются в query string;
- при `callbackMethod=post` тело запроса пустое;
- callback может быть отправлен повторно;
- подпись проверяется через `signatureKey`.

### Пример callback

```text
[[PAYOUT_CALLBACK_URL]]?id=b4ad11f1-10b3-4684-8fe4-2d6f3969e77a&amount=1200&customerId=payout-10001&status=completed&externalOrderId=merchant-payout-10001&signature=5ce1...
```

### Пример callback при отмене

```text
[[PAYOUT_CALLBACK_URL]]?id=b4ad11f1-10b3-4684-8fe4-2d6f3969e77a&amount=1200&customerId=payout-10001&status=cancelled&statusDetails=shop&externalOrderId=merchant-payout-10001&signature=18aa...
```

## 8. Дополнительные запросы, которые часто нужны рядом с payout

### Создать заявку на вывод средств магазина

Если payout-процесс связан с балансом магазина, может понадобиться ручное управление средствами:

```bash
curl --location "$BASE_URL/shop/assets/withdrawals" \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer $BALANCE_TOKEN" \
  --data '{
    "withdrawAmount": 25,
    "address": "TRC20_WALLET_ADDRESS"
  }'
```

### Получить информацию по заявке на вывод

```bash
curl --location "$BASE_URL/shop/assets/withdrawals/9aa52b42-3cb7-402a-b655-0753e246ece8" \
  --header "Authorization: Bearer $BALANCE_TOKEN"
```

## 9. Тонкости работы PAYOUT API

- Успешный `201` после `POST /shop/payout-orders` означает только принятие payout в обработку.
- Нормальный рабочий статус после создания это `requisites`.
- Для `card2card` банк может быть подставлен автоматически по BIN карты.
- Если в payout пришёл `rejected`, не закрывайте бизнес-операцию автоматически, сначала дочитайте ордер ещё раз.
- После `S10002` сначала ищите payout по `externalOrderId`.
- `callbackUrlStatus` удобно использовать как технический индикатор успешной доставки callback.

## 10. Что смотреть дальше

- [Интеграции PAYOUT](/doc/payout/01-integration/)
- [PAYOUT API: создание и список ордеров](/doc/api/payout/02-orders/)
- [PAYOUT API: чтение и отмена](/doc/api/payout/03-read-and-cancel/)
- [Работа с магазином](/doc/docs/06-shop_management/)
- [Ошибки и коды ответов](/doc/docs/02-api_error_guide/)
