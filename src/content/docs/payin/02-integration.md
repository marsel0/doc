---
title: Интеграция PAYIN
description: Создание payin-ордера, получение реквизитов и обработка статусов
---

PAYIN — это приём платежа: вы создаёте ордер, получаете реквизиты (телефон/карта/ссылка/QR) и ждёте статус `completed` через webhook или опрос.

## Переменные для примеров

```bash
export BASE_URL="https://interpayment.cx/public/api/v1"
export TOKEN="<SHOP_API_TOKEN>"
```

Требуемые заголовки:
- `Authorization: Bearer <SHOP_API_TOKEN>`
- `Content-Type: application/json`

Рекомендуемые заголовки:
- `Idempotency-Key: <uuid>` (для безопасных повторов create)
- `X-Request-Id: <uuid>` (для трассировки)

## Шаг 1. Получить доступные способы оплаты (trade methods)

Endpoint: `GET /shop/trade-methods`

```bash
curl --location "$BASE_URL/shop/trade-methods"   --header "Authorization: Bearer $TOKEN"
```

Как использовать ответ:
- берёте `paymentType` и (если требуется) `bank`
- смотрите `fields` — какие поля придут в `requisites`
- смотрите `customerFields` — какие поля можно/нужно передать в `customer`

> Источник истины по обязательным полям: `/shop/trade-methods`.

## Шаг 2. Создать PAYIN-ордер

## sim — SIM card top up

**payment.type:** `sim`  
**requisitesType:** `phone_number`  
**Заполненные requisites:** `phone` (required), `cardholder` (optional), `paymentLink` (optional)

```bash
curl --location "$BASE_URL/shop/orders/sync-requisites" \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer $TOKEN" \
  --data-raw '{
    "amount": 55,
    "currency": "RUB",
    "customer": {
      "id": "#1234345410",
      "phone": "+791270271111",
      "name": "Иванов Иван",
      "email": "ivan@test-client.com"
    },
    "payment": { "type": "sim" }
  }'
```

---

## nspk — НСПК

**payment.type:** `nspk`  
**requisitesType:** `nspk`  
**Заполненные requisites:** `qrManagerApiKey` (required), `qrManagerLogin` (optional)

```bash
curl --location "$BASE_URL/shop/orders/sync-requisites" \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer $TOKEN" \
  --data-raw '{
    "amount": 55,
    "currency": "RUB",
    "customer": {
      "id": "#1234345410",
      "phone": "+791270271111",
      "name": "Иванов Иван",
      "email": "ivan@test-client.com"
    },
    "payment": { "type": "nspk" }
  }'
```

---

## tcard2card — С карты на карту (в другую страну)

**payment.type:** `tcard2card`  
**requisitesType:** `card`  
**Заполненные requisites:** `cardInfo` (required), `cardholder` (optional), `expirationDate` (optional)

```bash
curl --location "$BASE_URL/shop/orders/sync-requisites" \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer $TOKEN" \
  --data-raw '{
    "amount": 55,
    "currency": "RUB",
    "customer": {
      "id": "#1234345410",
      "phone": "+791270271111",
      "name": "Иванов Иван",
      "email": "ivan@test-client.com"
    },
    "payment": { "type": "tcard2card" }
  }'
```

---

## tsbp — СБП (в другую страну)

**payment.type:** `tsbp`  
**requisitesType:** `card-by-phone`  
**Заполненные requisites:** `phone` (required), `cardholder` (optional), `accountLastDigits` (required)

```bash
curl --location "$BASE_URL/shop/orders/sync-requisites" \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer $TOKEN" \
  --data-raw '{
    "amount": 55,
    "currency": "RUB",
    "customer": {
      "id": "#1234345410",
      "phone": "+791270271111",
      "name": "Иванов Иван",
      "email": "ivan@test-client.com"
    },
    "payment": { "type": "tsbp" }
  }'
```

---

## account_number_iban — Bank transfer (IBAN)

