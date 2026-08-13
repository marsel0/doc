---
title: "PayOut H2H"
description: "Короткий сценарий выплаты клиенту"
---

PayOut переводит средства с баланса магазина клиенту. Для вывода средств самого
магазина используется [другой запрос](/doc/api/shop/02-balances/#post-shopassetswithdrawals).

## Порядок работы

1. Выберите согласованный метод из своей таблицы кодов или получите методы через
   [`GET /shop/trade-methods/payout`](/doc/api/payout/04-dictionaries/#get-shoptrade-methodspayout).
2. Соберите обязательные `customer.requisites` выбранного метода.
3. Проверьте баланс через [`GET /shop/assets`](/doc/api/shop/02-balances/#get-shopassets).
4. Создайте PayOut-ордер через [`POST /shop/payout-orders`](/doc/api/payout/02-orders/#post-shoppayout-orders) с уникальным `externalOrderId`.
5. Если запрос не завершился стандартным ответом API с явным отказом, считайте
   PayOut-ордер созданным и проверьте его через [`GET /shop/payout-orders/external/{id}`](/doc/api/payout/03-read-and-cancel/#get-shoppayout-ordersexternalid).
6. Получите уведомление о результате; для проверки используйте [`GET /shop/payout-orders/{id}`](/doc/api/payout/03-read-and-cancel/#get-shoppayout-ordersid).

## Поля создания

| Поле | Обязательно | Источник |
| --- | --- | --- |
| `amount` | да | Сумма выплаты в системе магазина |
| `currency` | да | Валюта выплаты, например `RUB` |
| `customer.id` | да | Стабильный ID клиента магазина; не ID PayOut-ордера |
| `customer.requisites` | да | Реквизиты для выбранного способа выплаты |
| `payment.type` | да | Согласованный `paymentType` или код из [PayOut-методов](/doc/api/payout/04-dictionaries/#get-shoptrade-methodspayout); [назначение кодов](/doc/api/shop/05-payment-types/) |
| `payment.bank` | нет, рекомендуется | Согласованный `bank` или код из [PayOut-методов и банков](/doc/api/payout/04-dictionaries/#get-shoptrade-methodspayout); без него платформа определит банк по карте или выберет настроенный вариант |
| `integration.externalOrderId` | рекомендуется всегда | Уникальный ID PayOut-ордера в системе магазина |
| `integration.callbackUrl` | рекомендуется | HTTPS URL обработчика статусов |
| `integration.callbackMethod` | нет | `post` или `get`; по умолчанию `post` |

Состав `customer.requisites` задайте в согласованной таблице или определяйте по
`fields`: для СБП это может быть `phone`, для карты — `cardInfo`, для банковского
перевода — реквизиты счёта.

Подробный запрос и ответ: [создание PayOut-ордера](/doc/api/payout/02-orders/).

## Результат

Создание PayOut-ордера не означает успешную выплату. Дождитесь финального статуса.
Проверяйте `signature` в уведомлении. Если оно пришло повторно, не выполняйте
действие второй раз.

Чтение и отмена: [PayOut API](/doc/api/payout/03-read-and-cancel/).
Статусы: [статусы PayOut](/doc/v2/payout-statuses/).

Если запрос на создание PayOut-ордера не завершился стандартным ответом API с явным
отказом — например, ответ не пришёл, произошёл сетевой сбой или API вернул ошибку
`5xx`, — PayOut-ордер следует считать созданным. Перед повторной попыткой проверьте его
статус через [`GET /shop/payout-orders/external/{id}`](/doc/api/payout/03-read-and-cancel/#get-shoppayout-ordersexternalid),
чтобы избежать дублирования PayOut-ордеров. Не обходите проверку новым `externalOrderId`.

## Частые ошибки

| Ошибка | Что делать |
| --- | --- |
| `S10001` | Недостаточно доступного баланса: обновите баланс и уменьшите сумму или пополните его |
| `B10000`, `P10000`, `P10001`, `T10000` | Проверьте согласованные коды, свою таблицу и обязательные реквизиты; при необходимости запросите методы через API |
| `O10006` | PayOut-ордер с таким `externalOrderId` уже существует: прочитайте его, не создавайте повторно |
| Нет стандартного ответа API с явным отказом | Считайте PayOut-ордер созданным и проверьте его через `GET /shop/payout-orders/external/{id}`, чтобы избежать дублирования PayOut-ордеров |
| `O10000` при отмене | Прочитайте статус; магазин может отменять только `requisites` или `trader_accept` |
