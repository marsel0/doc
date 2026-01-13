---
title: Интеграции PAYOUT
---

## 1) База: URL и авторизация

**Авторизация:**
- API-ключ магазина передаётся в заголовке:
  - `Authorization: Bearer <shopApiKey>`
- `shopApiKey` и `signatureKey` находятся в **деталях магазина**.

Пример заголовков:
```bash
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer <SHOP_API_KEY>' \
```

---

## 2) Быстрый флоу PAYOUT

### 2.1 Реквизиты
1) Получите подходящий для клиента **trade method** и набор требуемых полей, вызвав API **Get trade methods (PAYOUT)**.  
2) Заполните реквизиты клиента в `customer.requisites` по именам полей из `tradeMethod.fields[].name`, то есть:
   - `customer.requisites[tradeMethod.fields[].name] = <значение>`

### 2.2 Создание ордера
1) Создайте payout-ордер через **Create payout order** (shop API), используя ваш `apiKey`.  
2) Если вы указали `integration.callbackUrl`, дождитесь **callback/webhook** на вашем сервере при смене статуса ордера.

---

## 3) Как узнать, какие способы выплаты доступны (trade methods)

### 3.1 Получить методы PAYOUT для магазина
**GET** `/shop/trade-methods/payout`

Этот метод возвращает список доступных способов выплаты. Важные поля:
- `paymentType` — тип выплаты (`sbp`, `card2card`, и т.д.)
- `bank` / `bankName` — банк (если применимо)
- `fiatCurrency` — валюта
- `fields[]` — какие **реквизитные поля** нужны для этого метода, и какие из них обязательные (`required: true`)
- `enabled` — включён ли метод

Пример:
```bash
curl --location 'https://example/public/api/v1/shop/trade-methods/payout' \
  --header 'Authorization: Bearer <SHOP_API_KEY>'
```

### 3.2 Справочники (полезно для UI/валидации)
- **GET** `/banks` — список банков (коды/названия)
- **GET** `/payment-types` — список типов оплаты + их поля/форматы
- **GET** `/currencies/fiat` — фиатные валюты
- **GET** `/trade-methods` — общий список trade methods (публичный)

---

## 4) Создание PAYOUT ордера

### 4.1 Эндпоинт
**POST** `/shop/payout-orders`

### 4.2 Минимально обязательные поля запроса
Обязательные корневые поля:
- `amount` (число > 0)
- `currency` (строка, напр. `RUB`)
- `customer` (объект)
- `payment` (объект)

Обязательные поля `customer`:
- `customer.id`
- `customer.requisites` (объект)

Обязательные поля `payment`:
- `payment.type`
- `payment.bank` — **только если** это требуется выбранным trade method (смотрите `/shop/trade-methods/payout`)

Опционально (рекомендуется):
- `integration.externalOrderId` — ваш внешний ID заявки (уникальный)
- `integration.callbackUrl` — ваш URL для callback
- `integration.callbackMethod` — метод отправки callback (`post` по умолчанию)

---

## 5) Callback/Webhook об изменении статуса

### 5.1 Как выбрать HTTP-метод callback
Чтобы выбрать HTTP-метод, укажите `integration.callbackMethod` при создании ордера.

По умолчанию: **post**

### 5.2 Какие данные приходят в callback
При изменении статуса на ваш `callbackUrl` будет отправлен запрос с параметрами (примерно):
- `id`
- `amount`
- `customerId`
- `status`
- `externalOrderId`
- `statusDetails` (если есть)
- `signature`

Примеры (как это выглядит в параметрах):

После смены статуса на **completed**:
```text
id=12345678&amount=1000&customerId=12345678&status=completed&externalOrderId=12345678&signature=12345678
```

После смены статуса на **cancelled**:
```text
id=12345678&amount=1000&customerId=12345678&status=cancelled&externalOrderId=12345678&statusDetails=shop&signature=12345678
```

После смены статуса на **dispute**:
```text
id=12345678&amount=1000&customerId=12345678&status=dispute&externalOrderId=12345678&statusDetails=no_payment&signature=12345678
```

> Примечание: в подпись не включают `signature` (само поле подписи). Значения `null` в подписи пропускаются.

---

## 6) Подпись callback (signature) — как проверить

`signature` — это результат **sha1** от строки, собранной из значений всех параметров (кроме `signature`) **плюс** `signatureKey`.

Правила:
- берём все ключи payload + добавляем `signatureKey`
- сортируем ключи **по алфавиту**
- берём значения по отсортированным ключам
- соединяем значения через символ `|`
- значения `null` **не учитываем**
- считаем `sha1` от получившейся строки

