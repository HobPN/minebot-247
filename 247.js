const mineflayer = require('mineflayer');
const vec3 = require('vec3');


function createBot() {
    console.log("📡 Creating bot...");

    let loginAttempts = 0;
    let isLoggedIn = false;
    let loginTimeout;

    const bot = mineflayer.createBot({
        host: 'Blarena.aternos.me',
        port: 30517,
        username: 'MineBot',
        version: '1.21.4',
        auth: 'offline'
    });

    const directions = ['forward', 'back', 'left', 'right'];
    let gamemode = 'creative';

    //function switchGamemode() {
        //gamemode = gamemode === 'creative' ? 'survival' : 'creative';
        //const cmd = `/gamemode creative`;
        //bot.chat(cmd);
       // console.log(`🎮 Switched to creative`);
   // }

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

        setTimeout(() => {
            bot.setControlState(dir, false);
            if (shouldSprint) bot.setControlState('sprint', false);
        }, moveDuration);

        const pos = bot.entity.position;
        console.log(`📍 Moving to approx: X=${pos.x.toFixed(2)}, Y=${pos.y.toFixed(2)}, Z=${pos.z.toFixed(2)}`);

        placeAndBreakBlock();

       // if (Math.random() < 0.25) {
         //   bot.chat('/gamemode creative');
        //}
    //}

    bot.once('spawn', () => {
        console.log("✅ Bot spawned");

        loginTimeout = setTimeout(() => {
            if (!isLoggedIn) {
                console.log("⏳ Login timeout. Bot stuck or ignored. Reconnecting...");
                bot.quit();
            }
        }, 10000); // 10 seconds to login

        setTimeout(() => {
            bot.chat('/login 134266');
            bot.chat('/gamemode creative');
            console.log("🔐 Sent /login");
        }, 5000); // Wait 5 seconds after spawn
        
    });

    bot.on('message', (msg) => {
        const text = msg.toString();
        console.log("📩 Chat message:", text);

        if (text.toLowerCase().includes('successfully logged in') || text.toLowerCase().includes('already logged in')) {
            isLoggedIn = true;
            clearTimeout(loginTimeout);
            console.log("🔓 Logged in confirmed ✅");

            // Start moving after login
            setInterval(moveRandomly, 5000);
        }
    });

    bot.on('error', (err) => {
        console.error("❌ Bot error:", err.message);
        if (err.code === 'ECONNREFUSED') {
            console.log("🌐 Server offline or unreachable. Retrying in 10s...");
        } else {
            console.log("⚠️ Unknown error. Will retry.");
        }

        if (loginAttempts < 5) {
            loginAttempts++;
            setTimeout(createBot, 10000);
        } else {
            console.log("💥 Max retries reached. Bot stopped.");
        }
    });

    bot.on('end', () => {
        console.log("🔌 Disconnected from server.");
        if (loginAttempts < 5) {
            loginAttempts++;
            console.log(`🔁 Reconnecting in 5s... (Attempt ${loginAttempts}/5)`);
            setTimeout(createBot, 5000);
        } else {
            console.log("💥 Max reconnect attempts hit. Exiting.");
        }
    });

    bot.on('kicked', (reason) => {
        console.log("👢 Kicked from server:", reason);
    });
}

createBot();
