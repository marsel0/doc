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
| `id`          | Обязательно| -               | `string`        | ID ордера который необходимо получить                                   |           -            |

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

| Поле              |  Object| Тип            | Описание                                       | 
| ----------------- |  -------------------| ---------------| ------------------------------------------------ | 
| `id`          |  -              | `string`        | ID ордера                                  |
| `initialAmount`          |  -              | `float`        | ID ордера                                  |
| `amount`          |  -               | `float`        | Сумма операции в фиат валюте (RUB)                                   |
| `currency`        |  -               | `string`       | Валюта    | 
| `status`        |  -               | `string`       | Статус ордера    | 
| `statusDetails`        |  -               | `string`       | Описание статуса    | 
| `statusTimeoutAt`        |  -               | `string`       | Дата статуса????    | 
| `assetCurrencyAmount`        |  -               | `float`       | Сумма операции в ассет валюте (USDT)    | 
| `shopAmount`        |  -               | `float`       | Валюта    | 
| `shopFee`        |  -               | `float`       | Комиссия магазина    | 
| `initialShopCommission`        |  -               | `float`       | Комиссия магазина    | 
| `requisites.countryCode`        |  requisites               | `string`       | Реквизиты. Код страны    | 
| `requisites.countryNameRu`        |  requisites               | `string`       | Реквизиты. Наименование страны на русском    | 
| `requisites.countryNameEn`        |  requisites               | `string`       | Реквизиты. Наименование страны на английском     | 
| `requisites.phone`        |  requisites               | `string`       | Реквизиты. Номер телефона    | 
| `requisites.cardInfo`        |  requisites               | `string`       | Реквизиты. Номер карты    | 
| `requisites.bank`        |  requisites               | `string`       | Реквизиты. Символьный код банка    | 
| `requisites.bankName`        |  requisites               | `string`       | Реквизиты. Наименование банка    | 
| `requisites.sameBank`        |  requisites               | `boolean`       | Реквизиты. ????????   | 
| `requisites.cardholder`        |  requisites               | `string`       | Реквизиты. Держатель карты    | 
| `requisites.swiftBic`        |  requisites               | `string`       | Реквизиты. Свифт БИК??    | 
| `requisites.bic`        |  requisites               | `string`       | Реквизиты. БИК    | 
| `requisites.email`        |  requisites               | `string`       | Реквизиты. Email    | 
| `requisites.idCard`        |  requisites               | `string`       | Курс валюты    | 
| `requisites.beneficiaryName`        |  requisites               | `string`       | Курс валюты    | 
| `requisites.accountNumber`        |  requisites               | `string`       | Реквизиты. Номер счета    | 
| `requisites.taxId`        |  requisites               | `string`       | Курс валюты    | 
| `requisites.expirationDate`        |  requisites               | `string`       | Курс валюты    | 
| `requisites.sberPayUrl`        |  requisites               | `string`       | Курс валюты    | 
| `requisites.paymentLink`        |  requisites               | `string`       | Реквизиты. Ссылка для оплаты    | 
| `requisites.qrImageUrl`        |  requisites               | `string`       | Реквизиты. Ссылка для оплаты через QR код   | 
| `shop.name`     | shop        | `string`       | Имя магазина в системе               | 
| `payment.bank`  | payment        | `string`       | Метод оплаты               | 
| `payment.type`  | payment        | `string`       | Метод оплаты               |
| `customer.id`  | customer        | `string`       | ID пользователя               |
| `customer.name`  | customer        | `string`       | ФИО пользователя               |
| `customer.email`  | customer        | `string`       | Email пользователя               |
| `customer.telegram`  | customer        | `string`       | Учетная запись телеграмм              |
| `customer.requisites.phone`  | customer.requisites        | `string`       | Реквизиты. Номер телефона              |
| `customer.requisites.card`  | customer.requisites        | `string`       | Реквизиты. Номер телефона              |
| `customer.requisites.cardholder`  | customer.requisites        | `string`       | Держатель карты              |
| `customer.requisites.swiftBic`  | customer.requisites        | `string`       | Номер телефона пользователя              |
| `customer.requisites.bic`  | customer.requisites        | `string`       | БИК пользователя             |
| `customer.requisites.idCard`  | customer.requisites        | `string`       | Номер телефона пользователя              |
| `customer.requisites.beneficiaryName`  | customer.requisites        | `string`       | Номер телефона пользователя              |
| `customer.requisites.accountNumber`  | customer.requisites        | `string`       | Номер счета пользователя             |
| `customer.requisites.expirationDate`  | customer.requisites        | `string`       | Номер телефона пользователя              |
| `customer.requisites.taxId`  | customer.requisites        | `string`       | Номер телефона пользователя              |
| `integration.externalOrderId`  |integration        | `string`       | ID ордера в системе мерчанта               |
| `integration.callbackUrl`  | integration        | `string`       | URL адрес на который будут направлены коллбэки по ордеру               |
| `integration.callbackUrlStatus`  | integration        | `string`       | Статус отправки коллбэка               |
| `integration.callbackMethod`  | integration        | `string`       | Способ отправки коллбэков GET или POST               |


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