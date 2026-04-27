---
title: "PayIn: статусы и переходы"
description: "Основные статусы payin-ордера, финальные состояния и практические правила чтения"
---

Эта страница собирает статусную модель `PayIn`, чтобы мерчант мог правильно читать lifecycle ордера и не завершать свою бизнес-операцию слишком рано.

## Основные статусы

| Статус | Что означает |
| --- | --- |
| `new` | Ордер создан |
| `requisites` | Система ищет подходящие реквизиты |
| `customer_confirm` | Реквизиты найдены, ожидается оплата клиента |
| `trader_confirm` | Клиент подтвердил оплату, ожидается подтверждение трейдером |
| `dispute` | Ордер переведён в диспут |
| `completed` | Перевод подтверждён, платёж завершён |
| `cancelled` | Ордер закрыт без успешной оплаты |

## Финальные статусы

Для мерчанта финальными считаются:

- `completed`
- `cancelled`
- `dispute`

Пока ордер находится в `new`, `requisites`, `customer_confirm` или `trader_confirm`, внутреннюю бизнес-операцию завершать нельзя.

## `statusDetails`

### Для `dispute`

| `statusDetails` | Что означает |
| --- | --- |
| `no_payment` | Оплата не пришла |
| `different_amount` | Пришла другая сумма |
| `admin_created` | Диспут создан администратором |
| `revert_cancelled` | Отменённый ордер возвращён в диспут |
| `trader_confirm_timeout` | Трейдер не подтвердил оплату вовремя, но чек уже загружен |

### Для `cancelled`

| `statusDetails` | Что означает |
| --- | --- |
| `shop` | Ордер отменил магазин |
| `admin` | Ордер отменил администратор |
| `operator` | Ордер отменил оператор |
| `customer` | Ордер отменил клиент |
| `trader` | Ордер отменил трейдер |
| `new_timeout` | Истекло время выбора метода оплаты |
| `requisites_timeout` | Истекло время поиска реквизитов |
| `customer_confirm_timeout` | Истекло время оплаты клиентом, чека нет |
| `trader_confirm_timeout` | Истекло время подтверждения трейдером, чека нет |

## Как читать статусы правильно

- Основной канал статусов: callback.
- Резервный канал: `GET /public/api/v1/shop/orders/{id}` <a href="[[DOMAIN_URL]]/public/api/payin#tag/v1shoporders/operation/ShopOrdersControllerV1_findOne" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>.
- Для поиска по вашему идентификатору: `GET /public/api/v1/shop/orders/external/{externalOrderId}` <a href="[[DOMAIN_URL]]/public/api/payin#tag/v1shoporders/operation/ShopOrdersControllerV1_findOneByExternalOrderId" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>.

## Как отменять ордер

Для merchant-отмены используется:

- `POST /public/api/v1/shop/orders/{id}/cancel` <a href="[[DOMAIN_URL]]/public/api/payin#tag/v1shoporders/operation/ShopOrdersControllerV1_cancel" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>

После отмены обязательно смотрите не только `status=cancelled`, но и `statusDetails`.

## Практические правила

- Возврат клиента на сайт мерчанта не равен `completed`.
- Если create-запрос завершился таймаутом, сначала дочитайте ордер по `externalOrderId`.
- Если пришёл `dispute`, это не технический шум, а отдельный бизнес-кейс для разбора.
- Если ордер `cancelled`, всегда смотрите `statusDetails`, иначе причина отмены будет потеряна.

## Куда идти дальше

- [PayIn Redirect](/doc/v2/red/)
- [PayIn H2H sync requisites](/doc/v2/h2h-sync/)
- [PayIn H2H step-by-step](/doc/v2/h2h-step/)
- [PayIn: диспуты](/doc/v2/payin-disputes/)
- [PayIn: чеки](/doc/v2/payin-receipts/)
