class GameServer {
    constructor() {
        this.players = new Map();
        this.wss = new WebSocket.Server({ server });
        this.setupWebSocket();
    }

    setupWebSocket() {
        this.wss.on('connection', (ws) => {
            let playerId = this.registerPlayer(ws);
            ws.on('message', (message) => this.handleMessage(playerId, message));
            ws.on('close', () => this.unregisterPlayer(playerId));
        });
    }

    registerPlayer(ws) {
        const playerId = Date.now().toString();
        this.players.set(playerId, new Player(`Player ${playerId}`, this.getRandomColor()));
        ws.send(JSON.stringify({ type: 'registered', id: playerId }));
        this.broadcastPlayers();
        return playerId;
    }

    handleMessage(playerId, message) {
        // Handle incoming messages from players
    }

    unregisterPlayer(playerId) {
        this.players.delete(playerId);
        this.broadcastPlayers();
    }

    broadcastPlayers() {
        const data = JSON.stringify({ type: 'players', players: Array.from(this.players.values()) });
        this.wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(data);
            }
        });
    }

    getRandomColor() {
        return '#' + Math.floor(Math.random() * 16777215).toString(16);
    }
} 