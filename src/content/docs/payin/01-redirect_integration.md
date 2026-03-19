---
title: "Интеграции PAYIN"
description: "Подробные сценарии PAYIN: redirect, H2H и Customer API"
---

Эта страница описывает рабочие сценарии `payin` в `simple-pay`: когда использовать redirect, когда выбирать H2H и в каких случаях подключать `Customer API`.

Для готовых `curl`-примеров и типовых ответов используйте страницу [PAYIN: способы и API-примеры](/doc/payin/02-integration/).

## 1. Какие варианты интеграции есть

### Redirect

Клиент создаёт ордер на вашей стороне, после чего вы переводите его на `integration.link`.

Подходит, если:

- платёжная форма может быть размещена у `simple-pay`;
- вам не нужно рендерить реквизиты самостоятельно;
- нужен минимальный time-to-market.

### H2H с немедленной выдачей реквизитов

Клиент остаётся на вашем интерфейсе, а реквизиты возвращаются сразу в ответе `POST /shop/orders/sync-requisites`.

Подходит, если:

- вы хотите полностью контролировать UI;
- `payment.type` известен до создания ордера;
- реквизиты нужно показать сразу после создания.

Это основной H2H-сценарий для `payin`.

### H2H с ручным управлением шагами

Ордер создаётся заранее, а выбор метода оплаты и запуск поиска реквизитов происходят позже.

Используется, если:

- вы хотите сначала создать ордер, а потом дать клиенту выбрать банк и метод;
- для одного ордера возможны разные способы оплаты;
- нужен пошаговый UX с отдельными экранами выбора и подтверждения.

### Customer API

Customer API не создаёт ордеры, но позволяет безопасно отдавать клиенту часть дальнейших действий.

Он нужен, если frontend должен сам:

- читать состояние ордера;
- обновлять payment-данные;
- запускать `start-payment` или `confirm-payment`;
- отменять ордер.

## 2. Сценарий Redirect PAYIN

### Шаг 1. Создать ордер

Вызовите `POST /shop/orders`.

В ответе вы получите:

- `id` ордера;
- `integration.link` для перехода на платёжную страницу;
- `integration.token`, который можно использовать в `Customer API`;
- `amount` и `initialAmount`.

### Шаг 2. Перенаправить клиента

Откройте в браузере клиента `integration.link`.

Если у ордера настроены `returnUrl`, `successUrl`, `failUrl`, платформа будет использовать их для возврата после завершения пользовательского сценария.

### Шаг 3. Получить итоговый статус

Основной способ:

1. принять callback на `integration.callbackUrl`;
2. проверить `signature`;
3. обновить статус платежа в своей системе.

Резервный способ:

- `GET /shop/orders/{id}`
- `GET /shop/orders/external/{externalOrderId}`

### Шаг 4. Обработать финал

Финальными для мерчанта считаются:

- `completed` , платёж успешен;
- `cancelled` , платёж отменён;
- `dispute` , нужен разбор;
- `error` , технический кейс, нужен повторный контроль статуса и поддержка.

## 3. Сценарий H2H PAYIN через `sync-requisites`

### Шаг 1. Получить доступные методы

Сначала вызовите `GET /shop/trade-methods`.

По ответу определите:

- доступный `paymentType`;
- нужен ли конкретный `bank`;
- какие поля система вернёт в `requisites`;
- какие данные клиента желательно собрать заранее.

### Шаг 2. Создать ордер с конкретным методом

Вызовите `POST /shop/orders/sync-requisites`, передав:

- сумму и валюту;
- `customer.id`;
- `payment.type`;
- при необходимости `payment.bank`;
- `integration.externalOrderId`;
- `integration.callbackUrl`.

Если реквизиты найдены, ордер обычно возвращается уже в статусе `customer_confirm`.

Если реквизиты не найдены, API вернёт `404` с `errorCode = O10005` и снимком созданного ордера.

### Шаг 3. Показать реквизиты клиенту

Типовой набор полей в `requisites`:

- `phone`
- `cardInfo`
- `bank`
- `bankName`
- `cardholder`
- `paymentLink`
- `rawQrCodeData`
- `qrImageUrl`

Набор зависит от конкретного trade method.

### Шаг 4. Подтвердить факт оплаты

Когда клиент завершил перевод, вызовите `POST /shop/orders/{id}/confirm-payment`.

Если нужно, вместе с подтверждением можно передать дополнительные payment-данные:

- `customerCardLastDigits`
- `customerPhoneLastDigits`
- `customerBank`
- `customerName`
- `customerUtr`
- `customerIBAN`
- `customerAccountNumber`

