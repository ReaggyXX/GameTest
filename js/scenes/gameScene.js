import * as THREE from 'three';
import PlayerEntity from '../entities/playerEntity.js'; // Import the PlayerEntity class

class GameScene {
    constructor(game, ui, network) {
        this.game = game;
        this.ui = ui;
        this.network = network;
        this.scene = new THREE.Scene();
        this.sceneKey = "game";

        // Ground setup
        const groundGeometry = new THREE.PlaneGeometry(100, 100);
        const groundMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, side: THREE.DoubleSide });
        this.ground = new THREE.Mesh(groundGeometry, groundMaterial);
        this.ground.rotation.x = -Math.PI / 2;
        this.scene.add(this.ground);

        // Lighting setup
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(1, 1, 1);
        this.scene.add(directionalLight);

        // Player management
        this.players = {}; // Store other players
    }

    show() {
        this.ui.showGameUI();
    }

    hide() {
        this.ui.hideGameUI();
    }

    update(deltaTime) {
        this.updatePlayers(deltaTime);
    }

    updatePlayers(deltaTime) {
        // Update local player
        if (this.game.player) {
            this.game.player.update(deltaTime);
        }

        // Update other players
        for (const playerId in this.players) {
            const player = this.players[playerId];
            player.update(deltaTime);
        }
    }

    onSceneActivated() {
        window.gameInstance = this.game;
        window.uiInstance = this.ui;
    }

    onWindowResize(renderer) {
        // Handle window resize for game scene if needed.
    }

    spawnPlayer(playerId, position) {
        const playerEntity = new PlayerEntity(playerId, position);
        this.players[playerId] = playerEntity;
        this.scene.add(playerEntity.mesh);
    }

    removePlayer(playerId) {
        const player = this.players[playerId];
        if (player) {
            this.scene.remove(player.mesh);
            delete this.players[playerId];
        }
    }
}

export default GameScene;