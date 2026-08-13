---
title: "PayOut API: создание и список PayOut-ордеров"
---

## GET `/shop/payout-orders`

Возвращает список PayOut-ордеров в формате `PaginatedData<GetShopPayoutOrderDto>`.

### Query

| Параметр | Обязательно | Формат |
| --- | --- | --- |
| `from` | нет | `YYYY-MM-DD` или ISO 8601 |
| `to` | нет | `YYYY-MM-DD` или ISO 8601 |
| `tz` | нет | IANA timezone, например `Europe/Moscow`; по умолчанию UTC |
| `status` | нет | Статус PayOut-ордера |
| `take` | нет | Целое `1..1000`; по умолчанию `100` |
| `page` | нет | Номер страницы; по умолчанию `1` |

```bash
curl --location "$BASE_URL/shop/payout-orders?from=2026-03-01&to=2026-03-14&status=completed&take=50&page=1" \
  --header "Authorization: Bearer $SHOP_TOKEN"
```

## POST `/shop/payout-orders`

Создаёт PayOut-ордер.

:::caution[Не повторяйте создание после неопределённого результата]
Если запрос на создание PayOut-ордера не завершился стандартным ответом API с явным
отказом — например, ответ не пришёл, произошёл сетевой сбой или API вернул ошибку
`5xx`, — PayOut-ордер следует считать созданным. Проверьте его статус перед
повторной попыткой, чтобы избежать дублирования PayOut-ордеров.

Найдите PayOut-ордер по уникальному `integration.externalOrderId`:

```bash
curl "$BASE_URL/shop/payout-orders/external/$EXTERNAL_ORDER_ID" \
  --header "Authorization: Bearer $SHOP_TOKEN"
```

Используйте статус из ответа этого запроса и не отправляйте повторный
`POST /shop/payout-orders` вслепую. Если результат по-прежнему неизвестен, не
создавайте второй PayOut-ордер с другим ID — передайте случай в поддержку.
:::

### Обязательные поля body

| Поле | Обязательность | Требование |
| --- | --- | --- |
| `amount` | да | положительное число больше `0` |
| `currency` | да | строка с кодом фиатной валюты, например `RUB` |
| `customer` | да | объект |
| `customer.id` | да | стабильный ID клиента в системе магазина; не ID PayOut-ордера |
| `customer.requisites` | да | объект<br />обязательные вложенные поля зависят от `payment.type` |
| `payment` | да | объект |
| `payment.type` | да | Согласованный `paymentType` или код из [списка PayOut-методов](/doc/api/payout/04-dictionaries/#get-shoptrade-methodspayout); [назначение кодов](/doc/api/shop/05-payment-types/) |
| `payment.bank` | нет | Рекомендуется передавать согласованный `bank` или код из [списка PayOut-методов и банков](/doc/api/payout/04-dictionaries/#get-shoptrade-methodspayout). Без него банк определяется по первым 6 цифрам карты или выбирается настроенный вариант |

### Необязательные поля body

| Поле | Для чего нужно |
| --- | --- |
| `customer.name` | Имя клиента в системе магазина |
| `customer.email` | Валидный email клиента |
| `customer.telegram` | Telegram клиента |
| `integration.externalOrderId` | Уникальный ID PayOut-ордера в системе магазина; рекомендуется всегда для поиска после таймаута |
| `integration.callbackUrl` | Полный URL обработчика статусов на сервере магазина |
| `integration.callbackMethod` | `post` или `get`; по умолчанию `post` |

### Какие поля обязательны внутри `customer.requisites`

Точный набор обязательных полей нужно брать из [`GET /shop/trade-methods/payout`](/doc/api/payout/04-dictionaries/#get-shoptrade-methodspayout) по `fields[].required`. Для текущей схемы публичного PayOut API используются такие значения:

| `payment.type` | Обязательные поля в `customer.requisites` | Требования к обязательным полям |
| --- | --- | --- |
| `sbp`<br />`sberpay`<br />`tsbp` | `phone` | `phone`:<br />строка длиной от `7` до `16` символов<br />рекомендуется передавать номер в полном формате с кодом страны |
| `card2card`<br />`tcard2card` | `cardInfo` | `cardInfo`:<br />только цифры<br />ровно `16` символов |
| `account_number`<br />`account_number_iban`<br />`upi`<br />`erip` | `accountNumber` | `accountNumber`:<br />строка<br />API не проверяет формат дополнительно |
| `account_number_sepa` | `accountNumber`<br />`cardholder`<br />`swiftBic` | `accountNumber`:<br />строка<br /><br />`cardholder`:<br />строка до `200` символов<br /><br />`swiftBic`:<br />строка |
| `phone_number`<br />`sim` | `phone` | `phone`:<br />строка длиной от `7` до `16` символов |
| `transfer_via_id_card` | `idCard` | `idCard`:<br />строка<br />API не проверяет формат дополнительно |
| `imps` | `accountNumber`<br />`swiftBic`<br />`cardholder` | `accountNumber`:<br />строка<br /><br />`swiftBic`:<br />строка<br /><br />`cardholder`:<br />строка до `200` символов |
| `phone_pe` | `phone`<br />`accountNumber` | `phone`:<br />строка длиной от `7` до `16` символов<br /><br />`accountNumber`:<br />строка |

### Поля `customer.requisites`, которые принимает публичный PayOut API

- `phone`
- `cardInfo`
- `cardholder`
- `swiftBic`
- `bic`
- `idCard`
- `beneficiaryName`
- `accountNumber`
- `expirationDate`
- `taxId`

```bash
curl --location "$BASE_URL/shop/payout-orders" \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer $SHOP_TOKEN" \
  --data '{
    "amount": 1200,
    "currency": "RUB",
    "customer": {
      "id": "customer-42",
      "requisites": {
        "phone": "+79990001122"
      }
    },
    "payment": {
      "type": "sbp",
      "bank": "sberbank"
    },
    "integration": {
      "externalOrderId": "merchant-payout-20001",
      "callbackUrl": "[[PAYOUT_CALLBACK_URL]]",
      "callbackMethod": "post"
    }
  }'
```

### Основные поля ответа

| Поле | Значение |
| --- | --- |
| `id` | Внутренний UUID PayOut-ордера |
| `amount`, `currency` | Сумма и фиатная валюта выплаты |
| `status`, `statusDetails` | Текущее состояние и его причина; после создания обычно `requisites` |
| `payment` | Фактически выбранные `type` и `bank` |
| `customer` | Данные клиента и реквизиты получателя |
| `integration.externalOrderId` | ID PayOut-ордера в системе магазина |
| `integration.callbackUrlStatus` | Состояние доставки последнего уведомления |
| `assetCurrencyAmount` | Эквивалент выплаты в asset-валюте |
| `shopAmount` | Сумма списания с магазина в asset-валюте |
| `shopFee` | Комиссия магазина в asset-валюте |
| `currencyRate` | Курс, использованный для расчёта |

Для карты в запросе используется `customer.requisites.cardInfo`, а в ответе это
значение возвращается как `customer.requisites.card`.
