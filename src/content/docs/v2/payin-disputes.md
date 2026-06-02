---
title: "PayIn: диспуты"
description: "Когда переводить payin-ордер в диспут, как его закрывать и какие ограничения учитывать"
---

`Dispute` нужен для спорных `PayIn`-кейсов, когда магазин считает, что отменённый ордер всё же требует разбирательства и возврата средств.

## Когда используется диспут

Типовой сценарий:

1. Ордер уже находится в `cancelled`.
2. У магазина есть чек или фактическая сумма по спорному переводу.
3. Нужно перевести ордер в `dispute` и отдать кейс в ручной разбор.

## Перевести ордер в диспут

Используйте:

- `POST /public/api/v1/shop/orders/{id}/dispute` <a href="[[DOMAIN_URL]]/public/api/payin#tag/v1shoporders/operation/ShopOrdersControllerV1_dispute" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>
- `POST /public/api/v1/shop/orders/external/{id}/dispute` <a href="[[DOMAIN_URL]]/public/api/payin#tag/v1shoporders/operation/ShopOrdersControllerV1_disputeByExternalOrderId" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>

### Что передаётся

| Поле | Статус | Комментарий |
| --- | --- | --- |
| `amount` | обязательное | Фактическая сумма ордера в диспуте |
| `file` | обязательное | Чек в формате binary |

## Ограничения

- Ордер должен уже находиться в статусе `cancelled`.
- Без чека и фактической суммы диспут нормальным образом не собирается.
- Если ордер в другом статусе, API вернёт ошибку по недопустимому действию.

## Закрыть диспут

Используйте:

- `POST /public/api/v1/shop/orders/{id}/dispute/cancel` <a href="[[DOMAIN_URL]]/public/api/payin#tag/v1shoporders/operation/ShopOrdersControllerV1_cancelDispute" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>
- `POST /public/api/v1/shop/orders/external/{id}/dispute/cancel` <a href="[[DOMAIN_URL]]/public/api/payin#tag/v1shoporders/operation/ShopOrdersControllerV1_cancelDisputeByExternalOrderId" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>

После закрытия диспута ордер возвращается в `cancelled`.

## Когда это полезно

- чек оказался поддельным;
- диспут был открыт по ошибке;
- спор уже не актуален;
- внутренний разбор на стороне мерчанта завершён и кейс нужно закрыть.

## Что хранить у себя

- `id` ордера;
- `externalOrderId`;
- статус до перевода в диспут;
- сумма диспута;
- факт загрузки чека;
- текущий результат разбора.

## Куда идти дальше

- [PayIn: статусы и переходы](/doc/v2/payin-statuses/)
- [PayIn: чеки](/doc/v2/payin-receipts/)
- [Callback и подпись](/doc/v2/callback-signature/)
