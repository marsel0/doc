---
title: "Public API: платёжные helper endpoint-ы"
pagefind: false
---

## GET `/order-requisites/{id}/qr-code`

Получить QR-код по реквизитам PayIn-ордера.

## GET `/order-requisites/{id}/nspk-details`

Получить NSPK-детали для реквизитов PayIn-ордера.

## GET `/payment/sberpay/{id}`

Получить ссылку или данные для `sberpay`-сценария.

## Когда это нужно

Эти endpoint-ы используются только в проектах, где merchant-frontend сам дорисовывает специальные платёжные сценарии.
