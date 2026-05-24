# BLANCH Family Site

Темный статический сайт семьи BLANCH для GTA 5 RP с Discord OAuth gate, неоновым оформлением, дождем, фотоальбомом и карточками состава.

## Discord OAuth

1. Создайте приложение в Discord Developer Portal.
2. Вставьте Client ID в `script.js`:

```js
const DISCORD_CLIENT_ID = "YOUR_CLIENT_ID";
```

3. Добавьте URL сайта в OAuth2 Redirects.
4. Откройте сайт через `http://` или `https://`, потому что Discord OAuth не работает через `file://`.

## Локальный запуск

```bash
python -m http.server 4173 --bind 127.0.0.1
```

После запуска откройте `http://127.0.0.1:4173`.
