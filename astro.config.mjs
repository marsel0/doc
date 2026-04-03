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
          label: 'Общее',
          items: [
            { label: 'Схема интеграции', link: '/docs/01-integration_guide/' },
            { label: 'Рандомизация', link: '/docs/03-randomization/' },
            { label: 'Антифрод', link: '/docs/04-antifrod/' },
            { label: 'Работа с магазином', link: '/docs/06-shop_management/' },
            { label: 'Ошибки и коды ответов', link: '/docs/02-api_error_guide/' },
          ],
        },
        {
          label: 'Payin',
          items: [
            { label: 'PAYIN: обзор и логика', link: '/payin/01-redirect_integration/' },
            { label: 'PAYIN: сценарии и curl-примеры', link: '/payin/02-integration/' },
            {
              label: 'PAYIN API',
              items: [
                { label: 'Обзор', link: '/api/payin/01-overview/' },
                { label: 'Создание и список ордеров', link: '/api/payin/02-orders/' },
                { label: 'Чтение ордеров', link: '/api/payin/03-read/' },
                { label: 'Действия над ордером', link: '/api/payin/04-actions/' },
                { label: 'Payment fields и receipts', link: '/api/payin/05-receipts-and-fields/' },
                { label: 'Dispute', link: '/api/payin/06-disputes/' },
                { label: 'Trade methods и спец. endpoint-ы', link: '/api/payin/07-auxiliary/' },
              ],
            },
          ],
        },
        {
          label: 'Payout',
          items: [
            { label: 'Интеграции PAYOUT', link: '/payout/01-integration/' },
            { label: 'PAYOUT: способы и API-примеры', link: '/payout/02-integration/' },
            {
              label: 'PAYOUT API',
              items: [
                { label: 'Обзор', link: '/api/payout/01-overview/' },
                { label: 'Создание и список ордеров', link: '/api/payout/02-orders/' },
                { label: 'Чтение и отмена', link: '/api/payout/03-read-and-cancel/' },
                { label: 'Trade methods и справочники', link: '/api/payout/04-dictionaries/' },
              ],
            },
          ],
        },
        {
          label: 'Дополнительно',
          items: [
            {
              label: 'Shop API',
              items: [
                { label: 'Обзор', link: '/api/shop/01-overview/' },
                { label: 'Баланс и выводы', link: '/api/shop/02-balances/' },
                { label: 'Информация и курсы', link: '/api/shop/03-info/' },
                { label: 'Trade methods и справочники', link: '/api/shop/04-dictionaries/' },
              ],
            },
            {
              label: 'Public API',
              items: [
                { label: 'Обзор', link: '/api/public/01-overview/' },
                { label: 'Справочники', link: '/api/public/02-dictionaries/' },
                { label: 'Платёжные helper endpoint-ы', link: '/api/public/03-payment-helpers/' },
              ],
            },
            { label: 'System API', link: '/api/system/01-overview/' },
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