**payment.type:** `account_number_iban`  
**requisitesType:** `account_number_iban`  
**Заполненные requisites:** `accountNumber` (required), `cardholder` (optional)

```bash
curl --location "$BASE_URL/shop/orders/sync-requisites" \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer $TOKEN" \
  --data-raw '{
    "amount": 55,
    "currency": "RUB",
    "customer": {
      "id": "#1234345410",
      "phone": "+791270271111",
      "name": "Иванов Иван",
      "email": "ivan@test-client.com"
    },
    "payment": { "type": "account_number_iban" }
  }'
```

---

## imps — Transfer via IMPS

**payment.type:** `imps`  
**requisitesType:** `imps`  
**Заполненные requisites:** `accountNumber` (required), `swiftBic`/`ifsc` (required), `cardholder` (required, beneficiary name)

```bash
curl --location "$BASE_URL/shop/orders/sync-requisites" \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer $TOKEN" \
  --data-raw '{
    "amount": 55,
    "currency": "RUB",
    "customer": {
      "id": "#1234345410",
      "phone": "+791270271111",
      "name": "Иванов Иван",
      "email": "ivan@test-client.com"
    },
    "payment": { "type": "imps" }
  }'
```

---

## phone_number — Transfer by phone number

**payment.type:** `phone_number`  
**requisitesType:** `phone_number`  
**Заполненные requisites:** `phone` (required), `cardholder` (optional), `paymentLink` (optional)

```bash
curl --location "$BASE_URL/shop/orders/sync-requisites" \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer $TOKEN" \
  --data-raw '{
    "amount": 55,
    "currency": "RUB",
    "customer": {
      "id": "#1234345410",
      "phone": "+791270271111",
      "name": "Иванов Иван",
      "email": "ivan@test-client.com"
    },
    "payment": { "type": "phone_number" }
  }'
```

---

## upi — Transfer via UPI

**payment.type:** `upi`  
**requisitesType:** `upi`  
**Заполненные requisites:** `accountNumber` (required, UPI ID), `cardholder` (optional), `paymentLink` (optional)

```bash
curl --location "$BASE_URL/shop/orders/sync-requisites" \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer $TOKEN" \
  --data-raw '{
    "amount": 55,
    "currency": "RUB",
    "customer": {
      "id": "#1234345410",
      "phone": "+791270271111",
      "name": "Иванов Иван",
      "email": "ivan@test-client.com"
    },
    "payment": { "type": "upi" }
  }'
```

---

## phone_pe — Transfer via PhonePe

**payment.type:** `phone_pe`  
**requisitesType:** `phone_pe`  
**Заполненные requisites:** `phone` (required), `accountNumber` (required, UPI ID)

```bash
curl --location "$BASE_URL/shop/orders/sync-requisites" \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer $TOKEN" \
  --data-raw '{
    "amount": 55,
    "currency": "RUB",
    "customer": {
      "id": "#1234345410",
      "phone": "+791270271111",
      "name": "Иванов Иван",
      "email": "ivan@test-client.com"
    },
    "payment": { "type": "phone_pe" }
  }'
```

---

## account_number — Bank transfer

**payment.type:** `account_number`  
**requisitesType:** `account_number`  
**Заполненные requisites:** `accountNumber` (required), `cardholder` (optional), `bic` (optional), `accountLastDigits` (optional), `taxId` (optional)

```bash
curl --location "$BASE_URL/shop/orders/sync-requisites" \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer $TOKEN" \
  --data-raw '{
    "amount": 55,
    "currency": "RUB",
    "customer": {
      "id": "#1234345410",
      "phone": "+791270271111",
      "name": "Иванов Иван",
      "email": "ivan@test-client.com"
    },
    "payment": { "type": "account_number" }
  }'
```

---

## sbp — СБП

**payment.type:** `sbp`  
**requisitesType:** `card-by-phone`  
**Заполненные requisites:** `phone` (required), `cardholder` (optional), `accountLastDigits` (required), `paymentLink` (optional)

