class Player {
    constructor(name, color) {
        this.name = name;
        this.color = color;
        this.position = new THREE.Vector3();
        this.rotation = 0;
        this.health = 100;
        this.isDead = false;
        this.inventory = new Inventory();
        this.skills = [];
    }

    update(deltaTime) {
        // Update player state, handle movement, etc.
    }

    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
        if (this.health === 0) this.isDead = true;
    }

    heal(amount) {
        this.health = Math.min(100, this.health + amount);
    }

    // Additional methods for skills, inventory, etc.
} 