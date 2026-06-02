---
title: "Интеграция"
description: "Общая схема merchant-интеграции и выбор сценария"
---

Эта страница нужна как точка входа в merchant-интеграцию. Здесь остаётся только общая схема подключения: что нужно получить на старте, как устроена модель работы, какой сценарий выбрать и какие базовые требования нужны до production.

Детальные API-методы вынесены в отдельные разделы. Примеры запросов и ответов тоже вынесены отдельно, чтобы не смешивать процесс интеграции и reference.

## Что нужно на старте

Минимальный набор:

- домен инстанса `simple-pay`;
- `Shop API key`;
- `Balance API key`;
- `Signature key` для callback.

В рамках этой документации считается, что ключи уже получены, а callback является обязательной частью нормальной интеграции. `GET`-чтение статуса остаётся резервным каналом контроля, но не должно быть основным способом синхронизации.

## Базовые переменные

Если ваш инстанс доступен по домену `[[DOMAIN_URL]]`, merchant API используется через `BASE_URL`.

```bash
export DOMAIN="[[DOMAIN_URL]]"
export BASE_URL="[[BASE_URL]]"
export SHOP_TOKEN="<SHOP_API_KEY>"
export BALANCE_TOKEN="<BALANCE_API_KEY>"
export SIGNATURE_KEY="<SIGNATURE_KEY>"
```

Все страницы и примеры в этой документации используют именно этот `BASE_URL`.

## Какие ключи для чего нужны

### `Shop API key`

Используется для:

- `payin`-ордеров;
- `payout`-ордеров;
- чтения ордеров;
- trade methods;
- данных магазина и курсов.

### `Balance API key`

Используется для:

- чтения баланса магазина;
- создания заявок на вывод средств магазина;
- чтения статуса заявок на вывод.

### `Signature key`

Используется для проверки подлинности callback, которые платформа отправляет на ваш `callbackUrl`.

## Как устроена модель интеграции

В `simple-pay` мерчант не выставляет `status` напрямую. Вместо этого мерчант вызывает бизнес-действия, а платформа сама переводит ордер в следующий допустимый статус.

Это означает:

- нельзя произвольно записать ордер в `completed` или `cancelled`;
- для каждого сценария есть допустимые действия;
- итоговый статус нужно принимать из callback или дочитывать через `GET`.

Практически это важнее всего в `H2H`-сценариях, где мерчант управляет шагами оплаты на своей стороне.

## Как читать новую структуру

В новой структуре документация разделена на два верхних направления:

- `PayIn` — приём платежей от клиента;
- `PayOut` — выплаты клиенту.

Внутри `PayIn` сценарии разбиты по типам интеграции.

## Какие сценарии интеграции есть

| Сценарий | Когда использовать | Основные методы |
| :---- | :---- | :---- |
| `PayIn Redirect` | клиента можно перевести на платёжную страницу `simple-pay` | `POST /public/api/v1/shop/orders` <a href="[[DOMAIN_URL]]/public/api/payin#tag/v1shoporders/operation/ShopOrdersControllerV1_create" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a> |
| `PayIn H2H sync requisites` | клиент остаётся на вашем UI, а реквизиты нужны сразу | `GET /public/api/v1/shop/trade-methods` <a href="[[DOMAIN_URL]]/public/api/payin#tag/v1shoptrade-methods/operation/ShopTradeMethodsController_getTradeMethods" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a><br>`POST /public/api/v1/shop/orders/sync-requisites` <a href="[[DOMAIN_URL]]/public/api/payin#tag/v1shoporders/operation/ShopOrdersControllerV1_createSyncRequisiteWithTimeout" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a> |
| `PayIn H2H step-by-step` | способ оплаты выбирается уже после создания ордера | `POST /public/api/v1/shop/orders` <a href="[[DOMAIN_URL]]/public/api/payin#tag/v1shoporders/operation/ShopOrdersControllerV1_create" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a><br>`PATCH /public/api/v1/shop/orders/{id}` <a href="[[DOMAIN_URL]]/public/api/payin#tag/v1shoporders/operation/ShopOrdersControllerV1_update" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a><br>`POST /public/api/v1/shop/orders/{id}/start-payment` <a href="[[DOMAIN_URL]]/public/api/payin#tag/v1shoporders/operation/ShopOrdersControllerV1_startPayment" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a><br>`POST /public/api/v1/shop/orders/{id}/confirm-payment` <a href="[[DOMAIN_URL]]/public/api/payin#tag/v1shoporders/operation/ShopOrdersControllerV1_confirmPayment" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a> |
| `Payout H2H` | вы создаёте выплаты и отслеживаете их статус | `GET /public/api/v1/shop/trade-methods/payout` <a href="[[DOMAIN_URL]]/public/api/payout#tag/v1shoptrade-methodspayout/operation/ShopTradeMethodsController_getPayoutTradeMethods" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a><br>`POST /public/api/v1/shop/payout-orders` <a href="[[DOMAIN_URL]]/public/api/payout#tag/v1shoppayout-orders/operation/ShopPayoutOrdersControllerV1_createWithTimeout" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a> |

