# Новый сайт rentwheelchair.ru — прокат инвалидных колясок

Стек: **Astro 7 + Tailwind CSS 4 + Three.js** (3D-колесо в первом экране). Статический сайт — заливается на любой хостинг.

## Как собрать
```
npm install
npm run dev      # локальный просмотр: http://localhost:4321
npm run build    # готовый сайт появится в папке dist/
```
Папку `dist/` целиком загрузить в корень хостинга (ISPmanager / Timeweb / reg.ru и т.п.).

## Где что менять
- `src/data/site.ts` — телефон, WhatsApp, Telegram, почта, **цены**, модели колясок, преимущества, отзывы, вопросы-ответы. Поменяли здесь — поменялось на всех страницах.
- `src/data/articles.ts` — SEO-статьи.
- `public/img/` — фото колясок (вырезаны на прозрачный фон, .webp).
- Счётчики Яндекс.Метрики / VK Pixel — вставить в `src/layouts/Base.astro` (место отмечено комментарием).

## Страницы (SEO)
/ · /katalog/ · /katalog/ortonica/ · /katalog/ottobock-start/ · /ceny/ · /dostavka/ · /arenda-na-mesyac/ · /faq/ · /kontakty/ · /stati/ · 2 статьи · 404
Уникальные title/description/keywords, canonical, Open Graph, микроразметка JSON-LD (LocalBusiness, Service+Offer, Product, FAQPage, BreadcrumbList, Article), sitemap-index.xml, robots.txt.

## Что уточнить у клиента
1. Фото Ottobock Старт (сейчас стоит иллюстрация).
2. Цены: на старом сайте «300 ₽/день» и «3 дня = 1500 ₽» — в калькуляторе так: 3 дня 1500 ₽, далее 300 ₽/день, от 30 дней 200 ₽/день.
3. Адрес самовывоза и график работы — на старом сайте их нет (для Яндекс.Карт и SEO очень желательно).
4. Отзывы пересказаны по скриншотам переписок со старого сайта — согласовать.
5. Заявка из формы подбора открывает WhatsApp с готовым текстом (или Telegram-бот). Если нужна отправка прямо в Telegram-бот без мессенджера — нужен токен бота и небольшой серверный скрипт.
- Демо: GitHub Actions собирает сайт и выкладывает на GitHub Pages (robots запрещает индексацию демо).
