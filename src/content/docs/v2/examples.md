---
title: "Примеры"
description: "Одна страница с основными API-запросами и ожидаемыми ответами для запуска мерчанта"
---

Эта страница отделяет примеры от логики процесса. Сценарные страницы в `V2` объясняют только flow, а здесь собраны основные API-запросы и ожидаемые ответы для быстрого запуска мерчанта.

## Переменные

```bash
export BASE_URL="[[BASE_URL]]"
export SHOP_TOKEN="<SHOP_API_KEY>"
export BALANCE_TOKEN="<BALANCE_API_KEY>"
export CALLBACK_URL="[[CALLBACK_URL]]"
export PAYOUT_CALLBACK_URL="[[PAYOUT_CALLBACK_URL]]"
```

## PayIn Redirect

### Создать redirect-ордер

`POST /public/api/v1/shop/orders` <a href="[[DOMAIN_URL]]/public/api/payin#tag/v1shoporders/operation/ShopOrdersControllerV1_create" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>

```bash
curl --location "$BASE_URL/shop/orders" \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer $SHOP_TOKEN" \
  --data '{
    "amount": 1500,
    "currency": "RUB",
    "customer": {
      "id": "order-10001"
    },
    "integration": {
      "externalOrderId": "merchant-10001",
      "callbackUrl": "[[CALLBACK_URL]]",
      "callbackMethod": "post"
    }
  }'
```

Что важно в ответе:

- `id`
- `integration.externalOrderId`
- `integration.link`
- стартовый `status`

### Прочитать статус ордера

`GET /public/api/v1/shop/orders/{id}` <a href="[[DOMAIN_URL]]/public/api/payin#tag/v1shoporders/operation/ShopOrdersControllerV1_findOne" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>  
`GET /public/api/v1/shop/orders/external/{externalOrderId}` <a href="[[DOMAIN_URL]]/public/api/payin#tag/v1shoporders/operation/ShopOrdersControllerV1_findOneByExternalOrderId" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>

```bash
curl --location "$BASE_URL/shop/orders/external/merchant-10001" \
  --header "Authorization: Bearer $SHOP_TOKEN"
```

## PayIn H2H sync requisites

### Получить доступные способы оплаты

`GET /public/api/v1/shop/trade-methods` <a href="[[DOMAIN_URL]]/public/api/payin#tag/v1shoptrade-methods/operation/ShopTradeMethodsController_getTradeMethods" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>

```bash
curl --location "$BASE_URL/shop/trade-methods" \
  --header "Authorization: Bearer $SHOP_TOKEN"
```

### Создать ордер с реквизитами сразу

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

Что важно в ответе:

- `status=customer_confirm`
- блок `requisites`
- `externalOrderId`

### Подтвердить оплату

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

## PayIn H2H step-by-step

### Создать базовый ордер

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

### Записать выбранный способ оплаты

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

### Запустить поиск реквизитов

`POST /public/api/v1/shop/orders/{id}/start-payment` <a href="[[DOMAIN_URL]]/public/api/payin#tag/v1shoporders/operation/ShopOrdersControllerV1_startPayment" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>

```bash
curl --location --request POST "$BASE_URL/shop/orders/94215bfb-1963-4a41-9686-f90412e0a58f/start-payment" \
  --header "Authorization: Bearer $SHOP_TOKEN"
```

### Подтвердить оплату

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

## Payout H2H

### Проверить баланс магазина

`GET /public/api/v1/shop/assets` <a href="[[DOMAIN_URL]]/public/api/payin#tag/v1shopassets/operation/ShopAssetsController_getShopAssets" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>

```bash
curl --location "$BASE_URL/shop/assets" \
  --header "Authorization: Bearer $BALANCE_TOKEN"
```

### Получить доступные способы выплаты

`GET /public/api/v1/shop/trade-methods/payout` <a href="[[DOMAIN_URL]]/public/api/payout#tag/v1shoptrade-methodspayout/operation/ShopTradeMethodsController_getPayoutTradeMethods" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>

```bash
curl --location "$BASE_URL/shop/trade-methods/payout" \
  --header "Authorization: Bearer $SHOP_TOKEN"
```

### Создать payout-ордер

`POST /public/api/v1/shop/payout-orders` <a href="[[DOMAIN_URL]]/public/api/payout#tag/v1shoppayout-orders/operation/ShopPayoutOrdersControllerV1_createWithTimeout" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>

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

### Прочитать или отменить payout-ордер

`GET /public/api/v1/shop/payout-orders/{id}` <a href="[[DOMAIN_URL]]/public/api/payout#tag/v1shoppayout-orders/operation/ShopPayoutOrdersControllerV1_findOne" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>  
`GET /public/api/v1/shop/payout-orders/external/{externalOrderId}` <a href="[[DOMAIN_URL]]/public/api/payout#tag/v1shoppayout-orders/operation/ShopPayoutOrdersControllerV1_findOneByExternalOrderId" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>  
`POST /public/api/v1/shop/payout-orders/{id}/cancel` <a href="[[DOMAIN_URL]]/public/api/payout#tag/v1shoppayout-orders/operation/ShopPayoutOrdersControllerV1_cancel" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>

```bash
curl --location "$BASE_URL/shop/payout-orders/external/merchant-payout-10001" \
  --header "Authorization: Bearer $SHOP_TOKEN"
```

## Примеры callback

### PayIn callback

```text
[[CALLBACK_URL]]?id=94215bfb-1963-4a41-9686-f90412e0a58f&amount=1500&customerId=order-10001&status=completed&externalOrderId=merchant-10001&signature=5ce1...
```

### Payout callback

```text
[[PAYOUT_CALLBACK_URL]]?id=b4ad11f1-10b3-4684-8fe4-2d6f3969e77a&amount=1200&customerId=payout-10001&status=completed&externalOrderId=merchant-payout-10001&signature=5ce1...
```

## Что важно

- если create-запрос завершился таймаутом, сначала ищите ордер по `externalOrderId`;
- redirect или create-ответ не означают финальный успешный статус;
- финал всегда фиксируется по callback или по дочитыванию ордера;
- flow смотрите в сценарных страницах, а не здесь.

## Связанные страницы

- [Интеграция](/doc/v2/integration/)
- [PayIn Redirect](/doc/v2/red/)
- [PayIn H2H sync requisites](/doc/v2/h2h-sync/)
- [PayIn H2H step-by-step](/doc/v2/h2h-step/)
- [Payout H2H](/doc/v2/payout/)
