class Network {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.playerId = null;
        this.currentLobbyId = null;
    }

    connect() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws`; // Ensure this matches your server setup

        this.socket = new WebSocket(wsUrl);

        this.socket.onopen = () => {
            this.isConnected = true;
            console.log('WebSocket connected');
        };

        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
        };

        this.socket.onclose = () => {
            this.isConnected = false;
            console.log('WebSocket disconnected');
        };

        this.socket.onerror = (error) => {
            this.isConnected = false;
            console.error('WebSocket error:', error);
        };
    }
}