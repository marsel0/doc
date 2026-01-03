---
title: "PayIn. Получить ордер по ID"
---

# PayIn. Получить ордер по ID.

### Описание

Метод используется для получения данных по PayIn ордеру. В query запроса добавляется параметр ID, тело запроса остается пустым.

-------------------
### Структура запроса

* Метод: `GET`
* Endpoint: `https://domain/public/api/v1/shop/orders/{id}`
* Headers: `"Authorization": "{Bearer API_KEY}"`

-------------------

### Параметры запроса (передаются в query)

| Поле              | Обязательное поле| Object| Тип            | Описание                                       | Значение по умолчанию |
| ----------------- | ---| -------------------| ---------------| ------------------------------------------------ | --------------------- |
| `id`          | Обязательно| -               | `float`        | ID ордера который необходимо получить                                   |           -            |

-------------------

### Примеры запросов

<details>
<summary><strong>Получить данные по ордеру с ID e6181726-e044-43b4-a358-e8044a3614c0</strong></summary>

```
curl --location 'https://domain/public/api/v1/shop/orders/e6181726-e044-43b4-a358-e8044a3614c0' \
--header 'Authorization: ••••••'
```
</details>

-------------------

### Структура ответа

| Поле              | Обязательное поле| Object| Тип            | Описание                                       | Значение по умолчанию |
| ----------------- | ---| -------------------| ---------------| ------------------------------------------------ | --------------------- |
| `id`          | Обязательно| Блок               | `float`        | ID ордера                                  |                       |
| `initialAmount`          | Обязательно| Блок               | `float`        | ID ордера                                  |                       |
| `amount`          | Обязательно| Блок               | `float`        | Сумма операции в фиат валюте (RUB)                                   |                       |
| `currency`        | Обязательно| Блок               | `string`       | Валюта    | `RUB`                 |
| `status`        | Обязательно| Блок               | `string`       | Статус ордера    | `RUB`                 |
| `statusDetails`        | Обязательно| Блок               | `string`       | Описание статуса    | `RUB`                 |
| `statusTimeoutAt`        | Обязательно| Блок               | `string`       | Валюта    | `RUB`                 |
| `assetCurrencyAmount`        | Обязательно| Блок               | `string`       | Сумма операции в ассет валюте (USDT)    | `RUB`                 |
| `shopAmount`        | Обязательно| Блок               | `string`       | Валюта    | `RUB`                 |
| `shopFee`        | Обязательно| Блок               | `string`       | Комиссия магазина    | `RUB`                 |
| `initialShopCommission`        | Обязательно| Блок               | `string`       | Комиссия магазина    | `RUB`                 |
| `currencyRate`        | Обязательно| Блок               | `string`       | Курс валюты    | `RUB`                 |
| `requisites.cardInfo`        | Обязательно| Блок               | `string`       | Реквизит. Номер карты    | `RUB`                 |
| `requisites.cardholder`        | Обязательно| Блок               | `string`       | Реквизит. ФИО владельца карты    | `RUB`                 |
| `requisites.swiftBic`        | Обязательно| Блок               | `string`       | Реквизит. БИК    | `RUB`                 |
| `requisites.email`        | Обязательно| Блок               | `string`       | Реквизит. Email    | `RUB`                 |
| `requisites.idCard`            | Тип| payment            | `string`       | Предпочтительный банк. Если неважно — `any-bank` | `any-bank`            |
| `requisites.beneficiaryName`            | Обязательно| payment            | `string`       | Способ оплаты | `any-bank`            |
| `requisites.accountNumber`              | Обязательно| customer           | `string`       | Реквизит. Номер счета                                    |                       |
| `requisites.expirationDate`            | Тип| customer           | `string`       | ФИО получателя                                   |                       |
| `requisites.phone`           | Тип| customer           | `list[string]` | Реквизит. Номер телефона                                    | `RU`                  |
| `requisites.bank`        | Тип| customer           | `list[string]` | Реквизит. Банк                | `["sbp"]`             |
| `requisites.bankName`        | Обязательно| customer.requisites| `string`       | Номер карты получателя                | `None`                |
| `requisites.countryCode`      | Тип| customer.requisites| `string`       | Держатель карты                | `None`                |
| `requisites.countryNameEn`  | Тип| customer.requisites| `string`       | Варианты реквизитов для получения                | `None`                |
| `requisites.sberPayUrl` | Тип| integration        | `string`       | ID ордера в системе мерчанта                | `None`                |
| `shop.name`     | Тип| integration        | `string`       | Имя магазина в системе               | `None`                |
| `shop.customerDataCollectionOrder`  | Тип| integration        | `string`       | Способ отправки коллбэков GET или POST               | `None`                |
| `shop.collectCustomerReceipts`  | Тип| integration        | `string`       | Способ отправки коллбэков GET или POST               | `None`                |
| `payment.type`  | Тип| integration        | `string`       | Метод оплаты               | `None`                |
| `customer.id`  | Тип| integration        | `string`       | ID пользователя               | `None`                |
| `customer.name`  | Тип| integration        | `string`       | ФИО пользователя               | `None`                |
| `customer.email`  | Тип| integration        | `string`       | Email пользователя               | `None`                |
| `customer.phone`  | Тип| integration        | `string`       | Номер телефона пользователя              | `None`                |
| `integration.link`  | Тип| integration        | `string`       | Способ отправки коллбэков GET или POST               | `None`                |
| `integration.token`  | Тип| integration        | `string`       | Способ отправки коллбэков GET или POST               | `None`                |
| `integration.callbackUrl`  | Тип| integration        | `string`       | URL адрес на который будут направлены коллбэки по ордеру               | `None`                |
| `integration.callbackMethod`  | Тип| integration        | `string`       | Способ отправки коллбэков GET или POST               | `None`                |
| `integration.callbackUrlStatus`  | Тип| integration        | `string`       | Статус отправки коллбэка               | `None`                |
| `integration.returnUrl`  | Тип| integration        | `string`       | Способ отправки коллбэков GET или POST               | `None`                |
| `integration.externalOrderId`  | Тип| integration        | `string`       | ID ордера в системе мерчанта               | `None`                |


