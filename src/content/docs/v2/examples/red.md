---
title: "Примеры Redirect"
description: "Запросы и ответы для сценария PayIn Redirect"
---

Эта страница собирает примеры для сценария `PayIn Redirect`, где мерчант создаёт ордер и перенаправляет клиента на платёжную страницу платформы.

## Переменные

```bash
export BASE_URL="[[BASE_URL]]"
export SHOP_TOKEN="<SHOP_API_KEY>"
export CALLBACK_URL="[[CALLBACK_URL]]"
```

## Создать redirect-ордер

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

## Что ожидать в ответе

В ответе для `RED` важнее всего:

- внутренний `id` ордера;
- `externalOrderId`;
- `integration.link` для перенаправления клиента;
- `integration.token`, если дальше используется клиентский flow;
- начальный статус ордера.

После этого клиента нужно перевести на `integration.link`.

## Чтение итогового статуса

`GET /public/api/v1/shop/orders/{id}` <a href="[[DOMAIN_URL]]/public/api/payin#tag/v1shoporders/operation/ShopOrdersControllerV1_findOne" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>  
`GET /public/api/v1/shop/orders/external/{externalOrderId}` <a href="[[DOMAIN_URL]]/public/api/payin#tag/v1shoporders/operation/ShopOrdersControllerV1_findOneByExternalOrderId" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>

### По внутреннему `id`

```bash
curl --location "$BASE_URL/shop/orders/94215bfb-1963-4a41-9686-f90412e0a58f" \
  --header "Authorization: Bearer $SHOP_TOKEN"
```

### По `externalOrderId`

```bash
curl --location "$BASE_URL/shop/orders/external/merchant-10001" \
  --header "Authorization: Bearer $SHOP_TOKEN"
```

## Что важно в Redirect-примерах

- возврат клиента на ваш сайт не равен успешной оплате;
- финал фиксируется по callback или дочитыванию ордера;
- после таймаута create-запроса сначала ищите ордер по `externalOrderId`;
- основной риск — создать дубль вместо дочитывания существующего ордера.

## Типовые ошибки Redirect

| Код | Когда встречается | Что делать |
| --- | --- | --- |
| `S10002` | create-запрос не успел вернуть ответ | искать ордер по `externalOrderId` |
| `O10006` | дублируется `externalOrderId` | дочитать уже существующий ордер |
| `O10007` | по `externalOrderId` найдено больше одного ордера | использовать внутренний `id` |

## Источник для переноса

- <a href="/doc/payin/02-integration/" target="_blank" rel="noopener noreferrer">PAYIN: сценарии и curl-примеры</a>

## Связанные страницы

- [RED](/doc/v2/red/)
- <a href="/doc/api/payin/02-orders/" target="_blank" rel="noopener noreferrer">PAYIN API: создание и список ордеров</a>
- <a href="/doc/api/payin/03-read/" target="_blank" rel="noopener noreferrer">PAYIN API: чтение ордеров</a>

