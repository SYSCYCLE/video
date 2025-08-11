// Gerekli kütüphaneyi "require" ile çağırıyoruz.
// Render, package.json sayesinde bu kütüphaneyi bizim için indirmiş olacak.
const express = require('express');

// Express uygulamasını oluşturuyoruz.
const app = express();

// Render'ın bize verdiği PORT numarasını kullanmalıyız.
// Eğer lokalde çalışıyorsak 3000 portunu kullanır.
const PORT = process.env.PORT || 3000;

// *** EN ÖNEMLİ KISIM ***
// Render gibi platformlarda gerçek IP adresini alabilmek için bu ayar zorunludur.
// Express'e, proxy'nin (Render'ın sunucusunun) verdiği IP bilgisine güvenmesini söylüyoruz.
app.set('trust proxy', 1);

// Ana sayfaya (/) bir GET isteği geldiğinde çalışacak kod.
app.get('/', (req, res) => {
  // 'req.ip' komutu sayesinde kullanıcının IP adresini alıyoruz.
  // 'trust proxy' ayarı sayesinde bu, gerçek IP adresi olacaktır.
  const ipAdresi = req.ip;

  // Yakalanan IP adresini konsola yazdıralım (Render loglarında görebilirsin).
  console.log(`Siteye giren kullanıcının IP Adresi: ${ipAdresi}`);

  // Yakalanan IP adresini ekrana HTML olarak yazdıralım.
  res.send(`
    <html>
      <head>
        <title>IP Adresi Yakalama</title>
        <style>
          body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #f0f0f0; }
          div { padding: 40px; background-color: white; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); text-align: center; }
          h1 { color: #333; }
          p { font-size: 1.5em; color: #555; background-color: #e7e7e7; padding: 10px; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div>
          <h1>IP Adresiniz Başarıyla Yakalandı!</h1>
          <p>${ipAdresi}</p>
        </div>
      </body>
    </html>
  `);
});

// Sunucuyu belirtilen portta dinlemeye başlatıyoruz.
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda başarıyla başlatıldı.`);
});