## Какой сценарий выбрать для PayIn

### `PayIn Redirect`

Используйте, если:

- клиента можно перевести на платёжную страницу платформы;
- нужен самый короткий и быстрый запуск;
- вам не нужно показывать реквизиты на своей стороне.

Это сценарий, где мерчант создаёт ордер и перенаправляет клиента по `integration.link`.

Перейти: [PayIn Redirect](/doc/v2/red/)

### `PayIn H2H sync requisites`

Используйте, если:

- клиент остаётся на вашем UI;
- метод оплаты известен заранее;
- реквизиты нужны сразу в ответе.

Перейти: [PayIn H2H sync requisites](/doc/v2/h2h-sync/)

### `PayIn H2H step-by-step`

Используйте, если:

- способ оплаты выбирается уже после создания ордера;
- вы хотите управлять шагами UI отдельно;
- вам нужно сначала создать ордер, а потом дать пользователю выбрать метод.

Перейти: [PayIn H2H step-by-step](/doc/v2/h2h-step/)

## Когда идти в PayOut

`PayOut` нужен, если вы не принимаете платёж от клиента, а создаёте заявку на выплату средств клиенту.

Это отдельный сценарий со своей логикой:

- нужно читать доступные payout methods;
- нужно собирать `customer.requisites`;
- нужно создавать payout-ордер и ждать финальный статус;
- `201 Created` после создания выплаты не означает финальный успех.

Перейти: [Payout H2H](/doc/v2/payout/)

## Какой путь подключения считать базовым

Для нового мерчанта рекомендуемый порядок такой:

1. Собрать `BASE_URL`.
2. Проверить доступ к магазину и окружению.
3. Настроить callback-обработчик.
4. Реализовать проверку `signature`.
5. Выбрать направление интеграции: `PayIn` или `PayOut`.
6. Для `PayIn` выбрать сценарий: `Redirect`, `H2H sync requisites` или `H2H step-by-step`.
7. Передавать уникальный `externalOrderId`.
8. Использовать callback как основной канал статусов, а `GET` как резервный.

Если интеграция идёт в production, полезно сразу предусмотреть логирование всех ключевых идентификаторов и статусов.

## Callback и получение статусов

Есть два рабочих способа получать статусы:

- через callback;
- через `GET`-чтение ордера.

Основной сценарий:

- у ордера указывается `callbackUrl`;
- платформа отправляет callback при смене статуса;
- мерчант проверяет `signature`;
- мерчант обновляет свою внутреннюю бизнес-операцию.

Что важно:

- callback может прийти повторно;
- обработчик должен быть идемпотентным;
- даже при `post` статусные параметры могут приходить в query string;
- polling нужен как резерв, а не как замена callback.

## Что хранить у себя

Минимально у себя стоит сохранять:

- ваш внутренний бизнес-ID;
- `externalOrderId`;
- внутренний `id` ордера в `simple-pay`;
- `amount` и `initialAmount`, если сценарий связан с payin;
- `status`;
- `statusDetails`;
- статус доставки callback.

Если create-запрос завершился таймаутом, именно эти данные позволяют безопасно дочитать ордер и не создать дубль.

## Что важно до production

- `externalOrderId` лучше считать обязательным.
- После таймаута create-запроса нельзя сразу создавать новый ордер вслепую.
- Клиенту в payin-сценариях нужно показывать фактический `amount`, а не только `initialAmount`.
- Callback-обработчик должен быть идемпотентным.
- Логи по ордерам и callback должны содержать идентификаторы, статусы и результат доставки.

## Как читать эту справку дальше

- Если нужен выбор и описание процесса, начните с `PayIn Redirect`, `PayIn H2H sync requisites`, `PayIn H2H step-by-step` или с отдельной страницы `Payout H2H`.
- Если нужны готовые payload-ы, ответы и сниппеты, переходите в [Примеры](/doc/v2/examples/).
- Если нужно понять, как выбрать `bank` / `payment.type` и как читать `fields/customerFields`, начните с [Выбора банка и типа оплаты](/doc/v2/payment-methods/) и [Поля реквизитов и customerFields](/doc/v2/field-reference/).
- Если нужен точный reference по endpoint-ам и полям, переходите в существующие разделы `/doc/api/...`.

