import * as THREE from 'three';

class PlayerEntity {
    constructor(playerId, position) {
        this.playerId = playerId;
        this.position = position; // Initial position of the player
        this.mesh = this.createPlayerMesh(); // Create the player's 3D mesh
        this.mesh.position.copy(position); // Set the initial position
    }

    createPlayerMesh() {
        // Create a simple geometry for the player (e.g., a box or sphere)
        const geometry = new THREE.BoxGeometry(1, 1.8, 0.5); // A simple box for the player
        const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 }); // Green color
        const mesh = new THREE.Mesh(geometry, material);
        
        // Optionally, add a name tag or other visual elements
        const nameTag = this.createNameTag();
        mesh.add(nameTag); // Attach the name tag to the player mesh

        return mesh;
    }

    createNameTag() {
        const nameTag = document.createElement('div');
        nameTag.textContent = this.playerId; // Display the player's ID or name
        nameTag.style.position = 'absolute';
        nameTag.style.color = 'white';
        nameTag.style.fontSize = '12px';
        nameTag.style.pointerEvents = 'none'; // Prevent mouse events on the name tag
        return nameTag;
    }

    update(deltaTime) {
        // Update player logic (e.g., animations, position updates)
        // For example, you could update the position based on network data
        this.mesh.position.copy(this.position); // Update mesh position
    }
}

export default PlayerEntity;