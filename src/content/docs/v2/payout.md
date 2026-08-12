---
title: "PayOut H2H"
description: "Короткий сценарий выплаты клиенту"
---

PayOut переводит средства с баланса магазина клиенту. Это не withdrawal на
внешний кошелёк магазина.

## Порядок работы

1. Прочитайте [`GET /shop/trade-methods/payout`](/doc/api/payout/04-dictionaries/#get-shoptrade-methodspayout).
2. Выберите метод и соберите обязательные `customer.requisites`.
3. Проверьте баланс через [`GET /shop/assets`](/doc/api/shop/02-balances/#get-shopassets).
4. Создайте [`POST /shop/payout-orders`](/doc/api/payout/02-orders/#post-shoppayout-orders) с уникальным `externalOrderId`.
5. Получите результат через callback; для сверки используйте [`GET /shop/payout-orders/{id}`](/doc/api/payout/03-read-and-cancel/#get-shoppayout-ordersid).

## Поля создания

| Поле | Обязательно | Источник |
| --- | --- | --- |
| `amount` | да | Сумма выплаты в системе магазина |
| `currency` | да | Fiat-валюта магазина |
| `customer.id` | да | Стабильный ID клиента магазина; не ID выплаты |
| `customer.requisites` | да | Поля выбранного payout trade method |
| `payment.type` | да | [`paymentType` из доступных PayOut-методов](/doc/api/payout/04-dictionaries/#get-shoptrade-methodspayout); [назначение кодов](/doc/api/shop/05-payment-types/) |
| `payment.bank` | нет, рекомендуется | [`bank` из того же элемента списка](/doc/api/payout/04-dictionaries/#get-shoptrade-methodspayout); без него платформа использует BIN карты или fallback |
| `integration.externalOrderId` | рекомендуется всегда | Уникальный ID выплаты магазина |
| `integration.callbackUrl` | рекомендуется | HTTPS URL обработчика статусов |
| `integration.callbackMethod` | нет | `post` или `get`; по умолчанию `post` |

Не хардкодьте состав `customer.requisites`: для СБП это может быть `phone`, для
карты — `cardInfo`, для банковского перевода — реквизиты счёта.

Подробный запрос и ответ: [создание PayOut](/doc/api/payout/02-orders/).

## Результат

Создание ордера не означает успешную выплату. Дождитесь финального статуса.
Callback проверяйте по `signature` и обрабатывайте идемпотентно.

Чтение и отмена: [PayOut API](/doc/api/payout/03-read-and-cancel/).
Статусы: [статусы PayOut](/doc/v2/payout-statuses/).

После таймаута create-запроса сначала найдите payout по `externalOrderId`. Не
создавайте повторную выплату вслепую.

## Частые ошибки

| Ошибка | Что делать |
| --- | --- |
| `S10001` | Недостаточно доступного баланса: обновите баланс и уменьшите сумму или пополните его |
| `B10000`, `P10000`, `P10001`, `T10000` | Обновите метод по payout-справочнику и проверьте обязательные реквизиты |
| `O10006` | Выплата с таким `externalOrderId` уже существует: прочитайте её, не создавайте повторно |
| Таймаут create (`S10002`) | Найдите выплату по `externalOrderId`; результат запроса не доказывает, что она не создана |
| `O10000` при отмене | Прочитайте статус; магазин может отменять только `requisites` или `trader_accept` |
