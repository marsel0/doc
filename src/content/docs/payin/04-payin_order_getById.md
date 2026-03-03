---
title: "PayIn. Получить ордер по ID"
---

# PayIn. Получить ордер по ID.

### Описание

Метод используется для получения данных по PayIn ордеру. 

-------------------
### Структура запроса

* Метод: `GET`
* Endpoint: `https://domain/public/api/v1/shop/orders/{id}`
* Headers: `"Authorization": "{Bearer API_KEY}"`

-------------------

### Параметры запроса (передаются в query)

| Поле | Обязательное | Object | Тип   | Описание                              | Значение по умолчанию |
| ---- | ------------ | ------ | ----- | ------------------------------------- | --------------------- |
| id   | Обязательно  | -      | string| ID ордера который необходимо получить | -                     |

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

