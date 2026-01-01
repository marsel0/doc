---
title: "Редирект итеграция"
---

Данный вид интеграции перенаправляет клиента с Вашего магазина на наш платежный шлюз (с нашим дизайном), где клиент выбирает способ оплаты для созданного Вами ордера

### Рабочий процесс

Успешное исполнение ордера происходит в следующем порядке:
1. Создание ордера через [API магазина](https://domain/public/api/payin#tag/v1shoporders/operation/ShopOrdersControllerV1_create):
```bash
curl --location 'https://domain/public/api/v1/shop/orders' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer API_KEY' \
--data '{
    "amount": 111,
    "currency": "RUB",
    "customer": {
        "id": "test-order"
    },
    "integration": {
        "callbackUrl": "https://domain/webhook_receiver",
        "callbackMethod": "get"
    }
}'
```
2. Редирект клиента по ссылке integration.link из ответа предыдущего запроса. Пример ответа:
```json
{
    "id": "94215bfb-1963-4a41-9686-f90412e0a58f",
    "initialAmount": 111,
    "amount": 111,
    "currency": "RUB",
    "status": "new",
    "statusDetails": null,
    "statusTimeoutAt": "2025-10-21T11:58:12.509Z",
    "requisites": null,
    "shop": {
        "name": "SHOP",
        "customerDataCollectionOrder": "before_payment",
        "collectCustomerReceipts": false
    },
    "payment": {},
    "customer": {
        "id": "test-order",
        "ip": null,
        "fingerprint": null,
        "name": null,
        "email": null,
        "phone": null
    },
    "assetCurrencyAmount": 1.34856,
    "shopAmount": null,
    "shopFee": null,
    "currencyRate": 82.31,
    "integration": {
        "link": "https://domain/order/94215bfb-1963-4a41-9686-f90412e0a58f/91efd176-8511-4793-834d-a1b38effb16d",
        "token": "91efd176-8511-4793-834d-a1b38effb16d",
        "callbackUrl": "https://domain/webhook_receiver",
        "callbackMethod": "get",
        "callbackUrlStatus": null,
        "returnUrl": null,
        "successUrl": null,
        "failUrl": null,
        "externalOrderId": null
    }
}
```
В данном случае, вам надо перенаправить пользователя по ссылке "https://domain/order/94215bfb-1963-4a41-9686-f90412e0a58f/91efd176-8511-4793-834d-a1b38effb16d".

3. Ожидание callback (обратного вызова) об исполнении ордера или ручная проверка статуса:
    - Если вы передали callbackUrl, вы можете ожидать callback по указанному адресу - там будет инфомрация о статусе ордера.
    - Если же callbackUrl не передавали, статус ордера надо проверить в ручную, используя [API](https://domain/public/api/v1/shop/orders/{id}) Пример:
```bash
curl --location 'https://interpayment.cx/public/api/v1/shop/orders/94215bfb-1963-4a41-9686-f90412e0a58f' \
--header 'Authorization: Bearer API_KEY'
```