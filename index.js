const express = require('express');
const { Octokit } = require("@octokit/rest");

const app = express();
const PORT = process.env.PORT || 3000;

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = process.env.REPO_OWNER;
const REPO_NAME = process.env.REPO_NAME;
const LOG_FILE_PATH = 'ips.log';

if (!GITHUB_TOKEN || !REPO_OWNER || !REPO_NAME) {
    console.error("Gerekli ortam degiskenleri (GITHUB_TOKEN, REPO_OWNER, REPO_NAME) ayarlanmamis!");
    process.exit(1);
}

const octokit = new Octokit({ auth: GITHUB_TOKEN });

app.set('trust proxy', 1);

app.get('/', async (req, res) => {
    const ipAdresi = req.ip;
    const logEntry = `${new Date().toISOString()} - IP: ${ipAdresi}\n`;

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
            if (error.status !== 404) {
                throw error;
            }
        }

        const newContent = currentContent + logEntry;
        const newContentBase64 = Buffer.from(newContent).toString('base64');

        await octokit.repos.createOrUpdateFileContents({
            owner: REPO_OWNER,
            repo: REPO_NAME,
            path: LOG_FILE_PATH,
            message: `Yeni IP logu eklendi: ${ipAdresi}`,
            content: newContentBase64,
            sha: fileSha,
        });

        console.log(`IP basariyla GitHub'a kaydedildi: ${ipAdresi}`);
        res.send(`<h1>IP Adresiniz (${ipAdresi}) basariyla GitHub deposuna kaydedildi.</h1>`);

    } catch (error) {
        console.error("GitHub'a yazma hatasi:", error);
        res.status(500).send("IP adresi kaydedilirken bir hata olustu.");
    }
});

app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda baslatildi.`);
});