### Примеры ответов

<details>

<summary><strong>Получить данные по ордеру<code>8382eac8-7c2c-4043-84b4-a4d8bfc31e57</code></strong></summary>

```json
{
    "id": "8382eac8-7c2c-4043-84b4-a4d8bfc31e57",
    "initialAmount": 1800,
    "amount": 1800,
    "currency": "RUB",
    "status": "completed",
    "statusDetails": null,
    "statusTimeoutAt": null,
    "requisites": {
        "cardInfo": null,
        "cardholder": "sbp sber",
        "swiftBic": null,
        "bic": null,
        "email": null,
        "idCard": null,
        "beneficiaryName": null,
        "accountNumber": null,
        "expirationDate": null,
        "taxId": null,
        "paymentLink": null,
        "phone": "+70000000009",
        "bank": "sberbank",
        "bankName": "СберБанк",
        "sameBank": false,
        "countryCode": null,
        "countryNameEn": null,
        "countryNameRu": null,
        "sberPayUrl": null
    },
    "shop": {
        "name": "igor_test_shop",
        "customerDataCollectionOrder": "after_payment",
        "collectCustomerReceipts": false
    },
    "payment": {
        "bank": "sberbank",
        "type": "sbp",
        "customerName": "12 12 12",
        "customerPhoneLastDigits": "1234",
        "customerBank": "12"
    },
    "customer": {
        "id": "09387",
        "ip": null,
        "fingerprint": null,
        "name": null,
        "email": null,
        "phone": null
    },
    "assetCurrencyAmount": 15.48361,
    "shopAmount": 10.83852,
    "shopFee": 4.64509,
    "initialShopCommission": 30,
    "currencyRate": 116.25189,
    "integration": {
        "link": "https://qa-sci.domain/order/8382eac8-7c2c-4043-84b4-a4d8bfc31e57/32811562-d164-41e1-a902-d8405b2e51f4",
        "token": "32811562-d164-41e1-a902-d8405b2e51f4",
        "callbackUrl": "https://www.testUrlCallback.com",
        "callbackMethod": "post",
        "callbackUrlStatus": "error",
        "returnUrl": "https://returnedUrl.com",
        "successUrl": "https://successUrlReturned.com",
        "failUrl": "https://failUrlReturned.com",
        "externalOrderId": "1233456"
    }
}
```
</details>
