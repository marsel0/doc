---
title: "Примеры H2H step-by-step"
description: "Запросы и ответы для сценария с выбором после создания ордера"
---

Эта страница собирает примеры для сценария `PayIn H2H step-by-step`, где способ оплаты выбирается уже после создания ордера.

## Переменные

```bash
export BASE_URL="[[BASE_URL]]"
export SHOP_TOKEN="<SHOP_API_KEY>"
export CALLBACK_URL="[[CALLBACK_URL]]"
```

## Создать базовый ордер

`POST /public/api/v1/shop/orders` <a href="[[DOMAIN_URL]]/public/api/payin#tag/v1shoporders/operation/ShopOrdersControllerV1_create" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>

```bash
curl --location "$BASE_URL/shop/orders" \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer $SHOP_TOKEN" \
  --data '{
    "amount": 1500,
    "currency": "RUB",
    "customer": {
      "id": "order-10003"
    },
    "integration": {
      "externalOrderId": "merchant-10003",
      "callbackUrl": "[[CALLBACK_URL]]",
      "callbackMethod": "post"
    }
  }'
```

## Записать выбранный способ оплаты

`PATCH /public/api/v1/shop/orders/{id}` <a href="[[DOMAIN_URL]]/public/api/payin#tag/v1shoporders/operation/ShopOrdersControllerV1_update" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>

```bash
curl --location --request PATCH "$BASE_URL/shop/orders/94215bfb-1963-4a41-9686-f90412e0a58f" \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer $SHOP_TOKEN" \
  --data '{
    "payment": {
      "type": "card2card",
      "bank": "tbank"
    }
  }'
```

## Запустить поиск реквизитов

`POST /public/api/v1/shop/orders/{id}/start-payment` <a href="[[DOMAIN_URL]]/public/api/payin#tag/v1shoporders/operation/ShopOrdersControllerV1_startPayment" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>

```bash
curl --location --request POST "$BASE_URL/shop/orders/94215bfb-1963-4a41-9686-f90412e0a58f/start-payment" \
  --header "Authorization: Bearer $SHOP_TOKEN"
```

## Подтвердить оплату

`POST /public/api/v1/shop/orders/{id}/confirm-payment` <a href="[[DOMAIN_URL]]/public/api/payin#tag/v1shoporders/operation/ShopOrdersControllerV1_confirmPayment" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>

После получения реквизитов и фактической оплаты клиента:

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

## Типовые ошибки

| Код | Когда встречается | Что делать |
| --- | --- | --- |
| `O10001` | перед `start-payment` не выбран `payment.type` | сначала обновить `payment` |
| `O10000` | действие не подходит текущему статусу | сначала прочитать ордер |
| `S10002` | create-запрос не успел вернуть ответ | искать ордер по `externalOrderId` |

## Связанные страницы

- [PayIn H2H step-by-step](/doc/v2/h2h-step/)
- <a href="/doc/api/payin/04-actions/" target="_blank" rel="noopener noreferrer">PAYIN API: действия над ордером</a>

