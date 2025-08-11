const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', true);

app.get('/', (req, res) => {
    console.log("--- YENI ISTEK GELDİ ---");

    const ipBilgileri = {
      "req.ip (Express'in yorumu)": req.ip,
      "req.ips (Proxy zinciri)": req.ips,
      "HEADER: X-Forwarded-For": req.headers['x-forwarded-for'],
      "HEADER: X-Real-IP": req.headers['x-real-ip'],
      "HEADER: CF-Connecting-IP (Cloudflare varsa)": req.headers['cf-connecting-ip'],
      "req.socket.remoteAddress (Doğrudan bağlantı)": req.socket.remoteAddress,
    };
    
    console.log("Gelen IP Bilgileri:", JSON.stringify(ipBilgileri, null, 2));

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    let html = '<h1>IP Teşhis Raporu</h1>';
    html += '<p>Aşağıdaki bilgilerden hangisinde gerçek IP adresiniz görünüyor?</p>';
    html += '<table border="1" style="width:100%; border-collapse: collapse;">';
    html += '<tr style="background-color:#f0f0f0;"><th>Kaynak</th><th>Değer</th></tr>';
    
    for (const anahtar in ipBilgileri) {
        html += `<tr><td style="padding: 8px;"><b>${anahtar}</b></td><td style="padding: 8px; font-family: monospace;">${JSON.stringify(ipBilgileri[anahtar])}</td></tr>`;
    }
    
    html += '</table>';
    
    res.send(html);
});

app.listen(PORT, () => {
    console.log(`Teşhis sunucusu ${PORT} portunda başlatıldı.`);
});