После этого ордер обычно переходит в `trader_confirm`.

### Шаг 5. Дождаться финала

Дальше ориентируйтесь на callback или на чтение ордера по `GET`.

## 4. Сценарий H2H PAYIN по шагам

Этот флоу нужен, когда конкретный способ оплаты выбирается не в момент создания ордера.

### Шаг 1. Создать базовый ордер

Создайте ордер через `POST /shop/orders`.

Ордер вернётся в статусе `new`.

### Шаг 2. Записать выбранный метод оплаты

Когда клиент выбрал метод и банк, вызовите:

- `PATCH /shop/orders/{id}`

Обычно здесь передают:

- `payment.type`
- `payment.bank`

### Шаг 3. Запустить поиск реквизитов

Вызовите:

- `POST /shop/orders/{id}/start-payment`

После этого статус меняется с `new` на `requisites`, а затем, когда реквизиты найдены, на `customer_confirm`.

### Шаг 4. Собрать подтверждающие данные клиента

Если сценарий требует доп. данные о переводе клиента, обновите ордер через `PATCH /shop/orders/{id}` уже в статусе `customer_confirm`.

Примеры полей:

- `payment.customerCardFirstDigits`
- `payment.customerCardLastDigits`
- `payment.customerPhoneLastDigits`
- `payment.customerName`
- `payment.customerBank`

### Шаг 5. Подтвердить оплату

Вызовите `POST /shop/orders/{id}/confirm-payment`.

### Шаг 6. Отследить результат

Ожидайте `completed`, `cancelled` или `dispute`.

## 5. Когда нужен `Customer API`

`Customer API` полезен, если вы не хотите проксировать с backend каждый шаг после создания ордера.

### Как авторизоваться

1. получить `orderId` и `integration.token` из ответа `POST /shop/orders`;
2. вызвать `POST /customer/auth/login`;
3. получить `accessToken`.

Тонкости:

- `accessToken` живёт `30` минут;
- к завершённому ордеру доступ остаётся ещё `24` часа после финального статуса;
- `Customer API` не умеет создавать ордер.

### Что можно делать через Customer API

- `GET /customer/orders/{id}`
- `PATCH /customer/orders/{id}`
- `POST /customer/orders/{id}/start-payment`
- `POST /customer/orders/{id}/start-payment-sync`
- `POST /customer/orders/{id}/confirm-payment`
- `POST /customer/orders/{id}/cancel`

`start-payment-sync` полезен для фронтовых сценариев, где реквизиты нужно получить синхронно уже после логина клиента в ордер.

## 6. Статусы PAYIN

| Статус | Что означает |
| --- | --- |
| `new` | ордер создан, но платёжный метод ещё не запущен |
| `requisites` | идёт поиск реквизитов |
| `customer_confirm` | реквизиты найдены, ждём оплату клиента |
| `trader_confirm` | клиент подтвердил оплату, ждём подтверждение со стороны системы/трейдера |
| `completed` | платёж успешно завершён |
| `cancelled` | ордер отменён |
| `dispute` | спорный кейс, нужен разбор |
| `error` | техническая ошибка, нужен контроль через `GET` и поддержка |

### Частые `statusDetails`

- `shop` , ордер отменил магазин;
- `customer` , ордер отменил клиент;
- `new_timeout` , клиент не продолжил сценарий;
- `requisites_timeout` , реквизиты не были найдены;
- `sync_requisites_attempts` , исчерпаны попытки синхронного поиска;
- `customer_confirm_timeout` , клиент не успел подтвердить оплату;
- `no_payment` , диспут из-за отсутствия платежа;
- `different_amount` , диспут из-за другой суммы.

## 7. Практические рекомендации

- Для любого create-запроса передавайте уникальный `integration.externalOrderId`.
- После `S10002` не создавайте новый ордер вслепую, сначала ищите старый по `externalOrderId`.
- В H2H показывайте клиенту именно `amount`, а не только `initialAmount`.
- Не хардкодьте поля реквизитов: ориентируйтесь на `GET /shop/trade-methods`.
- Callback-обработчик делайте идемпотентным.

## 8. Что смотреть дальше

- [PAYIN: способы и API-примеры](/doc/payin/02-integration/)
- [PAYIN API: создание и список ордеров](/doc/api/payin/02-orders/)
- [PAYIN API: действия над ордером](/doc/api/payin/04-actions/)
- [PAYIN API: payment fields и receipts](/doc/api/payin/05-receipts-and-fields/)
- [PAYIN API: dispute](/doc/api/payin/06-disputes/)
- [Ошибки и коды ответов](/doc/docs/02-api_error_guide/)
