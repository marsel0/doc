---
title: "PayIn: чеки"
description: "Загрузка чеков, влияние на статусы и связь с диспутами"
---

Чек в `PayIn` нужен не как декоративное вложение, а как важный артефакт для спорных и пограничных кейсов.

## Загрузка чека

Используйте:

- `POST /public/api/v1/shop/orders/{id}/receipts` <a href="[[DOMAIN_URL]]/public/api/payin#tag/v1shoporders/operation/ShopOrdersControllerV1_uploadReceipt" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>

### Что передаётся

| Поле | Статус | Комментарий |
| --- | --- | --- |
| `file` | обязательное | Чек в формате binary |

## Что важно

- Чек загружается по внутреннему `id` ордера.
- Если загрузить чек к ордеру в статусе `cancelled`, ордер может перейти в `dispute`.
- Чек особенно важен для кейсов, где оплата была, но нормальное подтверждение не завершилось.

## Как это влияет на lifecycle

- `cancelled` без чека и `cancelled` с последующим чеком — это разные по смыслу ситуации.
- В старом flow именно наличие чека меняет трактовку части timeout-кейсов.
- Для `trader_confirm_timeout` наличие чека особенно важно при последующем разборе.

## Когда чек нужен обязательно по смыслу

- клиент утверждает, что оплатил;
- мерчант хочет открыть диспут;
- нужно доказать оплату в ручном разборе;
- ордер ушёл в отмену, но перевод фактически состоялся.

## Связанные методы

- `GET /public/api/v1/shop/orders/{id}/receipts` <a href="[[DOMAIN_URL]]/public/api/payin#tag/v1shoporders/operation/ShopOrdersControllerV1_getReceipts" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>
- `POST /public/api/v1/shop/orders/{id}/remove-receipt` <a href="[[DOMAIN_URL]]/public/api/payin#tag/v1shoporders/operation/ShopOrdersControllerV1_removeReceipt" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>
- `POST /public/api/v1/shop/orders/{id}/receipts/url` <a href="[[DOMAIN_URL]]/public/api/payin#tag/v1shoporders/operation/ShopOrdersControllerV1_generateReceiptUrl" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>

## Куда идти дальше

- [PayIn: диспуты](/doc/v2/payin-disputes/)
- [PayIn: статусы и переходы](/doc/v2/payin-statuses/)
