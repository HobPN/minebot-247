const mineflayer = require('mineflayer');
const vec3 = require('vec3');

function createBot() {
    console.log("📡 Creating bot...");

    // Include auth: 'offline' for cracked servers
    const bot = mineflayer.createBot({
        host: 'Blarena.aternos.me',
        port: 30517,
        username: 'MineBot',
        //version: '1.21.4',
        auth: 'offline'
    });

    const directions = ['forward', 'back', 'left', 'right'];

    // Moved inside so that `bot` is available in this function.
    async function placeAndBreakBlock() {
        try {
            // Get the block below the bot.
            const referenceBlock = bot.blockAt(bot.entity.position.offset(0, -1, 0));
            if (!referenceBlock) {
                console.log("🚫 No reference block found.");
                return;
            }
            const targetPos = referenceBlock.position.offset(0, 1, 0);

            // Look for a grass block in the inventory.
            const grassItem = bot.inventory.items().find(item => item.name.includes('grass'));
            if (!grassItem) return console.log("🚫 No grass block in inventory.");

            // Equip and place the grass block.
            await bot.equip(grassItem, 'hand');
            await bot.placeBlock(referenceBlock, vec3(0, 1, 0));
            console.log(`🧱 Placed grass at ${targetPos}`);

            // Delay then dig the placed block.
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

        const shouldSprint = Math.random() < 0.6;
        if (shouldSprint) {
            bot.setControlState('sprint', true);
            console.log(`💨 Sprinting ${dir} for ${moveDuration.toFixed(0)}ms`);
        } else {
            console.log(`🚶 Walking ${dir} for ${moveDuration.toFixed(0)}ms`);
        }

        bot.setControlState(dir, true);

        if (Math.random() < 0.3) {
            const strafeDir = Math.random() < 0.5 ? 'left' : 'right';
            bot.setControlState(strafeDir, true);
            setTimeout(() => bot.setControlState(strafeDir, false), moveDuration);
        }

        if (Math.random() < 0.4) {
            const jumpTimes = Math.floor(Math.random() * 3) + 1;
            for (let i = 0; i < jumpTimes; i++) {
                setTimeout(() => {
                    bot.setControlState('jump', true);
                    setTimeout(() => bot.setControlState('jump', false), 300);
                }, i * 800);
            }
        }

        // Stop the movement after moveDuration milliseconds.
        setTimeout(() => {
            bot.setControlState(dir, false);
            if (shouldSprint) bot.setControlState('sprint', false);
        }, moveDuration);

        const pos = bot.entity.position;
        console.log(`📍 Moving to approx: X=${pos.x.toFixed(2)}, Y=${pos.y.toFixed(2)}, Z=${pos.z.toFixed(2)}`);

        // Call the block placement/digging routine.
        placeAndBreakBlock();
    }

    bot.once('spawn', () => {
        console.log("✅ Bot spawned!");
        setInterval(moveRandomly, 5000);
    });

    bot.on('login', () => {
        console.log("🔓 Bot logged in!");
    });

    bot.on('error', (err) => {
        console.error("❌ Bot error:", err);
    });

    bot.on('end', () => {
        console.log("🔄 Bot disconnected. Reconnecting in 5s...");
        setTimeout(createBot, 5000);
    });

    bot.on('kicked', (reason) => {
        console.log("👢 Bot was kicked:", reason);
    });
}

createBot();
