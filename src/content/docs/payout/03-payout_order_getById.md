---
title: "PayOut. Получить ордер по ID"
---

# PayOut. Получить ордер по ID.

### Описание

Метод используется для получения данных по PayOut ордеру. В query запроса добавляется параметр ID, тело запроса остается пустым.

-------------------
### Структура запроса

* Метод: `GET`
* Endpoint: `https://domain/public/api/v1/shop/payout-orders/{id}`
* Headers: `"Authorization": "{Bearer API_KEY}"`

-------------------

### Параметры запроса (передаются в query)

| Поле              | Обязательное поле| Object| Тип            | Описание                                       | Значение по умолчанию |
| ----------------- | ---| -------------------| ---------------| ------------------------------------------------ | --------------------- |
| `id`          | Обязательно| -               | `float`        | ID ордера который необходимо получить                                   |           -            |

-------------------

### Примеры запросов

<details>
<summary><strong>Получить данные по ордеру с ID 54a16d99-e268-467f-acfd-f280e88f5de9</strong></summary>

```
curl --location 'https://domain/public/api/v1/shop/payout-orders/54a16d99-e268-467f-acfd-f280e88f5de9' \
--header 'Authorization: ••••••'
```
</details>

-------------------

### Структура ответа (может различаться в зависимости от полноты данных)

| Поле              | Обязательное поле| Object| Тип            | Описание                                       | Значение по умолчанию |
| ----------------- | ---| -------------------| ---------------| ------------------------------------------------ | --------------------- |
| `id`          | Обязательно| Блок               | `float`        | ID ордера                                  |                       |
| `amount`          | Обязательно| Блок               | `float`        | Сумма операции в фиат валюте (RUB)                                   |                       |
| `currency`        | Обязательно| Блок               | `string`       | Валюта    | `RUB`                 |
| `status`        | Обязательно| Блок               | `string`       | Статус ордера    | `RUB`                 |
| `statusDetails`        | Обязательно| Блок               | `string`       | Описание статуса    | `RUB`                 |
| `assetCurrencyAmount`        | Обязательно| Блок               | `string`       | Сумма операции в ассет валюте (USDT)    | `RUB`                 |
| `shopAmount`        | Обязательно| Блок               | `string`       | Валюта    | `RUB`                 |
| `shopFee`        | Обязательно| Блок               | `string`       | Комиссия магазина    | `RUB`                 |
| `currencyRate`        | Обязательно| Блок               | `string`       | Курс валюты    | `RUB`                 |
| `shop.name`     | Тип| integration        | `string`       | Имя магазина в системе               | `None`                |
| `payment.bank`  | Тип| integration        | `string`       | Метод оплаты               | `None`                |
| `payment.type`  | Тип| integration        | `string`       | Метод оплаты               | `None`                |
| `customer.id`  | Тип| integration        | `string`       | ID пользователя               | `None`                |
| `customer.name`  | Тип| integration        | `string`       | ФИО пользователя               | `None`                |
| `customer.email`  | Тип| integration        | `string`       | Email пользователя               | `None`                |
| `customer.telegram`  | Тип| integration        | `string`       | Номер телефона пользователя              | `None`                |
| `customer.requisites.phone`  | Тип| integration        | `string`       | Номер телефона пользователя              | `None`                |
| `customer.requisites.card`  | Тип| integration        | `string`       | Номер телефона пользователя              | `None`                |
| `customer.requisites.cardholder`  | Тип| integration        | `string`       | Номер телефона пользователя              | `None`                |
| `customer.requisites.swiftBic`  | Тип| integration        | `string`       | Номер телефона пользователя              | `None`                |
| `customer.requisites.bic`  | Тип| integration        | `string`       | Номер телефона пользователя              | `None`                |
| `customer.requisites.idCard`  | Тип| integration        | `string`       | Номер телефона пользователя              | `None`                |
| `customer.requisites.beneficiaryName`  | Тип| integration        | `string`       | Номер телефона пользователя              | `None`                |
| `customer.requisites.accountNumber`  | Тип| integration        | `string`       | Номер телефона пользователя              | `None`                |
| `customer.requisites.expirationDate`  | Тип| integration        | `string`       | Номер телефона пользователя              | `None`                |
| `customer.requisites.taxId`  | Тип| integration        | `string`       | Номер телефона пользователя              | `None`                |
| `integration.externalOrderId`  | Тип| integration        | `string`       | ID ордера в системе мерчанта               | `None`                |
| `integration.callbackUrl`  | Тип| integration        | `string`       | URL адрес на который будут направлены коллбэки по ордеру               | `None`                |
| `integration.callbackUrlStatus`  | Тип| integration        | `string`       | Статус отправки коллбэка               | `None`                |
| `integration.callbackMethod`  | Тип| integration        | `string`       | Способ отправки коллбэков GET или POST               | `None`                |


### Примеры ответов

<details>

<summary><strong>Получить данные по ордеру<code>54a16d99-e268-467f-acfd-f280e88f5de9</code></strong></summary>

```json
{
    "id": "54a16d99-e268-467f-acfd-f280e88f5de9",
    "amount": 3434,
    "currency": "RUB",
    "status": "completed",
    "statusDetails": null,
    "shop": {
        "name": "igor_test_shop"
    },
    "payment": {
        "bank": "tinkoff",
        "type": "card2card"
    },
    "customer": {
        "id": "12334",
        "name": null,
        "email": null,
        "telegram": null,
        "requisites": {
            "phone": null,
            "card": "1111111111111111",
            "cardholder": "biba boba",
            "swiftBic": null,
            "bic": null,
            "idCard": null,
            "beneficiaryName": null,
            "accountNumber": null,
            "expirationDate": "0527",
            "taxId": null
        }
    },
    "assetCurrencyAmount": 25.5846,
    "shopAmount": 27.63137,
    "shopFee": 2.04677,
    "currencyRate": 134.22135,
    "integration": {
        "externalOrderId": null,
        "callbackUrl": "https://domain/demo/api/callback",
        "callbackUrlStatus": null,
        "callbackMethod": "post"
    }
}
```
</details>