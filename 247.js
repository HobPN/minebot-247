const mineflayer = require('mineflayer');

function createBot() {
    const bot = mineflayer.createBot({
        host: 'Blarena.aternos.me', // e.g., "play.aternos.me"
        port: 30517,            // default MC port
        username: 'MineBot',
        version: '1.21.4'   // any name
    });

    const directions = ['forward', 'back', 'left', 'right'];

    function moveRandomly() {
        const dir = directions[Math.floor(Math.random() * directions.length)];
        bot.setControlState(dir, true);
        setTimeout(() => bot.setControlState(dir, false), Math.random() * 3000 + 2000);

        if (Math.random() < 0.3) {
            bot.setControlState('jump', true);
            setTimeout(() => bot.setControlState('jump', false), 500);
        }
    }

    bot.once('spawn', () => {
        console.log("✅ Bot spawned!");
        setInterval(moveRandomly, 4000);
    });

    bot.on('end', () => {
        console.log("🔄 Reconnecting...");
        setTimeout(createBot, 5000);
    });

    bot.on('kicked', console.log);
    bot.on('error', console.log);
}

createBot();
