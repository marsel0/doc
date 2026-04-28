// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// плагины для заголовков
import remarkSlug from 'remark-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

export default defineConfig({
  base: '/doc/', // Указываем имя репозитория с косой чертой
  site: 'https://marsel0.github.io/doc/', // URL сайта на GitHub Pages
  integrations: [
    starlight({
      title: '[[PROJECT_NAME]] Docs',
      customCss: ['./src/styles/global.css'],
      tableOfContents: {
        minHeadingLevel: 2,
        maxHeadingLevel: 3,
      },
      sidebar: [
        {
          label: 'V2: запуск мерчанта',
          items: [
            { label: 'Интеграция: старт и выбор сценария', link: '/v2/integration/' },
            {
              label: 'PayIn: приём платежей',
              items: [
                {
                  label: 'Redirect: переход на платёжную страницу',
                  link: '/v2/red/',
                },
                {
                  label: 'H2H sync requisites: реквизиты сразу',
                  link: '/v2/h2h-sync/',
                },
                {
                  label: 'H2H step-by-step: выбор после создания ордера',
                  link: '/v2/h2h-step/',
                },
              ],
            },
            {
              label: 'PayOut: выплаты клиенту',
              items: [
                { label: 'Payout H2H', link: '/v2/payout/' },
              ],
            },
            { label: 'Примеры API: все сценарии', link: '/v2/examples/' },
          ],
        },
        {
          label: 'V2: дополнительные материалы',
          items: [
            { label: 'Системная информация: test, prod, demo', link: '/v2/system-info/' },
            { label: 'Shop API: магазин, баланс, методы', link: '/v2/shop-api/' },
            { label: 'Public API: справочники и helper endpoint-ы', link: '/v2/public-api/' },
            { label: 'Выбор банка и типа оплаты', link: '/v2/payment-methods/' },
            { label: 'Поля реквизитов и customerFields', link: '/v2/field-reference/' },
            { label: 'PayIn: статусы и переходы', link: '/v2/payin-statuses/' },
            { label: 'PayIn: диспуты', link: '/v2/payin-disputes/' },
            { label: 'PayIn: чеки', link: '/v2/payin-receipts/' },
            { label: 'Payout: статусы и переходы', link: '/v2/payout-statuses/' },
            { label: 'Callback и подпись', link: '/v2/callback-signature/' },
            { label: 'Типовые ошибки', link: '/v2/errors/' },
          ],
        },
      ],
    }),
  ],

  markdown: {
    remarkPlugins: [
      remarkSlug, // генерирует id для заголовков
    ],
    rehypePlugins: [
      [
        rehypeAutolinkHeadings,
        {
          behavior: 'append', // ссылка в конец заголовка
          properties: {
            class: 'anchor-link',
            ariaHidden: 'true',
          },
        },
      ],
      () => {
        return (tree) => {
          const base = '/doc/'; // Используем Astro.base для корректного пути
          tree.children.unshift({
            type: 'element',
            tagName: 'script',
            properties: { src: `${base}q.js`, type: 'module' },
            children: [],
          });
        };
      },
    ],
  },
});
