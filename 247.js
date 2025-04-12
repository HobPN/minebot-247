const mineflayer = require('mineflayer');
const vec3 = require('vec3');

function createBot() {
    console.log("📡 Creating bot...");

    const bot = mineflayer.createBot({
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
        }, 5000); // Wait 5 seconds after spawn
    });

    bot.on('message', (msg) => {
        const text = msg.toString();
        console.log("📩 Chat message:", text);

        if (text.toLowerCase().includes('successfully logged in')) {
            console.log("🔓 Logged in confirmed ✅");
            setInterval(moveRandomly, 5000); // Start moving after login
        }
    });

    let loginAttempts = 0;
    const maxAttempts = 5; // Reduce max attempts to 5 or any reasonable value

    bot.on('error', (err) => {
        console.error("❌ Bot error:", err.message);
        if (err.code === 'ECONNREFUSED') {
            console.log("🌐 Server offline or unreachable. Retrying in 10s...");
        } else {
            console.log("⚠️ Unknown error. Will retry.");
        }

        if (loginAttempts < maxAttempts) {
            //loginAttempts++;
            console.log(`🔁 Attempt ${loginAttempts}/${maxAttempts}`);
            setTimeout(createBot, 10000); // Retry after 10 seconds
        } else {
            console.log("💥 Max retries reached. Bot stopped.");
        }
    });

    bot.on('end', () => {
        console.log("🔌 Disconnected from server.");
        if (loginAttempts < maxAttempts) {
            //loginAttempts++;
            console.log(`🔁 Reconnecting in 5s... (Attempt ${loginAttempts}/${maxAttempts})`);
            setTimeout(createBot, 5000); // Retry after 5 seconds
        } else {
            console.log("💥 Max reconnect attempts hit. Exiting.");
        }
    });

    bot.on('kicked', (reason) => {
        console.log("👢 Kicked from server:", reason);
    });
}

createBot();
