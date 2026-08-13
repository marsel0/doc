---
title: "PayIn API: чеки"
---

Все методы используют внутренний `id` PayIn-ордера и `Shop API key`.

## Загрузить чек

[`POST /shop/orders/{id}/receipts`](#загрузить-чек) принимает `multipart/form-data`.

| Поле | Обязательно | Значение |
| --- | --- | --- |
| `file` | да | Один бинарный файл до 3 MB; не JSON и не base64 |

```bash
curl "$BASE_URL/shop/orders/$ORDER_ID/receipts" \
  --header "Authorization: Bearer $SHOP_TOKEN" \
  --form "file=@/path/to/receipt.jpg"
```

Чек разрешён в `customer_confirm`, `trader_confirm`, `completed`, `cancelled`,
`dispute` и `error`. В `new`, `requisites` и `waiting_confirmation` API вернёт
`O10000`.

Загрузка удаляет ранее прикреплённые чеки этого ордера: храните `filename` из
нового списка, а не рассчитывайте на историю файлов.

| Статус до загрузки | Результат |
| --- | --- |
| `cancelled` | Ордер автоматически переходит в `dispute` с причиной `revert_cancelled`; статус `cancelled` больше нельзя считать финальным |
| `dispute` | Статус не меняется; новый чек добавляется в материалы текущего разбирательства |
| `customer_confirm`, `trader_confirm`, `completed`, `error` | Чек сохраняется, статус не меняется |

После перехода `cancelled → dispute` придёт уведомление. Повторно прочитайте ордер и
приостановите окончательное зачисление/возврат до разрешения диспута.

## Получить список

```bash
curl "$BASE_URL/shop/orders/$ORDER_ID/receipts" \
  --header "Authorization: Bearer $SHOP_TOKEN"
```

```json
[{ "filename": "receipt_20260314_120501.jpg" }]
```

## Получить временную ссылку

`filename` берётся из списка чеков.

```bash
curl --request POST "$BASE_URL/shop/orders/$ORDER_ID/receipts/url" \
  --header "Authorization: Bearer $SHOP_TOKEN" \
  --header "Content-Type: application/json" \
  --data '{ "filename": "receipt_20260314_120501.jpg" }'
```

Ответ: `{ "url": "https://..." }`. Ссылка действует 60 секунд. Метод не меняет
ордер и доступен независимо от его статуса, если файл существует.

## Удалить чек

```bash
curl --request POST "$BASE_URL/shop/orders/$ORDER_ID/remove-receipt" \
  --header "Authorization: Bearer $SHOP_TOKEN" \
  --header "Content-Type: application/json" \
  --data '{ "filename": "receipt_20260314_120501.jpg" }'
```

Успешный ответ: HTTP `200` с пустым телом.

Удаление файла не отменяет последствия его загрузки: ордер в `dispute` останется
в `dispute`. Для возврата в `cancelled` используйте
[`POST /shop/orders/{id}/dispute/cancel`](/doc/api/payin/06-disputes/#отменить-диспут).

## Поля оплаты

[`GET /shop/orders/{id}/payment-fields`](#поля-оплаты) возвращает переопределения полей для
конкретного ордера. Используйте `hidden`, `pattern`, `patternExample` и `maxLength`
при построении формы. Общая схема полей: [customerFields](/doc/v2/field-reference/).
