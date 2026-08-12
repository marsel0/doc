---
title: "PayIn API"
description: "Методы и модель PayIn-ордера"
---

Все запросы используют `Shop API key`:

```http
Authorization: Bearer <SHOP_API_KEY>
```

## Методы

| Задача | Endpoint | Описание |
| --- | --- | --- |
| Получить методы оплаты | [`GET /shop/trade-methods`](/doc/api/shop/04-dictionaries/#получение-методов) | Допустимые `type`, `bank` и поля |
| Создать ордер | [`POST /shop/orders`](/doc/api/payin/02-orders/#post-shoporders) | Redirect или H2H по шагам |
| Создать ордер с реквизитами | [`POST /shop/orders/sync-requisites`](/doc/api/payin/02-orders/#post-shoporderssync-requisites) | H2H с синхронным поиском реквизитов |
| Получить список | [`GET /shop/orders`](/doc/api/payin/02-orders/#get-shoporders) | Фильтр по датам и статусу |
| Прочитать ордер | [`GET /shop/orders/{id}`](/doc/api/payin/03-read/#по-внутреннему-id) | По внутреннему UUID |
| Найти ордер магазина | [`GET /shop/orders/external/{externalOrderId}`](/doc/api/payin/03-read/#по-externalorderid) | По ID магазина |
| Изменить данные | [`PATCH /shop/orders/{id}`](/doc/api/payin/04-actions/#patch-shopordersid) | Выбор метода или данные плательщика |
| Начать оплату | [`POST /shop/orders/{id}/start-payment`](/doc/api/payin/04-actions/#post-shopordersidstart-payment) | Запустить поиск реквизитов |
| Подтвердить перевод | [`POST /shop/orders/{id}/confirm-payment`](/doc/api/payin/04-actions/#post-shopordersidconfirm-payment) | Клиент сообщил об оплате |
| Отменить | [`POST /shop/orders/{id}/cancel`](/doc/api/payin/04-actions/#post-shopordersidcancel) | Только из разрешённого статуса |
| Прикрепить чек | [`POST /shop/orders/{id}/receipts`](/doc/api/payin/05-receipts-and-fields/#загрузить-чек) | Один файл до 3 MB; в `cancelled` откроет диспут |
| Открыть диспут | [`POST /shop/orders/{id}/dispute`](/doc/api/payin/06-disputes/#открыть-диспут) | Только для отменённого платежа с ранее назначенными реквизитами |

Подробные запросы: [создание](/doc/api/payin/02-orders/),
[чтение](/doc/api/payin/03-read/), [действия](/doc/api/payin/04-actions/),
[чеки](/doc/api/payin/05-receipts-and-fields/),
[диспуты](/doc/api/payin/06-disputes/).

## Основные поля ответа

| Поле | Значение |
| --- | --- |
| `id` | Внутренний UUID ордера платформы |
| `initialAmount` | Сумма, запрошенная магазином |
| `amount` | Фактическая сумма после возможной рандомизации; показывайте её клиенту |
| `currency` | Fiat-валюта |
| `status` | Текущий статус |
| `statusDetails` | Причина или уточнение статуса |
| `statusTimeoutAt` | Время автоматического перехода/отмены |
| `requisites` | Реквизиты получателя; состав зависит от trade method |
| `payment` | Выбранный метод и данные плательщика |
| `customer` | Данные клиента, переданные магазином |
| `integration.externalOrderId` | ID операции в системе магазина |
| `integration.link` | Ссылка для redirect-сценария |
| `integration.callbackUrlStatus` | Результат доставки callback |
| `shopAmount` | Сумма зачисления магазину в asset-валюте |
| `shopFee` | Комиссия в asset-валюте |
| `currencyRate` | Применённый курс |

## Статусы

| Статус | Значение |
| --- | --- |
| `new` | Ордер создан |
| `requisites` | Идёт поиск реквизитов |
| `customer_confirm` | Реквизиты выданы, ожидается перевод клиента |
| `waiting_confirmation` | Ожидается 3DS/OTP в e-commerce flow |
| `trader_confirm` | Перевод заявлен, ожидается подтверждение |
| `hold_completed` | Средства удержаны, но платёж ещё не завершён |
| `completed` | Платёж успешно завершён |
| `cancelled` | Ордер закрыт без успеха |
| `dispute` | Требуется ручной разбор |
| `error` | Техническая ошибка |

Успешный финал — только `completed`. Полный разбор причин:
[статусы PayIn](/doc/v2/payin-statuses/).

## Получение статуса

Основной канал — подписанный callback. [`GET /shop/orders/{id}`](/doc/api/payin/03-read/#по-внутреннему-id) нужен для сверки и восстановления
после таймаута. Callback может повторяться, поэтому обработчик должен быть
идемпотентным. Алгоритм подписи: [Callback и signature](/doc/v2/callback-signature/).

## Частые ошибки

| Код | Действие |
| --- | --- |
| `S10002` | Найти ордер по `externalOrderId`, не повторять create вслепую |
| `O10000` | Прочитать ордер: действие не подходит текущему статусу |
| `O10001` | Перед `start-payment` выбрать [`payment.type`](/doc/api/shop/05-payment-types/) из [актуального списка методов](/doc/api/shop/04-dictionaries/#получение-методов) |
| `O10005` | Предложить другой метод или банк |
| `O10006` | Дочитать существующий ордер с тем же `externalOrderId` |

Полный список: [ошибки API](/doc/docs/02-api_error_guide/).
