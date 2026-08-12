---
title: "Shop API: баланс и вывод средств"
description: "Чтение балансов и безопасное создание withdrawal-заявки"
---

Здесь речь о балансе самого магазина, а не о payout-ордере клиенту. Создание
withdrawal переводит средства с актива магазина на внешний TRC20-адрес. Это
операция с деньгами: выполняйте её только из защищённого backend-контура и с
`Balance API key`.

## GET `/shop/assets`

Этот endpoint принимает **Shop API key или Balance API key**. Для регулярной
диагностики достаточно Shop API key; ключ баланса нужен для последующего вывода.

```bash
curl --fail-with-body --silent --show-error \
  "$BASE_URL/shop/assets?exchange=payout" \
  --header "Authorization: Bearer $SHOP_TOKEN" \
  --header "Accept: application/json"
```

Допустимый `exchange`:

| Значение | Что возвращает |
| --- | --- |
| не передано или `default` | Балансы без fiat-пересчёта. |
| `payin` | Fiat-пересчёт по настроенному PayIn-курсу. |
| `payout` | Fiat-пересчёт по настроенному PayOut-курсу. |

Пример ответа:

```json
[
  {
    "id": "a1b2c3d4-0000-0000-0000-000000000000",
    "currency": "USDT",
    "balance": 125.5,
    "holdBalance": 20,
    "fiatCurrency": "RUB",
    "fiatBalance": 12487.25,
    "fiatHoldBalance": 1990,
    "fiatCurrencyRate": 99.5,
    "shop": { "id": "374e21dc-0fa7-42f8-b523-f95a8c0e9a2c", "name": "demo-shop" }
  }
]
```

| Поле ответа | Что означает |
| --- | --- |
| `id` | UUID актива магазина. Это не ID магазина и не ID withdrawal. |
| `currency` | Код asset-валюты баланса, например `USDT`. |
| `balance` | Доступный баланс актива. Именно с ним сверяйте возможность новой операции. |
| `holdBalance` | Сумма в холде; не прибавляйте её к доступному балансу. |
| `fiatCurrency` | Fiat-валюта пересчёта; появляется только при `exchange` и найденном курсе. |
| `fiatBalance` | Оценка доступного баланса в fiat по выбранному курсу. Это расчётное представление, а не отдельный баланс. |
| `fiatHoldBalance` | Fiat-оценка холда. |
| `fiatCurrencyRate` | Курс, которым рассчитаны оба поля `fiat*`. |
| `shop.id` | UUID магазина, которому принадлежит баланс. Сверяйте его с [`GET /shop/info`](/doc/api/shop/03-info/#get-shopinfo). |
| `shop.name` | Имя магазина. |

Перед пачкой выплат повторно считайте баланс. При `S10001` (недостаточно средств)
не ретрайте payout до пополнения или изменения суммы.

## POST `/shop/assets/withdrawals`

Требуется **Balance API key**. Сумма `withdrawAmount` включает комиссию: получатель
получит сумму за вычетом комиссии, установленной для магазина/вывода.

Метод доступен, только если выводы разрешены настройкой магазина и свежий
`balance` не меньше `withdrawAmount`. При создании заявки вся сумма сразу
вычитается из доступного `balance` и переносится в `holdBalance`; это ещё не
означает выполненную on-chain транзакцию.

```bash
curl --fail-with-body --silent --show-error \
  --request POST "$BASE_URL/shop/assets/withdrawals" \
  --header "Authorization: Bearer $BALANCE_TOKEN" \
  --header "Content-Type: application/json" \
  --data '{
    "withdrawAmount": 25.00,
    "address": "TXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
  }'
```

| Поле | Обязательно | Требование |
| --- | --- | --- |
| `withdrawAmount` | да | Положительное число (`> 0`), включающее комиссию. Сумма должна покрывать комиссию; доступный максимум определяйте по свежему `balance`. |
| `address` | да | Строка с адресом получателя в сети **TRC20**. Перед отправкой подтвердите адрес вне API. |

Пример ответа:

```json
{
  "id": "9aa52b42-3cb7-402a-b655-0753e246ece8",
  "currency": "USDT",
  "withdrawAmount": 25,
  "status": "new",
  "hash": null
}
```

Возможные статусы: `new`, `waiting_transaction`, `completed`, `cancelled`, `revoked`.
`hash` появляется после создания on-chain транзакции и может отсутствовать, пока
заявка не обработана.

| Поле ответа | Что означает |
| --- | --- |
| `id` | UUID withdrawal-заявки; сохраните его для [`GET /shop/assets/withdrawals/{id}`](#get-shopassetswithdrawalsid). |
| `currency` | Asset-валюта вывода. Она определяется активом магазина, а не полем запроса. |
| `withdrawAmount` | Запрошенная сумма вместе с комиссией. |
| `status` | Текущее состояние заявки из списка выше. Только `completed` означает завершённый вывод. |
| `hash` | Hash on-chain транзакции; `null`, пока транзакция не создана. |

Не отправляйте повторный [`POST /shop/assets/withdrawals`](#post-shopassetswithdrawals), если соединение оборвалось или клиент получил
таймаут. Endpoint не принимает idempotency key, поэтому до повторной попытки
сверьте операцию с поддержкой по времени, сумме, магазину и адресу. Это предотвращает
двойной вывод.

## GET `/shop/assets/withdrawals/{id}`

Требуется **Balance API key**. `id` — UUID, полученный при создании заявки.

```bash
curl --fail-with-body --silent --show-error \
  "$BASE_URL/shop/assets/withdrawals/9aa52b42-3cb7-402a-b655-0753e246ece8" \
  --header "Authorization: Bearer $BALANCE_TOKEN"
```

`404` означает, что заявка не найдена в активе текущего магазина: не перебирайте ID
и не используйте ключ другого магазина. `403` с сообщением об ограниченном выводе
означает, что выводы запрещены настройкой магазина и требуют действий платформы.
