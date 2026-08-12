---
title: "PayIn API: действия над ордером"
---

Статус нельзя изменить напрямую. Каждый endpoint ниже выполняет допустимый
переход и возвращает обновлённый ордер.

| Метод | Когда вызывать | На что влияет |
| --- | --- | --- |
| [`PATCH /shop/orders/{id}`](#patch-shopordersid) | Зависит от изменяемого поля | Сохраняет выбор метода или данные плательщика; статус не меняет |
| [`POST /shop/orders/{id}/start-payment`](#post-shopordersidstart-payment) | Только `new`, после выбора `payment.type` | Переводит ордер в `requisites` и запускает поиск реквизитов |
| [`POST /shop/orders/{id}/confirm-payment`](#post-shopordersidconfirm-payment) | Только `customer_confirm`, после фактического перевода | Переводит в `trader_confirm`; исполнитель начинает проверку платежа |
| [`POST /shop/orders/{id}/cancel`](#post-shopordersidcancel) | `new`, `requisites`, `customer_confirm`, `waiting_confirmation` | Переводит в `cancelled`, отменяет связанный provider-ордер и создаёт callback |

## PATCH `/shop/orders/{id}`

В `new` выбирает способ оплаты; в `customer_confirm` сохраняет данные плательщика.
Запрос не меняет статус. Пустое тело не допускается; при смешивании полей каждое
поле должно быть разрешено в текущем статусе.

| Поле | Когда и что передавать |
| --- | --- |
| `payment.type` | В `new`: согласованный `paymentType` или код из [списка методов](/doc/api/shop/04-dictionaries/#получение-методов); [назначение кодов](/doc/api/shop/05-payment-types/) |
| `payment.bank` | В `new`: согласованный `bank` или код из [списка методов и банков](/doc/api/shop/04-dictionaries/#получение-методов), не `bankName` |
| `payment.customerBank` | В `new` или `customer_confirm`: код банка плательщика |
| `payment.customerCardFirstDigits` | В `customer_confirm`: первые 6 цифр карты |
| `payment.customerCardLastDigits` | В `customer_confirm`: последние 4 цифры карты |
| `payment.customerPhoneLastDigits` | В `customer_confirm`: последние 4 цифры телефона |
| `payment.customerUtr` | В `customer_confirm`: 12 цифр UTR |
| `payment.customerName` | В `customer_confirm`: имя плательщика |
| `payment.customerIBAN` | В `customer_confirm`: IBAN плательщика |
| `payment.customerAccountNumber` | В `customer_confirm`: номер счёта |
| `customerConfirmStatusDetails` | В `customer_confirm`: `customer_payed` |

Передавайте только поля из `customerFields` выбранного trade method.

```bash
curl --request PATCH "$BASE_URL/shop/orders/$ORDER_ID" \
  --header "Authorization: Bearer $SHOP_TOKEN" \
  --header "Content-Type: application/json" \
  --data '{
    "payment": { "type": "sbp", "bank": "sberbank" }
  }'
```

## POST `/shop/orders/{id}/start-payment`

Вызывайте только для ордера в `new`, когда [`payment.type`](/doc/api/shop/05-payment-types/)
уже выбран по согласованному маппингу или
[списку методов и банков](/doc/api/shop/04-dictionaries/#получение-методов). Метод
переводит ордер в `requisites` и запускает поиск реквизитов. Если способ оплаты
не выбран, API вернёт `O10001`.

```bash
curl --request POST "$BASE_URL/shop/orders/$ORDER_ID/start-payment" \
  --header "Authorization: Bearer $SHOP_TOKEN"
```

Можно передать тело формата `PATCH`, чтобы выбрать метод непосредственно перед
стартом.

## POST `/shop/orders/{id}/confirm-payment`

Сообщает, что клиент выполнил перевод. Разрешён только в `customer_confirm`.
Данные плательщика добавляйте, только если их требует `customerFields`.
Не вызывайте метод при одном лишь открытии страницы или нажатии кнопки без
фактического перевода.

```bash
curl --request POST "$BASE_URL/shop/orders/$ORDER_ID/confirm-payment" \
  --header "Authorization: Bearer $SHOP_TOKEN" \
  --header "Content-Type: application/json" \
  --data '{
    "payment": {
      "customerCardLastDigits": "1234",
      "customerBank": "tbank"
    }
  }'
```

Обычно новый статус — `trader_confirm`. Это ещё не успешный финал: дождитесь
`completed` через callback. Вызов сообщает исполнителю, что платёж нужно проверить;
сам по себе он не подтверждает зачисление.

## POST `/shop/orders/{id}/cancel`

Разрешён в `new`, `requisites`, `customer_confirm` и `waiting_confirmation`.

```bash
curl --request POST "$BASE_URL/shop/orders/$ORDER_ID/cancel" \
  --header "Authorization: Bearer $SHOP_TOKEN"
```

Успешный ответ содержит `status: cancelled` и `statusDetails: shop`. Из другого
статуса API вернёт `O10000`. Отмена создаёт callback и отправляет отмену связанному
провайдеру. После `trader_confirm`, `completed`, `cancelled`, `dispute` или `error`
этот метод недоступен.
