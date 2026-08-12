---
title: "PayIn API: диспуты"
---

Диспут означает, что отменённый платёж снова требует разбирательства. Пока ордер
находится в `dispute`, не считайте его окончательно отменённым и не выполняйте
необратимый возврат клиенту.

| Метод | Когда вызывать | Результат |
| --- | --- | --- |
| [`POST /shop/orders/{id}/dispute`](#открыть-диспут) | Ордер `cancelled`, но клиент утверждает, что перевёл деньги | `dispute`, `statusDetails: revert_cancelled`, уведомление |
| [`POST /shop/orders/external/{externalOrderId}/dispute`](#открыть-по-externalorderid) | То же, поиск по ID магазина | Тот же переход |
| [`POST /shop/orders/{id}/dispute/cancel`](#отменить-диспут) | Только `dispute`, если магазин отзывает претензию | `cancelled`, `statusDetails: shop`, уведомление |
| [`POST /shop/orders/external/{externalOrderId}/dispute/cancel`](#отменить-по-externalorderid) | То же, поиск по ID магазина | Тот же переход |

Открыть диспут можно только для отменённого ордера, которому ранее были назначены
реквизиты исполнителя или провайдера. Из другого статуса API вернёт `O10000`; если
назначения не было, диспут открыть нельзя.

## Открыть диспут

Тело — `multipart/form-data`.

| Поле | Обязательно | Значение и влияние |
| --- | --- | --- |
| `file` | нет | Чек до 3 MB. Прикрепляется к диспуту; ранее загруженный чек будет заменён |
| `amount` | нет | Положительная фактически переведённая сумма. Передавайте только при расхождении с `amount` ордера; значение учитывается при разборе суммы диспута |

```bash
curl "$BASE_URL/shop/orders/$ORDER_ID/dispute" \
  --header "Authorization: Bearer $SHOP_TOKEN" \
  --form "amount=1500" \
  --form "file=@/path/to/receipt.jpg"
```

Метод переводит ордер `cancelled → dispute`, отправляет уведомление и передаёт диспут
связанному провайдеру, если он есть. Из-за финансовой обработки переход может
быть отклонён, если освобождённые при отмене средства уже недоступны.

Тот же переход автоматически выполняет
[`POST /shop/orders/{id}/receipts`](/doc/api/payin/05-receipts-and-fields/#загрузить-чек),
если загрузить чек в ордере `cancelled`.

## Открыть по `externalOrderId`

```bash
curl "$BASE_URL/shop/orders/external/$EXTERNAL_ORDER_ID/dispute" \
  --header "Authorization: Bearer $SHOP_TOKEN" \
  --form "file=@/path/to/receipt.jpg"
```

Ограничения и результат совпадают с методом по внутреннему `id`.

## Отменить диспут

```bash
curl --request POST "$BASE_URL/shop/orders/$ORDER_ID/dispute/cancel" \
  --header "Authorization: Bearer $SHOP_TOKEN"
```

Разрешён только в `dispute`. Результат — `cancelled` с `statusDetails: shop` и
новое уведомление. Метод отзывает диспут, но не удаляет прикреплённый чек.

## Отменить по `externalOrderId`

```bash
curl --request POST \
  "$BASE_URL/shop/orders/external/$EXTERNAL_ORDER_ID/dispute/cancel" \
  --header "Authorization: Bearer $SHOP_TOKEN"
```

Ограничения и результат совпадают с методом по внутреннему `id`.
