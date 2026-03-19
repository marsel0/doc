---
title: "Работа с магазином"
description: "Первые запросы, проверка ключей, балансы и служебные методы магазина"
---

Эта страница нужна для самого первого старта. Если у вас есть только домен и ключи, начните отсюда.

## 1. Подготовить переменные

Если ваш инстанс расположен на домене `[[DOMAIN_URL]]`, merchant API обычно доступен по префиксу `/public/api/v1`.

```bash
export DOMAIN="[[DOMAIN_URL]]"
export BASE_URL="$DOMAIN/public/api/v1"
export SHOP_TOKEN="<SHOP_API_KEY>"
export BALANCE_TOKEN="<BALANCE_API_KEY>"
export SIGNATURE_KEY="<SIGNATURE_KEY>"
```

## 2. Первый запрос: проверить, что `Shop API key` рабочий

```bash
curl --location "$BASE_URL/shop/info" \
  --header "Authorization: Bearer $SHOP_TOKEN"
```

### Пример ответа

```json
{
  "id": "374e21dc-0fa7-42f8-b523-f95a8c0e9a2c",
  "name": "simple-pay-demo",
  "status": "active",
  "fiatCurrency": "RUB",
  "assetCurrency": "USDT"
}
```

Если этот запрос проходит, значит:

- домен собран правильно;
- вы обращаетесь в нужную среду;
- `Shop API key` валиден.

## 3. Получить курсы магазина

```bash
curl --location "$BASE_URL/shop/info/exchange" \
  --header "Authorization: Bearer $SHOP_TOKEN"
```

### Пример ответа

```json
{
  "payinCurrencyRate": 100,
  "payoutCurrencyRate": 100
}
```

Это полезно для сверки расчётов и понимания, какие курсы используются магазином.

## 4. Получить баланс магазина

Для этого уже нужен `Balance API key`.

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

## 5. Получить доступные методы PAYIN

```bash
curl --location "$BASE_URL/shop/trade-methods" \
  --header "Authorization: Bearer $SHOP_TOKEN"
```

Этот запрос нужен до создания H2H payin-ордеров.

Что он даёт:

- список доступных способов оплаты;
- доступные банки;
- список полей, которые вернутся в `requisites`;
- список полей, которые нужно или полезно собрать у клиента.

## 6. Получить доступные методы PAYOUT

```bash
curl --location "$BASE_URL/shop/trade-methods/payout" \
  --header "Authorization: Bearer $SHOP_TOKEN"
```

Этот запрос нужен до создания payout-ордеров.

Что он даёт:

- доступные payout routes;
- необходимость указывать `payment.bank`;
- список обязательных полей в `customer.requisites`.

## 7. Создать заявку на вывод средств магазина

Это не payout-ордер для клиента, а заявка на вывод средств с баланса магазина.

```bash
curl --location "$BASE_URL/shop/assets/withdrawals" \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer $BALANCE_TOKEN" \
  --data '{
    "withdrawAmount": 25,
    "address": "TRC20_WALLET_ADDRESS"
  }'
```

### Пример ответа

```json
{
  "id": "9aa52b42-3cb7-402a-b655-0753e246ece8",
  "currency": "USDT",
  "withdrawAmount": 25,
  "status": "new",
  "hash": null
}
```

## 8. Что делать после этих запросов

Если вы дошли до этого места, дальше путь такой:

- реализовать `callbackUrl` и проверку `signature`;
- для приёма платежей: [Интеграции PAYIN](/doc/payin/01-redirect_integration/) и [PAYIN: способы и API-примеры](/doc/payin/02-integration/)
- для выплат: [Интеграции PAYOUT](/doc/payout/01-integration/) и [PAYOUT: способы и API-примеры](/doc/payout/02-integration/)

## 9. Что важно помнить

- `Shop API key` и `Balance API key` это разные ключи.
- Для callback нужен `Signature key`.
- Callback лучше считать обязательной частью интеграции, а `GET`-чтение использовать как резервный канал.
- Для всех create-методов в production лучше передавать `externalOrderId`.