`signatureKey` находится в деталях магазина.

Пример (JS):
```js
const payload = {
  id: order.id,
  status: order.status,
  amount: order.amount,
  statusDetails: order.statusDetails,
  customerId: order.customer.id,
  externalOrderId: order.integration.externalOrderId,
};

const sortedSignatureKeys = sortBy([...keys(payload), 'signatureKey']);
const stringToSign = map(sortedSignatureKeys, (key) => {
  if (key === 'signatureKey') return signatureKey;
  return payload[key];
}).filter((v) => v !== null && v !== undefined).join('|');

const signature = sha1(stringToSign);
```

---

## 7) Статусы PAYOUT ордера и рекомендации по обработке

### 7.1 status (основные статусы)
Доступные `status`:

- `new` — создан
- `requisites` — поиск/ожидание реквизитов (ожидание действий со стороны трейдера/системы)
- `trader_accept` — принят трейдером (deprecated)
- `trader_payment` — трейдер выполняет выплату (ожидание результата)
- `rejected` — отклонён
- `dispute` — спор
- `completed` — выполнен (успешно завершён)
- `cancelled` — отменён
- `error` — ошибка (нужна поддержка)

### 7.2 statusDetails (детализация статуса)
Доступные `statusDetails`:

- `payment_timeout` — истёк таймаут ожидания выполнения выплаты
- `invalid_requisites` — некорректные реквизиты
- `payment_failed` — выплата не прошла/завершилась ошибкой
- `revert_cancelled` — ордер восстановлен из статуса «cancelled» для дальнейшей обработки
- `admin_created` — ордер создан администратором
- `dispute_verify` — требуется дополнительная проверка администратором
- `different_amount` — сумма выплаты отличалась/была изменена
- `dispute_automation_failed` — автоматизация спора не сработала
- `dispute_unexpected` — неожиданный спор/нестандартная причина
- `shop` — действие/отмена со стороны магазина
- `admin` — действие/отмена со стороны администратора
- `requisites_timeout` — таймаут поиска реквизитов
- `max_rejects_exceeded` — превышено максимальное количество отказов
- `operator` — действие/решение оператора
- `accept_timeout` — таймаут принятия ордера
- `no_funds` — недостаточно средств
- `requisites_blocked` — реквизиты заблокированы
- `payment_impossible` — выплата невозможна
- `revert_dispute` — ордер возвращён из спора в обработку
- `automation_reject` — отклонено автоматикой
- `hold` — ордер на удержании (hold)

Практика обработки:
- Считайте ордер **финальным**, когда он в `completed` или `cancelled` (в зависимости от вашей бизнес-логики).
- `error` — как правило, требует эскалации в поддержку.
- При `rejected`/`dispute` ориентируйтесь на `statusDetails` и внутренний процесс (кто и как подтверждает/отклоняет).

---

## 8) Способы выплаты (payment.type): обязательные поля + рабочие примеры запросов

> ВАЖНО: реальная обязательность полей зависит от **trade method**.  
> Перед интеграцией всегда делайте: **GET `/shop/trade-methods/payout`** и смотрите `fields[].required`.

Ниже — шаблоны запросов, которые проходят базовую валидацию API (формат/структура).  
Если конкретный метод/банк сейчас недоступен — вы можете получить бизнес-ошибку (например `O10005`).

### 8.1 SBP (`sbp`) — перевод по номеру телефона

Обязательные:
- `customer.requisites.phone`

**SBP без банка (если метод не требует bank):**
```bash
curl --location 'https://dev1.tapbank.net/public/api/v1/shop/payout-orders' \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Bearer <SHOP_API_KEY>' \
  --data-raw '{
    "amount": 55,
    "currency": "RUB",
    "customer": {
      "id": "#payout-001",
      "name": "Иванов Иван",
      "email": "ivan@test-client.com",
      "requisites": {
        "phone": "+791270271111"
      }
    },
    "payment": {
      "type": "sbp"
    },
    "integration": {
      "externalOrderId": "payout-001",
      "callbackUrl": "https://merchant.example.com/tapbank/payout-callback",
      "callbackMethod": "post"
    }
  }'
```

**SBP + bank:**
```bash
curl --location 'https://dev1.tapbank.net/public/api/v1/shop/payout-orders' \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Bearer <SHOP_API_KEY>' \
  --data-raw '{
    "amount": 55,
    "currency": "RUB",
    "customer": {
      "id": "#payout-002",
      "requisites": {
        "phone": "+791270271111"
      }
    },
    "payment": {
      "type": "sbp",
      "bank": "vtb"
    },
    "integration": {
      "externalOrderId": "payout-002"
    }
  }'
```

