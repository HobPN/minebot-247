const mineflayer = require('mineflayer');

function createBot() {
    console.log("📡 Creating bot...");

    const bot = mineflayer.createBot({
        host: 'Blarena.aternos.me',
        port: 30517,
        username: 'MineBot',
        version: '1.21.4',
        auth: 'offline'
    });

    bot.once('spawn', () => {
        console.log("✅ Bot spawned");

        // Wait 5 seconds after spawn to send login and gamemode commands
        setTimeout(() => {
            bot.chat('/register 134266');
            bot.chat('/login 134266');
            bot.chat('/gamemode creative');
            console.log("🔐 Sent /login and /gamemode creative");
        }, 5000);
    });

    bot.on('message', (msg) => {
        const text = msg.toString();
        console.log("📩 Chat message:", text);

        // If the bot successfully logs in
        if (text.toLowerCase().includes('successfully logged in') || text.toLowerCase().includes('already logged in')) {
            console.log("🔓 Logged in confirmed ✅");
        }
    });

    bot.on('error', (err) => {
        console.error("❌ Bot error:", err.message);
        console.log("🔁 Retrying to connect...");
        setTimeout(createBot, 5000); // Retry to connect after 5 seconds
    });

    bot.on('end', () => {
        console.log("🔌 Disconnected from server.");
        console.log("🔁 Retrying to connect...");
        setTimeout(createBot, 5000); // Retry to connect after 5 seconds
    });

    bot.on('kicked', (reason) => {
        console.log("👢 Kicked from server:", reason);
        console.log("🔁 Retrying to connect...");
        setTimeout(createBot, 5000); // Retry to connect after 5 seconds
    });
}

createBot();
