export const config = {
    api: {
        bodyParser: {
            sizeLimit: "10mb",
        },
    },
};

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { imageBase64, caption } = req.body;

        if (!imageBase64) {
            return res.status(400).json({ error: "No image received" });
        }

        const BOT_TOKEN = process.env.BOT_TOKEN;
        const CHAT_ID = process.env.CHAT_ID;

        if (!BOT_TOKEN || !CHAT_ID) {
            return res.status(500).json({ error: "Env variables not set" });
        }

        // base64 → Buffer
        const base64Data = imageBase64.replace(/^data:image\/png;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");

        // Используем встроенные FormData и Blob
        const formData = new FormData();
        formData.append("chat_id", CHAT_ID);
        formData.append("caption", caption || "");
        formData.append(
            "photo",
            new Blob([buffer], { type: "image/png" }),
            "attendance.png"
        );

        const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`;

        const tgResponse = await fetch(telegramUrl, {
            method: "POST",
            body: formData,
        });

        const tgResult = await tgResponse.json();

        if (!tgResult.ok) {
            console.error("Telegram API error:", tgResult);
            return res.status(500).json(tgResult);
        }

        return res.status(200).json({ success: true });
    } catch (err) {
        console.error("SERVER ERROR:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
