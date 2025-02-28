const express = require('express');
const WebSocket = require('ws');
const path = require('path');
const app = express();
const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server });

// Serve static files from the root directory
app.use(express.static('./'));

// Serve the game client
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Store players
const players = new Map();

wss.on('connection', (ws) => {
    let playerId = null;

    ws.on('message', (data) => {
        const message = JSON.parse(data);
        
        switch(message.type) {
            case 'register':
                playerId = Date.now().toString();
                players.set(playerId, {
                    id: playerId,
                    name: message.name,
                    x: message.x,
                    y: message.y,
                    z: message.z,
                    color: message.color,
                    rotation: message.rotation
                });
                ws.send(JSON.stringify({ type: 'registered', id: playerId }));
                broadcastPlayers();
                break;

            case 'update':
                if (playerId && players.has(playerId)) {
                    const player = players.get(playerId);
                    player.x = message.x;
                    player.y = message.y;
                    player.z = message.z;
                    player.rotation = message.rotation;
                    broadcastPlayers();
                }
                break;
        }
    });

    ws.on('close', () => {
        if (playerId) {
            players.delete(playerId);
            broadcastPlayers();
        }
    });

    function broadcastPlayers() {
        const data = JSON.stringify({
            type: 'players',
            players: Array.from(players.values())
        });
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(data);
            }
        });
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
}); 