---

### 8.2 Card2Card (`card2card`) — перевод на карту

Обязательные (обычно):
- `customer.requisites.cardInfo`
- иногда `customer.requisites.cardholder` (смотрите trade method)

**Card2Card без банка:**
```bash
curl --location 'https://dev1.tapbank.net/public/api/v1/shop/payout-orders' \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Bearer <SHOP_API_KEY>' \
  --data-raw '{
    "amount": 2500,
    "currency": "RUB",
    "customer": {
      "id": "#c2c-001",
      "requisites": {
        "cardInfo": "4111111111111111",
        "cardholder": "IVAN IVANOV",
        "expirationDate": "12/28"
      }
    },
    "payment": {
      "type": "card2card"
    },
    "integration": {
      "externalOrderId": "payout-c2c-001"
    }
  }'
```

**Card2Card + bank (если требуется конкретным методом):**
```bash
curl --location 'https://dev1.tapbank.net/public/api/v1/shop/payout-orders' \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Bearer <SHOP_API_KEY>' \
  --data-raw '{
    "amount": 2500,
    "currency": "RUB",
    "customer": {
      "id": "#c2c-002",
      "requisites": {
        "cardInfo": "4111111111111111",
        "cardholder": "IVAN IVANOV",
        "expirationDate": "12/28"
      }
    },
    "payment": {
      "type": "card2card",
      "bank": "vtb"
    },
    "integration": {
      "externalOrderId": "payout-c2c-002"
    }
  }'
```

---

### 8.3 SIM (`sim`) — перевод/пополнение по номеру телефона

Обязательные (обычно):
- `customer.requisites.phone`

```bash
curl --location 'https://dev1.tapbank.net/public/api/v1/shop/payout-orders' \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Bearer <SHOP_API_KEY>' \
  --data-raw '{
    "amount": 300,
    "currency": "RUB",
    "customer": {
      "id": "#sim-001",
      "requisites": {
        "phone": "+79991234567"
      }
    },
    "payment": {
      "type": "sim"
    },
    "integration": {
      "externalOrderId": "payout-sim-001"
    }
  }'
```

---

### 8.4 Phone number (`phone_number`) — перевод по номеру телефона

```bash
curl --location 'https://dev1.tapbank.net/public/api/v1/shop/payout-orders' \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Bearer <SHOP_API_KEY>' \
  --data-raw '{
    "amount": 100,
    "currency": "RUB",
    "customer": {
      "id": "#phone-001",
      "requisites": {
        "phone": "+79990001122"
      }
    },
    "payment": {
      "type": "phone_number"
    },
    "integration": {
      "externalOrderId": "payout-phone-001"
    }
  }'
```

---

### 8.5 UPI (`upi`) — перевод по UPI ID

Обязательные (обычно):
- `customer.requisites.accountNumber` (UPI ID)

```bash
curl --location 'https://dev1.tapbank.net/public/api/v1/shop/payout-orders' \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Bearer <SHOP_API_KEY>' \
  --data-raw '{
    "amount": 500,
    "currency": "INR",
    "customer": {
      "id": "#upi-001",
      "requisites": {
        "accountNumber": "name@upi",
        "beneficiaryName": "Ivan Ivanov"
      }
    },
    "payment": {
      "type": "upi"
    },
    "integration": {
      "externalOrderId": "payout-upi-001"
    }
  }'
```

---

### 8.6 IMPS (`imps`) — перевод по счёту + IFSC

Обязательные (обычно):
- `customer.requisites.accountNumber`
- `customer.requisites.swiftBic` (IFSC)
- `customer.requisites.beneficiaryName`

```bash
curl --location 'https://dev1.tapbank.net/public/api/v1/shop/payout-orders' \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Bearer <SHOP_API_KEY>' \
  --data-raw '{
    "amount": 1200,
    "currency": "INR",
    "customer": {
      "id": "#imps-001",
      "requisites": {
        "accountNumber": "1234567890",
        "swiftBic": "HDFC0000001",
        "beneficiaryName": "IVAN IVANOV"
      }
    },
    "payment": {
      "type": "imps"
    },
    "integration": {
      "externalOrderId": "payout-imps-001"
    }
  }'
```

---

### 8.7 Bank transfer (`account_number`) — перевод на банковский счёт

Обязательные (обычно):
- `customer.requisites.accountNumber`
- дополнительные поля зависят от метода/страны (bic/taxId/beneficiaryName)

