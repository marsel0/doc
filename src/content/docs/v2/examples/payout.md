---
title: "Примеры Payout H2H"
description: "Запросы и ответы для сценария выплат"
---

Эта страница собирает примеры для сценария `Payout H2H`: чтение trade methods, создание payout-ордера, чтение, отмену, callback и соседние запросы, которые часто нужны рядом с выплатами.

## Переменные

```bash
export BASE_URL="[[BASE_URL]]"
export SHOP_TOKEN="<SHOP_API_KEY>"
export BALANCE_TOKEN="<BALANCE_API_KEY>"
export CALLBACK_URL="[[PAYOUT_CALLBACK_URL]]"
```

## Проверить баланс магазина

`GET /public/api/v1/shop/assets` <a href="[[DOMAIN_URL]]/public/api/payin#tag/v1shopassets/operation/ShopAssetsController_getShopAssets" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>

```bash
curl --location "$BASE_URL/shop/assets" \
  --header "Authorization: Bearer $BALANCE_TOKEN"
```

Если средств недостаточно, создание payout-ордера завершится бизнес-ошибкой.

## Получить доступные способы выплаты

`GET /public/api/v1/shop/trade-methods/payout` <a href="[[DOMAIN_URL]]/public/api/payout#tag/v1shoptrade-methodspayout/operation/ShopTradeMethodsController_getPayoutTradeMethods" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>

```bash
curl --location "$BASE_URL/shop/trade-methods/payout" \
  --header "Authorization: Bearer $SHOP_TOKEN"
```

Что смотреть в ответе:

- `paymentType` и `bank`;
- обязательные поля в `fields[]`;
- необходимость передавать `bank` для конкретного метода.

## Создать payout: SBP

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
      "email": "buyer@example.com",
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

После успешного create payout обычно переходит в рабочий промежуточный статус, а не сразу в финал.

## Создать payout: Card2Card без явного банка

`POST /public/api/v1/shop/payout-orders` <a href="[[DOMAIN_URL]]/public/api/payout#tag/v1shoppayout-orders/operation/ShopPayoutOrdersControllerV1_createWithTimeout" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>

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

Для `card2card` сервис может определить банк автоматически по BIN карты.

## Чтение payout-ордеров

`GET /public/api/v1/shop/payout-orders/{id}` <a href="[[DOMAIN_URL]]/public/api/payout#tag/v1shoppayout-orders/operation/ShopPayoutOrdersControllerV1_findOne" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>  
`GET /public/api/v1/shop/payout-orders/external/{externalOrderId}` <a href="[[DOMAIN_URL]]/public/api/payout#tag/v1shoppayout-orders/operation/ShopPayoutOrdersControllerV1_findOneByExternalOrderId" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>  
`GET /public/api/v1/shop/payout-orders` <a href="[[DOMAIN_URL]]/public/api/payout#tag/v1shoppayout-orders/operation/ShopPayoutOrdersControllerV1_find" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>

### По внутреннему `id`

```bash
curl --location "$BASE_URL/shop/payout-orders/b4ad11f1-10b3-4684-8fe4-2d6f3969e77a" \
  --header "Authorization: Bearer $SHOP_TOKEN"
```

### По `externalOrderId`

```bash
curl --location "$BASE_URL/shop/payout-orders/external/merchant-payout-10001" \
  --header "Authorization: Bearer $SHOP_TOKEN"
```

### Список payout-ордеров

```bash
curl --location "$BASE_URL/shop/payout-orders?from=2026-03-01&to=2026-03-14&status=completed&take=50&page=1" \
  --header "Authorization: Bearer $SHOP_TOKEN"
```

## Отменить payout-ордер

`POST /public/api/v1/shop/payout-orders/{id}/cancel` <a href="[[DOMAIN_URL]]/public/api/payout#tag/v1shoppayout-orders/operation/ShopPayoutOrdersControllerV1_cancel" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>

```bash
curl --location --request POST "$BASE_URL/shop/payout-orders/b4ad11f1-10b3-4684-8fe4-2d6f3969e77a/cancel" \
  --header "Authorization: Bearer $SHOP_TOKEN"
```

Если статус уже ушёл дальше допустимой точки отмены, API вернёт ошибку действия для текущего статуса.

## Callback payout

Пример callback:

```text
[[PAYOUT_CALLBACK_URL]]?id=b4ad11f1-10b3-4684-8fe4-2d6f3969e77a&amount=1200&customerId=payout-10001&status=completed&externalOrderId=merchant-payout-10001&signature=5ce1...
```

Пример callback при отмене:

```text
[[PAYOUT_CALLBACK_URL]]?id=b4ad11f1-10b3-4684-8fe4-2d6f3969e77a&amount=1200&customerId=payout-10001&status=cancelled&statusDetails=shop&externalOrderId=merchant-payout-10001&signature=18aa...
```

## Что важно в payout-примерах

- успешный create payout не означает финальную выплату;
- после таймаута create-запроса сначала ищите payout по `externalOrderId`;
- `callbackUrlStatus` удобно использовать как технический индикатор доставки callback;
- для спорных кейсов payout лучше сразу дочитывать по `GET`.

## Связанные страницы

- [Payout H2H](/doc/v2/payout/)
- <a href="/doc/api/payout/02-orders/" target="_blank" rel="noopener noreferrer">PAYOUT API: создание и список ордеров</a>
- <a href="/doc/api/payout/03-read-and-cancel/" target="_blank" rel="noopener noreferrer">PAYOUT API: чтение и отмена</a>