### SBP без банка
```bash
curl --location "$BASE_URL/shop/orders/sync-requisites" \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer $TOKEN" \
  --data-raw '{
    "amount": 55,
    "currency": "RUB",
    "customer": {
      "id": "#1234345410",
      "phone": "+791270271111",
      "name": "Иванов Иван",
      "email": "ivan@test-client.com"
    },
    "payment": { "type": "sbp" }
  }'
```

### SBP + bank
```bash
curl --location "$BASE_URL/shop/orders/sync-requisites" \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer $TOKEN" \
  --data-raw '{
    "amount": 55,
    "currency": "RUB",
    "customer": {
      "id": "#1234345410",
      "phone": "+791270271111",
      "name": "Иванов Иван",
      "email": "ivan@test-client.com"
    },
    "payment": { "type": "sbp", "bank": "vtb" }
  }'
```

---

## card2card — С карты на карту

**payment.type:** `card2card`  
**requisitesType:** `card`  
**Заполненные requisites:** `cardInfo` (required), `cardholder` (optional), `expirationDate` (optional)

### Card2Card без банка
```bash
curl --location "$BASE_URL/shop/orders/sync-requisites" \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer $TOKEN" \
  --data-raw '{
    "amount": 55,
    "currency": "RUB",
    "customer": {
      "id": "#1234345410",
      "phone": "+791270271111",
      "name": "Иванов Иван",
      "email": "ivan@test-client.com"
    },
    "payment": { "type": "card2card" }
  }'
```

### Card2Card + bank
```bash
curl --location "$BASE_URL/shop/orders/sync-requisites" \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer $TOKEN" \
  --data-raw '{
    "amount": 55,
    "currency": "RUB",
    "customer": {
      "id": "#1234345410",
      "phone": "+791270271111",
      "name": "Иванов Иван",
      "email": "ivan@test-client.com"
    },
    "payment": { "type": "card2card", "bank": "vtb" }
  }'
```

## Шаг 3. Получить реквизиты

### Вариант A: Webhook
Когда реквизиты найдены/назначены, система отправит webhook на ваш `callbackUrl`.

Пример события: `payin.requisites_assigned`  
Пример payload:

```json
{
  "event": "payin.requisites_assigned",
  "id": "a0c61eaf-caee-4d4a-811d-8ffc74e9322f",
  "status": "requisites_assigned",
  "requisites": {
    "phone": "+79991234567",
    "cardholder": "IVAN IVANOV",
    "accountLastDigits": "1234",
    "paymentLink": "https://qr.nspk.ru/..."
  },
  "updatedAt": "2026-01-09T12:01:10.000Z"
}
```

Правила обработки webhook:
- отвечать быстро `200 OK`
- поддерживать дедупликацию (webhook может прийти повторно)
- сохранять `requisites` и показывать пользователю

### Вариант B: Опрос (pull) через sync-requisites
Endpoint: `POST /shop/orders/sync-requisites`

```bash
curl --location "$BASE_URL/shop/orders/sync-requisites"   --header "Authorization: Bearer $TOKEN"   --header "Content-Type: application/json"   --data '{
    "orderId": "a0c61eaf-caee-4d4a-811d-8ffc74e9322f"
  }'
```

Пример ответа:

```json
{
  "id": "a0c61eaf-caee-4d4a-811d-8ffc74e9322f",
  "status": "requisites_assigned",
  "requisites": {
    "phone": "+79991234567",
    "cardholder": "IVAN IVANOV",
    "accountLastDigits": "1234",
    "paymentLink": "https://qr.nspk.ru/..."
  }
}
```

Рекомендация по опросу:
- 1 запрос каждые 2–3 секунды
- максимум 30–60 секунд или до `statusTimeoutAt`
- при таймауте — предлагать другой банк/метод

## Шаг 4. Показать реквизиты пользователю

