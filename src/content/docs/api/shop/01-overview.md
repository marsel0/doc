---
title: "Shop API: начало работы"
description: "Ключи, базовый URL и безопасный порядок работы merchant-интеграции"
---

`Shop API` — служебная часть merchant API. Через неё магазин проверяет доступ,
читает свои рабочие настройки, доступные методы, баланс и создаёт вывод средств с
баланса магазина. Это не API для редактирования настроек: лимиты, валюты, ключи,
список IP, методы и ограничения на вывод настраиваются в кабинете или командой
платформы.

## Что необходимо получить до интеграции

- базовый URL API;
- `Shop API key` для PayIn, PayOut, информации и методов;
- `Balance API key` — только для операций с выводом средств;
- при необходимости — разрешённые исходящие IP для основных order-запросов;
- значения callback URL и signature key для сценариев PayIn/PayOut.

Ключи привязаны к конкретному магазину. Не передавайте ключ в браузер, мобильное
приложение, логи или URL. Храните его только на сервере магазина в secret storage.

## Базовый URL и заголовки

Все примеры ниже используют merchant API версии `v1`:

```bash
export DOMAIN="[[DOMAIN_URL]]"
export BASE_URL="[[BASE_URL]]"
export SHOP_TOKEN="<shop-api-key>"
export BALANCE_TOKEN="<balance-api-key>"
```

Передавайте ключ строго в HTTP-заголовке:

```http
Authorization: Bearer <token>
Accept: application/json
```

Для `POST` также указывайте `Content-Type: application/json`. Не добавляйте токен
в query-параметры и не отправляйте его как Basic Auth.

## Какой ключ использовать

| Endpoint | Разрешённый ключ | Назначение |
| --- | --- | --- |
| [`GET /shop/info`](/doc/api/shop/03-info/#get-shopinfo) | Shop | Проверить магазин и среду. |
| [`GET /shop/info/exchange`](/doc/api/shop/03-info/#get-shopinfoexchange) | Shop | Получить настроенные курсы. |
| [`GET /shop/trade-methods`](/doc/api/shop/04-dictionaries/#получение-методов) | Shop | Получить PayIn-методы. |
| [`GET /shop/trade-methods/payout`](/doc/api/payout/04-dictionaries/#get-shoptrade-methodspayout) | Shop | Получить PayOut-методы. |
| [`GET /shop/assets`](/doc/api/shop/02-balances/#get-shopassets) | Shop **или** Balance | Прочитать баланс. |
| [`POST /shop/assets/withdrawals`](/doc/api/shop/02-balances/#post-shopassetswithdrawals) | Balance | Создать вывод средств магазина. |
| [`GET /shop/assets/withdrawals/{id}`](/doc/api/shop/02-balances/#get-shopassetswithdrawalsid) | Balance | Прочитать созданный вывод. |

`Shop API key` и `Balance API key` не взаимозаменяемы для операций вывода. Ошибка
`401` при корректном URL чаще всего означает неверный ключ, неверную среду или
неподходящий формат `Authorization`.

## Рекомендуемый порядок запуска

1. Вызовите [`GET /shop/info`](/doc/api/shop/03-info/#get-shopinfo) с `Shop API key` и убедитесь, что `id`, валюта и
   `status` относятся к ожидаемому магазину.
2. Убедитесь, что `status` равен `active`. При `inactive` API возвращает бизнес-код
   `S10000`; создавать заказы не нужно.
3. Прочитайте [`GET /shop/info/exchange`](/doc/api/shop/03-info/#get-shopinfoexchange), если ваша система показывает суммы в
   asset- или fiat-валюте.
4. Перед показом формы оплаты или каждой актуальной операцией получите trade methods.
   Набор зависит от магазина и текущей доступности реквизитов, поэтому не храните
   список банков в коде как постоянный справочник.
5. Для PayOut перед созданием массовой выплаты вызовите [`GET /shop/assets`](/doc/api/shop/02-balances/#get-shopassets).
6. Настройте PayIn/PayOut согласно профильным разделам; Shop API сам по себе не
   создаёт клиентский платёжный или payout-ордер.

## Что можно и нельзя менять через API

Shop API возвращает фактическую конфигурацию, но не содержит endpoint-ов для её
изменения. Через него нельзя включить метод, сменить валюту, установить курс,
изменить IP whitelist, лимиты, callback или ключи. Если ответ не соответствует
договорённой конфигурации, передайте в поддержку: ID магазина из `/shop/info`, среду,
endpoint, время запроса и `request id`/ответ без токена.

## Надёжная отправка запросов

- Используйте HTTPS и короткий connect/read timeout на клиенте.
- На `GET` можно сделать ограниченный повтор при сетевой ошибке или `5xx` с
  экспоненциальной задержкой.
- Не повторяйте [`POST /shop/assets/withdrawals`](/doc/api/shop/02-balances/#post-shopassetswithdrawals) вслепую после таймаута: сначала запросите вывод
  по известному `id` (если ответ успел его вернуть) или обратитесь в поддержку.
- Не используйте число активов как финансовый источник истины в UI: запрашивайте
  актуальный баланс перед созданием payout или вывода.
- Для business-ошибок ориентируйтесь на `errorCode`, а не на локализованный текст.
  Общие правила приведены в разделе [Ошибки и коды ответов](/doc/docs/02-api_error_guide/).

## Дальше

- [Информация о магазине и курсы](/doc/api/shop/03-info/)
- [Trade methods: как строить форму](/doc/api/shop/04-dictionaries/)
- [Баланс и вывод средств](/doc/api/shop/02-balances/)
