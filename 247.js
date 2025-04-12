const mineflayer = require('mineflayer');
const vec3 = require('vec3');

let bot = null;

function createBot() {
    console.log("📡 Creating bot...");

    bot = mineflayer.createBot({
        host: 'Blarena.aternos.me',
        port: 30517,
        username: 'MineBot',
        version: '1.21.4',
        auth: 'offline'
    });

    const directions = ['forward', 'back', 'left', 'right'];

    async function placeAndBreakBlock() {
        try {
            const referenceBlock = bot.blockAt(bot.entity.position.offset(0, -1, 0));
            if (!referenceBlock) return console.log("🚫 No reference block found.");

            const targetPos = referenceBlock.position.offset(0, 1, 0);
            const grassItem = bot.inventory.items().find(item => item.name.includes('grass'));

            if (!grassItem) {
                bot.chat('/give @s grass_block 64');
                return;
            }

            await bot.equip(grassItem, 'hand');
            await bot.placeBlock(referenceBlock, vec3(0, 1, 0));
            console.log(`🧱 Placed grass at ${targetPos}`);

            setTimeout(async () => {
                const block = bot.blockAt(targetPos);
                if (block) {
                    await bot.dig(block);
                    console.log(`💥 Broke grass block at ${targetPos}`);
                }
            }, 500);
        } catch (err) {
            console.log("⚠️ Error placing or breaking:", err.message);
        }
    }

    function moveRandomly() {
        const dir = directions[Math.floor(Math.random() * directions.length)];
        const moveDuration = Math.random() * 4000 + 3000;

        bot.setControlState(dir, true);
        setTimeout(() => bot.setControlState(dir, false), moveDuration);

        const pos = bot.entity.position;
        console.log(`📍 Moving to approx: X=${pos.x.toFixed(2)}, Y=${pos.y.toFixed(2)}, Z=${pos.z.toFixed(2)}`);
        placeAndBreakBlock();
    }

    bot.once('spawn', () => {
        console.log("✅ Bot spawned");
        setTimeout(() => {
            bot.chat('/login 134266');
            bot.chat('/gamemode creative');
            console.log("🔐 Sent /login");
        }, 5000);
    });

    bot.on('message', (msg) => {
        const text = msg.toString();
        console.log("📩 Chat message:", text);

        if (text.toLowerCase().includes('successfully logged in')) {
            console.log("🔓 Logged in confirmed ✅");
            setInterval(moveRandomly, 5000);
        }
    });

    bot.on('error', (err) => {
        console.error("❌ Bot error:", err.message);
        handleReconnect(err.code === 'ECONNREFUSED' ? "🌐 Server offline or unreachable." : "⚠️ Bot crashed or kicked unexpectedly.");
    });

    bot.on('end', () => {
        console.log("🔌 Disconnected from server.");
        handleReconnect("🔁 Disconnected, retrying...");
    });

    bot.on('kicked', (reason) => {
        console.log("👢 Kicked from server:", reason);
        handleReconnect("🔁 Kicked, retrying...");
    });
}

// Handles bot reconnection
function handleReconnect(reason) {
    console.log(reason);
    if (bot) {
        try { bot.quit(); } catch (e) {}
        bot = null;
    }

    // Wait a few seconds before retrying
    setTimeout(() => {
        console.log("♻️ Reconnecting...");
        createBot();
    }, 10000); // 10 seconds
}

createBot();
