---
title: "Интеграция"
description: "Короткий порядок подключения API магазина"
---

## Доступ

Получите у платформы:

- `Shop API key` для PayIn-ордеров, PayOut-ордеров, методов и чтения баланса;
- `Signature key` для проверки уведомлений о статусе;
- `Balance API key`, только если нужен вывод средств магазина.

```bash
export BASE_URL="[[BASE_URL]]"
export SHOP_TOKEN="<SHOP_API_KEY>"
export BALANCE_TOKEN="<BALANCE_API_KEY>"
```

Ключ передаётся только с сервера магазина:

```http
Authorization: Bearer <token>
```

Проверьте доступ запросом [`GET /shop/info`](/doc/api/shop/03-info/#get-shopinfo).

## Выбор сценария

В этой документации `PayIn-ордер` означает API-сущность для приёма платежа, а
`PayOut-ордер` — API-сущность для выплаты клиенту. «Платёж» и «выплата» означают
результат соответствующей операции. Вывод средств с баланса магазина — отдельная
операция, для которой PayOut-ордер не используется.

| Сценарий | Когда использовать | Что реализует магазин | Инструкция |
| --- | --- | --- | --- |
| PayIn Redirect | Площадка возвращает `integration.link`, на который нужно перевести клиента | Создание PayIn-ордера, переход по ссылке и получение статуса. Метод и реквизиты клиент выбирает на странице площадки | [Redirect](/doc/v2/red/) |
| PayIn H2H: реквизиты сразу | Метод известен заранее; реквизиты или `requisites.paymentLink` нужны в ответе | Выбор метода, показ реквизитов или переход по `paymentLink`, подтверждение перевода и получение статуса | [H2H: реквизиты сразу](/doc/v2/h2h-sync/) |
| PayIn H2H по шагам — **сложный, не рекомендуется** | PayIn-ордер обязательно создать до выбора способа оплаты | Получение методов, выбор через `PATCH`, запуск поиска реквизитов, подтверждение перевода и получение статуса | [H2H: по шагам](/doc/v2/h2h-step/) |
| PayOut H2H | Магазин выплачивает деньги клиенту по его реквизитам | Сбор реквизитов, проверка баланса, создание PayOut-ордера и получение статуса | [PayOut](/doc/v2/payout/) |

Если своя форма оплаты не нужна, выбирайте Redirect. H2H с реквизитами сразу проще
пошагового H2H, но требует заранее выбрать
[`payment.type`](/doc/api/shop/05-payment-types/) по согласованной таблице кодов или
[списку доступных методов и банков](/doc/api/shop/04-dictionaries/#получение-методов).
Пошаговый H2H не рекомендуется для новых интеграций. Не используйте
PayOut для вывода средств магазина: для этого есть отдельный запрос вывода.

Выплата клиенту и вывод средств магазина — разные операции.

## Что реализовать

| Задача | API | Подробности |
| --- | --- | --- |
| Получить способы оплаты | [`GET /shop/trade-methods`](/doc/api/shop/04-dictionaries/#получение-методов) | [Методы и поля](/doc/api/shop/04-dictionaries/), [`payment.type`](/doc/api/shop/05-payment-types/) |
| Создать PayIn-ордер | [`POST /shop/orders`](/doc/api/payin/02-orders/#post-shoporders) или [`POST /shop/orders/sync-requisites`](/doc/api/payin/02-orders/#post-shoporderssync-requisites) | [Создание PayIn-ордера](/doc/api/payin/02-orders/) |
| Получить статус PayIn-ордера | Уведомление на `callbackUrl`; для проверки — [`GET /shop/orders/{id}`](/doc/api/payin/03-read/#по-внутреннему-id) | [Чтение PayIn-ордера](/doc/api/payin/03-read/), [уведомления](/doc/v2/callback-signature/) |
| Продвинуть или отменить PayIn-ордер | [`PATCH`, `start-payment`, `confirm-payment`, `cancel`](/doc/api/payin/04-actions/) | [Условия и последствия действий](/doc/api/payin/04-actions/) |
| Прикрепить чек | [`POST /shop/orders/{id}/receipts`](/doc/api/payin/05-receipts-and-fields/#загрузить-чек); в `cancelled` откроет диспут | [Чеки](/doc/api/payin/05-receipts-and-fields/) |
| Открыть диспут | [`POST /shop/orders/{id}/dispute`](/doc/api/payin/06-disputes/#открыть-диспут); только из `cancelled` | [Диспуты](/doc/api/payin/06-disputes/) |
| Прочитать баланс | [`GET /shop/assets`](/doc/api/shop/02-balances/#get-shopassets) | [Баланс](/doc/api/shop/02-balances/) |
| Вывести средства магазина | [`POST /shop/assets/withdrawals`](/doc/api/shop/02-balances/#post-shopassetswithdrawals) | [Вывод средств](/doc/api/shop/02-balances/#post-shopassetswithdrawals) |

Статус нельзя присвоить напрямую полем `status`. Магазин выполняет действие, а
платформа проверяет допустимость перехода и возвращает новый статус.

## Порядок подключения

1. Проверьте [`GET /shop/info`](/doc/api/shop/03-info/#get-shopinfo).
2. Настройте уведомления о статусах и проверку подписи.
3. Настройте согласованные `paymentType + bank`: используйте свою таблицу кодов
   или получите доступные сочетания через API.
4. Создайте тестовый PayIn-ордер или PayOut-ордер с уникальным `externalOrderId`.
5. Сохраните `id`, `externalOrderId`, `amount`, `status` и `statusDetails`.
6. Проверьте уведомления для завершённого и отменённого PayIn-ордера или PayOut-ордера,
   включая повторную доставку.

## Получение результата

Уведомление на `callbackUrl` — основной способ получать статусы. Проверьте `signature`, сохраните
статус и верните HTTP `200`. Если уведомление пришло повторно, не выполняйте
действие второй раз.

Для сверки и восстановления используйте [`GET /shop/orders/{id}`](/doc/api/payin/03-read/#по-внутреннему-id)
или [`GET /shop/payout-orders/{id}`](/doc/api/payout/03-read-and-cancel/#get-shoppayout-ordersid).
Если запрос создания завершился таймаутом, сначала найдите соответствующий
PayIn-ордер или PayOut-ордер по `externalOrderId`; не создавайте новый вслепую.

Для PayIn успешным результатом является только `completed`. Переход клиента по ссылке и ответ
`201 Created` не подтверждают оплату. В `dispute` требуется ручной разбор.
