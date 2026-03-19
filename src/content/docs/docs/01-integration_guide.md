---
title: "Схема интеграции"
tableOfContents: false
---

Эта страница описывает, как подключать `simple-pay` на уровне проекта: от первого запроса с доменом и ключами до получения статусов ордеров и управления дальнейшими действиями.

## 1. Что должно быть у интегратора на старте

Минимальный набор:

- домен инстанса `simple-pay`;
- `Shop API key`;
- `Balance API key`;
- `Signature key` для callback.

В рамках этой документации считается, что все ключи уже получены, включая `Signature key`, поэтому callback рассматривается как обязательная часть нормальной интеграции, а polling через `GET` остаётся резервным каналом контроля.

## 2. Как собрать `BASE_URL`

Если ваш инстанс доступен, например, по домену `[[DOMAIN_URL]]`, merchant API обычно вызывается по пути:

```bash
export DOMAIN="[[DOMAIN_URL]]"
export BASE_URL="$DOMAIN/public/api/v1"
export SHOP_TOKEN="<SHOP_API_KEY>"
export BALANCE_TOKEN="<BALANCE_API_KEY>"
export SIGNATURE_KEY="<SIGNATURE_KEY>"
```

Все примеры в документации используют именно этот `BASE_URL`.

## 3. Первый тестовый запрос

Сразу после получения ключей проверьте доступ к магазину:

```bash
curl --location "$BASE_URL/shop/info" \
  --header "Authorization: Bearer $SHOP_TOKEN"
```

Если ключ валиден, вы получите базовую информацию о магазине: `id`, `name`, `status`, `fiatCurrency`, `assetCurrency`.

Это лучший первый запрос для проверки:

- домена;
- `Shop API key`;
- сетевого доступа;
- того, что вы попали в нужное окружение.

## 4. Какие ключи для чего нужны

### `Shop API key`

Используется для:

- `payin`-ордеров;
- `payout`-ордеров;
- чтения ордеров;
- trade methods;
- shop info и exchange.

Передаётся так:

```http
Authorization: Bearer <SHOP_API_KEY>
```

### `Balance API key`

Используется только для:

- `GET /shop/assets`
- `POST /shop/assets/withdrawals`
- `GET /shop/assets/withdrawals/{id}`

### `Signature key`

Используется для проверки подлинности callback, которые платформа отправляет на ваш `callbackUrl`.

## 5. Что можно сделать, имея только домен и ключи

### Для `payin`

Вы можете:

- получить доступные методы оплаты;
- создать redirect-ордер;
- создать H2H-ордер с реквизитами;
- читать ордер по `id` или `externalOrderId`;
- обновлять payment-данные;
- запускать поиск реквизитов;
- подтверждать оплату;
- отменять ордер;
- работать с dispute и чеками.

### Для `payout`

Вы можете:

- получить доступные методы выплат;
- создать payout-ордер;
- читать payout по `id` или `externalOrderId`;
- отменять payout-ордер, если его статус допускает отмену.

### Для магазина

Вы можете:

- проверить магазин и курсы;
- прочитать баланс;
- создать заявку на вывод средств магазина.

## 6. Важное различие: “изменить статус” и “выполнить действие”

В `simple-pay` мерчант не выставляет `status` напрямую.

Нельзя сделать так:

```json
{ "status": "completed" }
```

Правильная модель:

- вы вызываете action-метод;
- платформа переводит ордер в следующий допустимый статус.

Примеры:

- `POST /shop/orders/{id}/start-payment`
- `POST /shop/orders/{id}/confirm-payment`
- `POST /shop/orders/{id}/cancel`
- `POST /shop/orders/{id}/dispute`
- `POST /shop/orders/{id}/dispute/cancel`
- `POST /shop/payout-orders/{id}/cancel`

То есть управлять можно бизнес-действиями, а не произвольной записью статуса.

## 7. Какие сценарии интеграции есть

| Сценарий | Когда использовать | Основные методы |
| --- | --- | --- |
| `PayIn Redirect` | клиент может быть переадресован на платёжную страницу `simple-pay` | `POST /shop/orders` |
| `PayIn H2H sync requisites` | клиент остаётся на вашем UI, а реквизиты нужны сразу | `GET /shop/trade-methods`, `POST /shop/orders/sync-requisites` |
| `PayIn H2H step-by-step` | способ оплаты выбирается уже после создания ордера | `POST /shop/orders`, `PATCH /shop/orders/{id}`, `POST /shop/orders/{id}/start-payment`, `POST /shop/orders/{id}/confirm-payment` |
| `Payout H2H` | вы создаёте выплаты и отслеживаете их статус | `GET /shop/trade-methods/payout`, `POST /shop/payout-orders` |

## 8. Как выбрать подходящий сценарий

### Redirect PAYIN

Используйте, если:

- клиента можно увести на внешнюю платёжную страницу;
- не нужно показывать реквизиты на своей стороне;
- нужен самый короткий запуск.

### H2H PAYIN с реквизитами сразу

Используйте `POST /shop/orders/sync-requisites`, если:

- клиент остаётся на вашем сайте;
- метод оплаты известен заранее;
- реквизиты нужны сразу в ответе.

### H2H PAYIN по шагам

Используйте связку `create -> update -> start-payment -> confirm-payment`, если:

- способ оплаты выбирается позже;
- вы хотите управлять шагами UI отдельно;
- вам нужно сначала создать ордер, а потом дать пользователю выбрать метод.