```bash
curl --location 'https://dev1.tapbank.net/public/api/v1/shop/payout-orders' \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Bearer <SHOP_API_KEY>' \
  --data-raw '{
    "amount": 1500,
    "currency": "RUB",
    "customer": {
      "id": "#acc-001",
      "requisites": {
        "accountNumber": "40817810099910004312",
        "bic": "044525225",
        "taxId": "7707083893",
        "beneficiaryName": "Иванов Иван"
      }
    },
    "payment": {
      "type": "account_number"
    },
    "integration": {
      "externalOrderId": "payout-acc-001"
    }
  }'
```

---

### 8.8 IBAN (`account_number_iban`) — перевод на IBAN

```bash
curl --location 'https://dev1.tapbank.net/public/api/v1/shop/payout-orders' \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Bearer <SHOP_API_KEY>' \
  --data-raw '{
    "amount": 100,
    "currency": "EUR",
    "customer": {
      "id": "#iban-001",
      "requisites": {
        "accountNumber": "DE89370400440532013000",
        "beneficiaryName": "IVAN IVANOV"
      }
    },
    "payment": {
      "type": "account_number_iban"
    },
    "integration": {
      "externalOrderId": "payout-iban-001"
    }
  }'
```

---

### 8.9 Международные варианты: `tsbp` и `tcard2card`

> Эти типы могут быть доступны в зависимости от настроек магазина.  
> Обязательные поля уточняйте через `/shop/trade-methods/payout`.

**TSBP:**
```bash
curl --location 'https://dev1.tapbank.net/public/api/v1/shop/payout-orders' \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Bearer <SHOP_API_KEY>' \
  --data-raw '{
    "amount": 55,
    "currency": "RUB",
    "customer": {
      "id": "#tsbp-001",
      "requisites": {
        "phone": "+791270271111"
      }
    },
    "payment": {
      "type": "tsbp",
      "bank": "vtb"
    },
    "integration": {
      "externalOrderId": "payout-tsbp-001"
    }
  }'
```

**TCARD2CARD:**
```bash
curl --location 'https://dev1.tapbank.net/public/api/v1/shop/payout-orders' \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Bearer <SHOP_API_KEY>' \
  --data-raw '{
    "amount": 2500,
    "currency": "RUB",
    "customer": {
      "id": "#tc2c-001",
      "requisites": {
        "cardInfo": "4111111111111111",
        "cardholder": "IVAN IVANOV",
        "expirationDate": "12/28"
      }
    },
    "payment": {
      "type": "tcard2card"
    },
    "integration": {
      "externalOrderId": "payout-tc2c-001"
    }
  }'
```

---

### 8.10 NSPK (`nspk`) — если доступно в PAYOUT

В PAYOUT-схеме реквизитов нет полей вида `qrManagerApiKey/qrManagerLogin` (они встречаются в PAYIN).  
Если `nspk` действительно доступен в PAYOUT для вашего магазина, ориентируйтесь на **GET `/shop/trade-methods/payout`** и заполняйте только те поля, которые вернулись в `fields[].name`.

Шаблон (структурно валиден, но поля нужно уточнить по trade method):
```bash
curl --location 'https://dev1.tapbank.net/public/api/v1/shop/payout-orders' \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Bearer <SHOP_API_KEY>' \
  --data-raw '{
    "amount": 55,
    "currency": "RUB",
    "customer": {
      "id": "#nspk-001",
      "requisites": {}
    },
    "payment": {
      "type": "nspk"
    },
    "integration": {
      "externalOrderId": "payout-nspk-001"
    }
  }'
```

---

## 9) Получение/отмена ордера (PAYOUT)

### 9.1 Получить ордер по id
**GET** `/shop/payout-orders/<built-in function id>`
```bash
curl --location 'https://dev1.tapbank.net/public/api/v1/shop/payout-orders/<ORDER_ID>' \
  --header 'Authorization: Bearer <SHOP_API_KEY>'
```

### 9.2 Получить ордер по externalOrderId
**GET** `/shop/payout-orders/external/<built-in function id>`
```bash
curl --location 'https://dev1.tapbank.net/public/api/v1/shop/payout-orders/external/<EXTERNAL_ORDER_ID>' \
  --header 'Authorization: Bearer <SHOP_API_KEY>'
```

### 9.3 Отменить ордер
**POST** `/shop/payout-orders/<built-in function id>/cancel`
```bash
curl --location --request POST 'https://dev1.tapbank.net/public/api/v1/shop/payout-orders/<ORDER_ID>/cancel' \
  --header 'Authorization: Bearer <SHOP_API_KEY>'
```

---

