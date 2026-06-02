---
title: "Примеры H2H sync requisites"
description: "Запросы и ответы для сценария, где реквизиты нужны сразу"
---

Эта страница собирает примеры для сценария `PayIn H2H sync requisites`, где клиент остаётся на стороне мерчанта, а реквизиты нужно получить сразу в ответе на create-запрос.

## Переменные

```bash
export BASE_URL="[[BASE_URL]]"
export SHOP_TOKEN="<SHOP_API_KEY>"
export CALLBACK_URL="[[CALLBACK_URL]]"
```

## Прочитать доступные методы

`GET /public/api/v1/shop/trade-methods` <a href="[[DOMAIN_URL]]/public/api/payin#tag/v1shoptrade-methods/operation/ShopTradeMethodsController_getTradeMethods" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>

```bash
curl --location "$BASE_URL/shop/trade-methods" \
  --header "Authorization: Bearer $SHOP_TOKEN"
```

## Создать ордер с реквизитами

`POST /public/api/v1/shop/orders/sync-requisites` <a href="[[DOMAIN_URL]]/public/api/payin#tag/v1shoporders/operation/ShopOrdersControllerV1_createSyncRequisiteWithTimeout" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>

```bash
curl --location "$BASE_URL/shop/orders/sync-requisites" \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer $SHOP_TOKEN" \
  --data '{
    "amount": 1500,
    "currency": "RUB",
    "customer": {
      "id": "order-10002"
    },
    "payment": {
      "type": "sbp",
      "bank": "sberbank"
    },
    "integration": {
      "externalOrderId": "merchant-10002",
      "callbackUrl": "[[CALLBACK_URL]]",
      "callbackMethod": "post"
    }
  }'
```

## Что ожидать в ответе

- статус `customer_confirm`;
- заполненный блок `requisites`;
- сохранённый `externalOrderId`;
- если реквизиты не найдены, типичная ошибка: `404` и `O10005`.

## Подтвердить оплату

`POST /public/api/v1/shop/orders/{id}/confirm-payment` <a href="[[DOMAIN_URL]]/public/api/payin#tag/v1shoporders/operation/ShopOrdersControllerV1_confirmPayment" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>

```bash
curl --location --request POST "$BASE_URL/shop/orders/0b98eb1a-9e3a-4536-bed6-d10e5a7e097a/confirm-payment" \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer $SHOP_TOKEN" \
  --data '{
    "payment": {
      "customerCardLastDigits": "1234",
      "customerBank": "tbank"
    }
  }'
```

## Чтение итогового статуса

`GET /public/api/v1/shop/orders/external/{externalOrderId}` <a href="[[DOMAIN_URL]]/public/api/payin#tag/v1shoporders/operation/ShopOrdersControllerV1_findOneByExternalOrderId" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>

```bash
curl --location "$BASE_URL/shop/orders/external/merchant-10002" \
  --header "Authorization: Bearer $SHOP_TOKEN"
```

## Связанные страницы

- [PayIn H2H sync requisites](/doc/v2/h2h-sync/)
- <a href="/doc/api/payin/02-orders/" target="_blank" rel="noopener noreferrer">PAYIN API: создание и список ордеров</a>

