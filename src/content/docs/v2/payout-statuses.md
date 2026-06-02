---
title: "Payout: статусы и переходы"
description: "Основные статусы payout-ордера, детали отмены и спорные состояния"
---

`Payout` живёт по своей статусной модели. Для выплат особенно опасно считать успехом сам факт создания ордера: после `POST` работа только начинается.

## Основные статусы

| Статус | Что означает |
| --- | --- |
| `new` | Ордер создан |
| `requisites` | Идёт поиск подходящих реквизитов трейдера |
| `trader_accept` | Трейдер найден, ожидается принятие ордера |
| `trader_payment` | Трейдер принял ордер и выполняет перевод |
| `rejected` | Текущая попытка выплаты отклонена |
| `dispute` | Ордер переведён в диспут |
| `completed` | Выплата выполнена |
| `cancelled` | Выплата отменена |

## Финальные статусы

Для мерчанта финальными считаются:

- `completed`
- `cancelled`
- `dispute`

## `statusDetails`

### Для `rejected`

| `statusDetails` | Что означает |
| --- | --- |
| `accept_timeout` | Трейдер не принял ордер вовремя |
| `no_funds` | У трейдера недостаточно средств |
| `requisites_blocked` | Реквизиты трейдера заблокированы |
| `payment_impossible` | Перевод невозможен |
| `revert_dispute` | Администратор вернул ордер из диспута в поиск нового трейдера |

### Для `dispute`

| `statusDetails` | Что означает |
| --- | --- |
| `payment_timeout` | Истекло время оплаты трейдером |
| `invalid_requisites` | Трейдер пожаловался на неверные реквизиты |
| `payment_failed` | Перевод не удалось выполнить |
| `revert_cancelled` | Отменённый ордер возвращён в диспут |
| `dispute_verify` | Нужна дополнительная проверка администратором |

### Для `cancelled`

| `statusDetails` | Что означает |
| --- | --- |
| `admin` | Выплату отменил администратор |
| `operator` | Выплату отменил оператор |
| `shop` | Выплату отменил магазин |
| `requisites_timeout` | Реквизиты не найдены вовремя |
| `max_rejects_exceeded` | Ордер слишком много раз был отклонён |

## Чтение статуса

Используйте:

- `GET /public/api/v1/shop/payout-orders/{id}` <a href="[[DOMAIN_URL]]/public/api/payout#tag/v1shoppayout-orders/operation/ShopPayoutOrdersControllerV1_findOne" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>
- `GET /public/api/v1/shop/payout-orders/external/{externalOrderId}` <a href="[[DOMAIN_URL]]/public/api/payout#tag/v1shoppayout-orders/operation/ShopPayoutOrdersControllerV1_findOneByExternalOrderId" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>

## Отмена выплаты

Используйте:

- `POST /public/api/v1/shop/payout-orders/{id}/cancel` <a href="[[DOMAIN_URL]]/public/api/payout#tag/v1shoppayout-orders/operation/ShopPayoutOrdersControllerV1_cancel" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>

Практическое правило из старой доки: выплата нормально отменяется только в статусах `new`, `requisites`, `trader_accept`, то есть пока конечные исполнители ещё не взяли её в работу.

## Практические правила

- `201 Created` после создания payout не означает успешную выплату.
- После таймаута create-запроса сначала ищите payout по `externalOrderId`.
- Для `card2card` банк может быть доопределён системой, поэтому итоговый `payment.bank` читайте из ответа.
- Если статус `dispute`, это уже не обычный retry-сценарий, а ручной бизнес-разбор.

## Куда идти дальше

- [Payout H2H](/doc/v2/payout/)
- [Примеры Payout H2H](/doc/v2/examples/payout/)
- [Callback и подпись](/doc/v2/callback-signature/)
