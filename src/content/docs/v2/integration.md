---
title: "Интеграция"
description: "Короткий маршрут подключения merchant API"
---

## Доступ

Получите у платформы:

- `Shop API key` для ордеров, методов и чтения баланса;
- `Signature key` для проверки callback;
- `Balance API key`, только если нужен вывод средств магазина.

```bash
export BASE_URL="[[BASE_URL]]"
export SHOP_TOKEN="<SHOP_API_KEY>"
export BALANCE_TOKEN="<BALANCE_API_KEY>"
```

Ключ передаётся только с backend магазина:

```http
Authorization: Bearer <token>
```

Проверьте доступ запросом [`GET /shop/info`](/doc/api/shop/03-info/#get-shopinfo).

## Выбор сценария

| Сценарий | Когда использовать | Что реализует магазин | Инструкция |
| --- | --- | --- | --- |
| PayIn Redirect | Нужен самый короткий запуск; клиента можно перевести на внешнюю платёжную страницу | Создание ордера, redirect, callback и проверку статуса. Выбор метода и показ реквизитов выполняет платёжная страница | [Redirect](/doc/v2/red/) |
| PayIn H2H sync | Метод известен до создания; реквизиты или прямая ссылка нужны в том же ответе; клиент остаётся в UI магазина | Выбор метода, показ реквизитов/redirect по `paymentLink`, подтверждение перевода и callback | [H2H: реквизиты сразу](/doc/v2/h2h-sync/) |
| PayIn H2H по шагам — **сложный, не рекомендуется** | Только если ордер обязательно создать до выбора способа оплаты и магазин готов управлять каждым переходом статуса | Загрузку методов, выбор через `PATCH`, запуск поиска, показ реквизитов, подтверждение и callback | [H2H: по шагам](/doc/v2/h2h-step/) |
| PayOut H2H | Магазин отправляет выплату клиенту по его реквизитам | Сбор реквизитов по выбранному методу, проверку баланса, создание выплаты и callback | [PayOut](/doc/v2/payout/) |

Если собственный платёжный UI не нужен, выбирайте Redirect. H2H sync проще
пошагового H2H, но требует заранее выбрать
[`payment.type`](/doc/api/shop/05-payment-types/) по согласованному маппингу или
[списку доступных методов и банков](/doc/api/shop/04-dictionaries/#получение-методов).
Пошаговый H2H не рекомендуется для новых интеграций. Не используйте
PayOut для вывода средств магазина: для этого предназначен withdrawal.

PayOut клиенту и withdrawal с баланса магазина — разные операции.

## Что реализовать

| Задача | API | Подробности |
| --- | --- | --- |
| Получить способы оплаты | [`GET /shop/trade-methods`](/doc/api/shop/04-dictionaries/#получение-методов) | [Методы и поля](/doc/api/shop/04-dictionaries/), [`payment.type`](/doc/api/shop/05-payment-types/) |
| Создать PayIn | [`POST /shop/orders`](/doc/api/payin/02-orders/#post-shoporders) или [`POST /shop/orders/sync-requisites`](/doc/api/payin/02-orders/#post-shoporderssync-requisites) | [Создание ордера](/doc/api/payin/02-orders/) |
| Получить статус | Callback; резервно [`GET /shop/orders/{id}`](/doc/api/payin/03-read/#по-внутреннему-id) | [Чтение ордера](/doc/api/payin/03-read/), [callback](/doc/v2/callback-signature/) |
| Продвинуть или отменить ордер | [`PATCH`, `start-payment`, `confirm-payment`, `cancel`](/doc/api/payin/04-actions/) | [Условия и последствия действий](/doc/api/payin/04-actions/) |
| Прикрепить чек | [`POST /shop/orders/{id}/receipts`](/doc/api/payin/05-receipts-and-fields/#загрузить-чек); в `cancelled` откроет диспут | [Чеки](/doc/api/payin/05-receipts-and-fields/) |
| Открыть диспут | [`POST /shop/orders/{id}/dispute`](/doc/api/payin/06-disputes/#открыть-диспут); только из `cancelled` | [Диспуты](/doc/api/payin/06-disputes/) |
| Прочитать баланс | [`GET /shop/assets`](/doc/api/shop/02-balances/#get-shopassets) | [Баланс](/doc/api/shop/02-balances/) |
| Вывести средства магазина | [`POST /shop/assets/withdrawals`](/doc/api/shop/02-balances/#post-shopassetswithdrawals) | [Withdrawal](/doc/api/shop/02-balances/#post-shopassetswithdrawals) |

Статус нельзя присвоить напрямую полем `status`. Мерчант выполняет действие, а
платформа проверяет допустимость перехода и возвращает новый статус.

## Порядок подключения

1. Проверьте [`GET /shop/info`](/doc/api/shop/03-info/#get-shopinfo).
2. Настройте callback и проверку подписи.
3. Настройте согласованные `paymentType + bank`: используйте собственный маппинг
   или получите доступные сочетания через API.
4. Создайте тестовый ордер с уникальным `externalOrderId`.
5. Сохраните `id`, `externalOrderId`, `amount`, `status` и `statusDetails`.
6. Проверьте успешный, отменённый и повторный callback.

## Получение результата

Callback — основной канал. Обработчик должен проверить `signature`, быть
идемпотентным и вернуть HTTP `200` после сохранения события.

Для сверки и восстановления используйте [`GET /shop/orders/{id}`](/doc/api/payin/03-read/#по-внутреннему-id)
или [`GET /shop/payout-orders/{id}`](/doc/api/payout/03-read-and-cancel/#get-shoppayout-ordersid).
Если create-запрос завершился
таймаутом, сначала найдите ордер по `externalOrderId`; не создавайте новый вслепую.

Для PayIn успешным финалом является только `completed`. Redirect клиента и ответ
`201 Created` не подтверждают оплату. В `dispute` требуется ручной разбор.
