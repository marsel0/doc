---
title: "PayOut: статусы и переходы"
description: "Основные статусы PayOut-ордера, детали отмены и спорные состояния"
---

PayOut-ордер живёт по своей статусной модели. Ответ на [`POST /shop/payout-orders`](/doc/api/payout/02-orders/#post-shoppayout-orders) означает только создание PayOut-ордера, а не успешную выплату.

## Основные статусы

| Статус | Что означает |
| --- | --- |
| `new` | PayOut-ордер создан |
| `requisites` | Идёт поиск подходящих реквизитов трейдера |
| `trader_accept` | Устаревший промежуточный статус ожидания принятия; может встречаться в старых ордерах |
| `trader_payment` | Трейдер принял ордер и выполняет перевод |
| `rejected` | Текущая попытка отклонена; это не финал, система может искать другого исполнителя |
| `dispute` | Ордер переведён в диспут |
| `completed` | Выплата выполнена |
| `cancelled` | PayOut-ордер отменён, выплата не выполнена |
| `error` | Техническая ошибка; требуется сверка и при необходимости поддержка |

## Финальные статусы

Автоматически завершать бизнес-операцию можно только по:

- `completed`
- `cancelled`

`dispute` приостанавливает операцию для ручного разбора и позже может перейти в
`completed`, `cancelled` или обратно в поиск исполнителя.

Сохраняйте новые уведомления даже после `cancelled`: администратор
может вернуть отменённый PayOut-ордер в `dispute`. Необратимые действия магазина лучше
выполнять с учётом этого операционного правила.

## `statusDetails`

### Для `rejected`

| `statusDetails` | Что означает |
| --- | --- |
| `accept_timeout` | Трейдер не принял ордер вовремя |
| `no_funds` | У трейдера недостаточно средств |
| `requisites_blocked` | Реквизиты трейдера заблокированы |
| `payment_impossible` | Перевод невозможен |
| `revert_dispute` | Администратор вернул ордер из диспута в поиск нового трейдера |
| `automation_reject` | Попытку отклонила автоматическая обработка |

### Для `dispute`

| `statusDetails` | Что означает |
| --- | --- |
| `payment_timeout` | Истекло время оплаты трейдером |
| `invalid_requisites` | Трейдер пожаловался на неверные реквизиты |
| `payment_failed` | Перевод не удалось выполнить |
| `revert_cancelled` | Отменённый ордер возвращён в диспут |
| `admin_created` | Диспут создал администратор |
| `different_amount` | Сумма перевода отличается от суммы ордера |
| `dispute_verify` | Нужна дополнительная проверка администратором |
| `dispute_automation_failed` | Автоматическая обработка диспута завершилась ошибкой |
| `dispute_unexpected` | Получено непредусмотренное состояние |
| `cascade_assignee_timeout` | Истёк срок поиска отдельного исполнителя |
| `cascade_total_timeout` | Истёк общий срок поиска исполнителей |
| `unresolved_response` | Ответ внешнего обработчика не позволил определить результат |

### Для `cancelled`

| `statusDetails` | Что означает |
| --- | --- |
| `admin` | PayOut-ордер отменил администратор |
| `operator` | PayOut-ордер отменил оператор |
| `shop` | PayOut-ордер отменил магазин |
| `requisites_timeout` | Реквизиты не найдены вовремя |
| `max_rejects_exceeded` | Ордер слишком много раз был отклонён |
| `cascade_exhausted` | Все доступные исполнители исчерпаны |

### Для `completed`

`statusDetails: hold` означает, что выплата завершена после предварительного
удержания средств.

## Чтение статуса

Используйте:

- [`GET /shop/payout-orders/{id}`](/doc/api/payout/03-read-and-cancel/#get-shoppayout-ordersid)
- [`GET /shop/payout-orders/external/{externalOrderId}`](/doc/api/payout/03-read-and-cancel/#get-shoppayout-ordersexternalid)

## Отмена PayOut-ордера

Используйте:

- [`POST /shop/payout-orders/{id}/cancel`](/doc/api/payout/03-read-and-cancel/#post-shoppayout-ordersidcancel)

Магазин может отменить PayOut-ордер только в `requisites` или `trader_accept`.
После перехода в `trader_payment` магазин уже не может отменить PayOut-ордер через API.

## Практические правила

- `201 Created` после создания PayOut-ордера не означает успешную выплату.
- После таймаута запроса создания сначала ищите PayOut-ордер по `externalOrderId`.
- Для `card2card` банк может быть доопределён системой, поэтому итоговый `payment.bank` читайте из ответа.
- Если статус `dispute`, не повторяйте запрос автоматически: выплату нужно проверить вручную.

## Куда идти дальше

- [PayOut H2H](/doc/v2/payout/)
- [Примеры PayOut H2H](/doc/v2/examples/payout/)
- [Уведомления и подпись](/doc/v2/callback-signature/)
