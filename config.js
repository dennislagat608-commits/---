
### **9. Example Commands in `/commands/`**

#### `/commands/general/menu.js`
```javascript
import config from '../../config.js';
export default {
  name: 'menu',
  alias: ['help'],
  run: async({sock, m, reply}) => {
    const txt = `*${config.BOT_NAME} V${config.VERSION}*

*GENERAL* /start /help /ping /version
*FONTS* /bold /italic /zalgo /random
*AI* /gpt /gptimg /gptclear
*GROUP* /kick /ban /mute /warn /promote
*DOWNLOAD* /ytmp3 /ytmp4 /tiktok /ig
*TOOLS* /weather /translate /qr /sticker
*FUN* /meme /8ball /dice /trivia
*DATING* /marry /waifu /match /rizz

Total: 200+ cmds. Type /cmdname to use.`;
    reply(txt);
  }
}