### PAYOUT

Для payout базовый сценарий всегда H2H:

1. прочитать trade methods;
2. собрать `customer.requisites`;
3. создать payout;
4. ждать callback или читать статус через `GET`.

## 9. Рекомендуемый порядок подключения

### Быстрый путь для новичка

1. Соберите `BASE_URL`.
2. Проверьте `GET /shop/info`.
3. Реализуйте `callbackUrl` и проверку `signature`.
4. Получите `GET /shop/trade-methods` или `GET /shop/trade-methods/payout`.
5. Создайте первый ордер с `externalOrderId`.
6. Используйте `GET`-чтение статуса как резервный канал.

### Production-путь

1. Настроить магазин и ключи.
2. Реализовать callback-обработчик.
3. Реализовать проверку `signature`.
4. Логировать `id`, `externalOrderId`, `status`, `statusDetails`.
5. Хранить связку своего бизнес-ID с `externalOrderId` и внутренним `id` ордера.
6. Использовать polling как резервный сценарий.

## 10. Что хранить у себя

Минимальный набор полей:

- ваш внутренний бизнес-ID;
- `integration.externalOrderId`;
- `id` ордера в `simple-pay`;
- `amount` и `initialAmount` для `payin`;
- `status` и `statusDetails`;
- `integration.callbackUrlStatus`, если используете callback.

## 11. Как получать статусы

Есть два рабочих способа.

### Через callback

Если у ордера указан `integration.callbackUrl`, платформа пришлёт callback при смене статуса.

Что важно:

- `callbackMethod` может быть `post` или `get`;
- даже при `post` параметры статуса передаются в query string;
- тело запроса пустое;
- callback может прийти повторно;
- обработчик должен быть идемпотентным.

### Через polling

Polling нужен как резервный канал, если:

- callback ещё не доставлен;
- нужно перепроверить спорный статус;
- нужно восстановить состояние после таймаута или сетевого сбоя.

Для этого читайте ордер через:

- `GET /shop/orders/{id}`
- `GET /shop/orders/external/{externalOrderId}`
- `GET /shop/payout-orders/{id}`
- `GET /shop/payout-orders/external/{externalOrderId}`

## 12. Подготовка callback и подписи

Пример callback:

```text
[[CALLBACK_URL]]?id=94215bfb-1963-4a41-9686-f90412e0a58f&amount=1500&customerId=order-10002&status=completed&externalOrderId=merchant-10002&signature=8f3e...
```

Для `cancelled` и `dispute` дополнительно может приходить `statusDetails`.

Если на магазине включён расширенный webhook, могут добавляться:

- `assetCurrencyAmount`
- `shopFee`
- `currencyRate`
- для `payin` ещё `disputeAmount` и `statusReason`

### Проверка подписи

`signature` считается как `sha1` от всех параметров callback, кроме самой `signature`, плюс `signatureKey`.

Алгоритм:

1. взять все параметры callback;
2. убрать `signature`;
3. добавить виртуальный ключ `signatureKey`;
4. отсортировать ключи по алфавиту;
5. собрать строку `key=value` через `|`;
6. пропустить `null` значения;
7. посчитать `sha1`.

Пример:

```javascript
import sha1 from "sha1";

function getSignature(payload, signatureKey) {
  const keys = [...Object.keys(payload), "signatureKey"].sort();
  const stringToSign = keys
    .map((key) => {
      const value = key === "signatureKey" ? signatureKey : payload[key];
      return value == null ? null : `${key}=${value}`;
    })
    .filter(Boolean)
    .join("|");

  return sha1(stringToSign);
}
```

## 13. `Customer API` и когда он нужен

`Customer API` не создаёт ордеры, но полезен, если клиентский frontend должен самостоятельно продолжать flow после создания ордера.

Особенности:

- логин через `POST /customer/auth/login`;
- нужен `orderId` и `integration.token`;
- `accessToken` живёт `30` минут;
- доступ к завершённому ордеру сохраняется ещё `24` часа после финального статуса.

Это удобно, если вы не хотите отдавать `Shop API key` в браузер.

## 14. Практические тонкости

### `externalOrderId` лучше считать обязательным

Технически поле опционально, но для production его стоит передавать всегда. Оно нужно, чтобы:

- переживать таймауты;
- безопасно делать повторные проверки;
- не дублировать ордера;
- быстро искать ордер по вашему внутреннему бизнес-ID.

### После `S10002` нельзя создавать новый ордер вслепую

`S10002` означает таймаут ответа, а не гарантированную неудачу операции.

Правильное действие:

1. искать ордер по `externalOrderId`;
2. только если ордер не найден, решать вопрос о повторном create.

### Для `payin` клиенту нужно показывать именно `amount`

Если включена уникализация:

- `initialAmount` это исходная сумма;
- `amount` это фактическая сумма к оплате.

### Для `payout` `201 Created` не означает финальный успех

После создания payout ордер обычно переходит в `requisites`. Это нормальный рабочий промежуточный статус.

## 15. Какие страницы смотреть дальше

- [Работа с магазином](/doc/docs/06-shop_management/)
- [Интеграции PAYIN](/doc/payin/01-redirect_integration/)
- [PAYIN: способы и API-примеры](/doc/payin/02-integration/)
- [Интеграции PAYOUT](/doc/payout/01-integration/)
- [PAYOUT: способы и API-примеры](/doc/payout/02-integration/)
- [Ошибки и коды ответов](/doc/docs/02-api_error_guide/)
