const mineflayer = require('mineflayer');

const observer = mineflayer.createBot({
    host: 'Blarena.aternos.me',
    port: 30517,
    username: 'TrackerBot',
    version: '1.21.4'
});

let lastPos = null;
let stillCounter = 0;

observer.once('spawn', () => {
    console.log('👁️ TrackerBot spawned, watching MineBot...');

    setInterval(() => {
        const target = observer.players['MineBot']?.entity;
        if (!target) {
            console.log("❓ Can't see MineBot yet...");
            return;
        }

        const pos = target.position;
        if (lastPos && pos.distanceTo(lastPos) < 0.01) {
            stillCounter++;
            if (stillCounter >= 5) {
                console.log('🛑 MineBot is not moving.');
                stillCounter = 0;
            }
        } else {
            console.log(`📍 MineBot moved to: x=${pos.x.toFixed(2)}, y=${pos.y.toFixed(2)}, z=${pos.z.toFixed(2)}`);
            stillCounter = 0;
        }

        lastPos = pos.clone();
    }, 3000); // Check every 3s
});

observer.on('error', console.log);
observer.on('end', () => console.log('❌ TrackerBot disconnected.'));