Показывайте только то, что пришло в `requisites`, в удобной форме (телефон/карта/QR/ссылка).  
Набор полей зависит от выбранного `paymentType` (+ `bank`) и описан в `/shop/trade-methods`.

## Шаг 5. Получить финальный статус (Webhook)

Ожидаемые события:
- `payin.completed`
- `payin.cancelled`
- `payin.failed`

Пример `payin.completed`:

```json
{
  "event": "payin.completed",
  "id": "a0c61eaf-caee-4d4a-811d-8ffc74e9322f",
  "externalOrderId": "order_100500",
  "status": "completed",
  "amount": 1000,
  "currency": "RUB",
  "updatedAt": "2026-01-09T12:05:10.000Z"
}
```

## Шаг 6. Финализация на стороне мерчанта

- `completed` -> выдаём товар/услугу, фиксируем платеж у себя
- `cancelled` -> предлагаем повтор/альтернативный метод
- `failed` -> показываем ошибку, предлагаем альтернативу

## Статусы (шаблон)

- `new` — Используется, когда заказ только что создан.
- `requisites` — Используется, когда система ожидает подтверждения заказа от трейдера
- `trader_payment` — Используется, когда трейдер принял ордер, и система ожидает оплаты от трейдера
- `cancelled` — Используется в случае отмены заказа по любой причине
- `completed` - Используется, когда заказ успешно выполнен
- `dispute` - Используется, если заказ не был завершен и может быть завершен или отменен только путем обращения в службу поддержки 
- `requisites` - Используется, когда система ищет необходимые данные о трейдере. Обратный вызов будет отправлен, если ордер был переназначен другому трейдеру из-за спора
- `error` - Используется, когда в процессе обработки заказа произошла ошибка. Проблема может быть решена только путем обращения в службу поддержки

## Идемпотентность и повторы

- Для `POST /shop/orders` всегда используйте `Idempotency-Key`.
- Если запрос “упал” по сети/500 — повторяйте с тем же `Idempotency-Key`.
- Webhook-и могут дублироваться — дедупликация по `(id, event, updatedAt)`.

## Ошибки (коды ответов)

- 400 — неверные поля/типы → исправить запрос
- 401/403 — токен/права → проверить `Authorization`
- 404 (бизнес) — реквизиты не найдены для метода/банка → другой банк/метод
- 429/500 — временно → ретраи с backoff

## Виды ошибок

- S10000 — магазин неактивен

- S10001 — недостаточно средств на балансе магазина

- S10002 — превышен таймаут ответа согласно настройкам магазина

- O10000 — заказ в неподходящем статусе для выполнения действия

- O10001 — не выбран банк или тип оплаты для запуска процесса оплаты

- O10002 — слишком много активных заказов у одного клиента (лимиты уточнить у поддержки)

- O10003 — заказ не найден

- O10004 — некорректная сумма заказа (проверьте лимиты в настройках магазина)

- O10005 — сейчас нет доступных реквизитов для выбранного типа оплаты и банка

- O10006 — заказ с таким externalOrderId уже существует

- O10007 — найдено больше одного заказа с одинаковым externalOrderId (обратитесь в поддержку)

- O10008 — клиент заблокирован антифрод-системой (попробуйте позже)

- O10009 — клиент не в whitelist

- O10010 — сумма заказа запрещена антифрод-системой

- C10000 — не удалось получить курс обмена валют

- C10001 — валюта не найдена

- B10000 — банк не найден

- P10000 — тип оплаты не найден

- T10000 — торговый метод не найден

## Чек-лист

- [ ] Получаю `/shop/trade-methods` и выбираю `paymentType` (+ `bank`)
- [ ] Создаю ордер с `Idempotency-Key`
- [ ] Получаю `requisites` через webhook или `sync-requisites`
- [ ] Показываю реквизиты пользователю
- [ ] Принимаю `completed/cancelled/failed` и финализирую у себя
- [ ] Дедуплицирую webhook-и и поддерживаю ретраи