## 10) Ошибки: формат и что делать

### 10.1 Бизнес-ошибка (workflow error) — пример
```json
{
  "error": "Bad Request",
  "errorCode": "S10000",
  "errorMessage": "Shop is inactive",
  "statusCode": 400
}
```

Что делать:
- смотреть `errorCode`,
- сопоставить с таблицей ниже,
- исправить параметры/условия или эскалировать в поддержку.

### 10.2 Ошибка валидации (validation error) — пример
```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": {
    "property": "amount",
    "constraints": {
      "isPositive": "amount must be a positive number"
    }
  }
}
```

Что делать:
- исправить структуру/значения запроса,
- свериться с обязательными полями из `/shop/trade-methods/payout`.

### 10.3 Коды ошибок и рекомендации
- **S10000** — Магазин неактивен
- **S10001** — Недостаточно средств на балансе магазина
- **S10002** — Превышен таймаут ответа согласно настройкам магазина
- **O10000** — Заказ в неподходящем статусе для выполнения действия
- **O10001** — Не выбран банк или тип оплаты для запуска процесса
- **O10002** — Слишком много активных заказов у одного клиента (лимиты уточните у поддержки)
- **O10003** — Заказ не найден
- **O10004** — Некорректная сумма заказа (проверьте лимиты в настройках магазина)
- **O10005** — Сейчас нет доступных реквизитов для выбранного типа оплаты и банка
- **O10006** — Заказ с таким externalOrderId уже существует
- **O10007** — Найдено больше одного заказа с одинаковым externalOrderId (обратитесь в поддержку)
- **O10008** — Клиент заблокирован антифрод-системой (попробуйте позже)
- **O10009** — Клиент не в whitelist
- **O10010** — Сумма заказа запрещена антифрод-системой
- **C10000** — Не удалось получить курс обмена валют
- **C10001** — Валюта не найдена
- **B10000** — Банк не найден
- **P10000** — Тип оплаты не найден
- **T10000** — Торговый метод не найден

---

## 11) Работа с магазином: что можно делать по API (шаблон)

Ниже — основной список shop-запросов, которые чаще всего нужны мерчанту:

### PAYIN (депозиты / приём платежей)
- **POST** `/shop/orders` — создать payin-ордер
- **POST** `/shop/orders/sync-requisites` — получить/синхронизировать реквизиты для payin
- **GET** `/shop/orders/<built-in function id>` — получить ордер
- **POST** `/shop/orders/<built-in function id>/cancel` — отменить
- **POST** `/shop/orders/<built-in function id>/start-payment` — начать оплату (если используется)
- **POST** `/shop/orders/<built-in function id>/confirm-payment` — подтвердить оплату (если используется)
- **/receipts, /dispute** — работа с чеками/спорами (если включено в процессе)

### PAYOUT (выплаты)
- **GET** `/shop/trade-methods/payout` — доступные методы выплат
- **POST** `/shop/payout-orders` — создать payout-ордер
- **GET** `/shop/payout-orders/<built-in function id>` — получить payout-ордер
- **GET** `/shop/payout-orders/external/<built-in function id>` — получить по externalOrderId
- **POST** `/shop/payout-orders/<built-in function id>/cancel` — отменить payout

### Балансы/активы магазина
- **GET** `/shop/assets` — активы и балансы магазина
- **POST** `/shop/assets/withdrawals` — создать заявку на вывод (withdrawal) со счета магазина
- **GET** `/shop/assets/withdrawals/<built-in function id>` — получить заявку на вывод по id

### Справочники
- **GET** `/banks`
- **GET** `/payment-types`
- **GET** `/currencies/fiat`
- **GET** `/currencies/asset`
- **GET** `/trade-methods`

---

## 12) Доп функции (каркас для будущих страниц)

Этот раздел — **заготовка**, сюда можно добавлять:
- антифрод (лимиты, причины блокировок, ретраи),
- рандомизацию/распределение (если применяется в вашей схеме),
- SLA по статусам и спорам,
- требования к данным (email/telegram), правила нормализации телефона и т.п.

---

## 13) Чек‑лист интеграции (коротко)

- [ ] Перед созданием payout вы получаете `/shop/trade-methods/payout` и используете **актуальные required поля**
- [ ] Валидируете сумму/валюту до отправки
- [ ] Используете уникальный `integration.externalOrderId`
- [ ] Принимаете callback, проверяете `signature`, логируете входящие события
- [ ] Умеете читать ордер по `id` и по `externalOrderId`
- [ ] Корректно закрываете финальные статусы (`completed`/`cancelled`) и обрабатываете `error`

