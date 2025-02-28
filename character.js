class Character {
    constructor(name, color) {
        // Basic info
        this.name = name;
        this.color = color;
        
        // Stats
        this.level = 1;
        this.experience = 0;
        this.experienceToNextLevel = 100;
        
        // Health
        this.maxHealth = 100;
        this.currentHealth = 100;
        this.healthRegen = 1; // per second
        
        // Mana
        this.maxMana = 50;
        this.currentMana = 50;
        this.manaRegen = 0.5; // per second
        
        // Combat stats
        this.strength = 10;
        this.defense = 5;
        this.speed = 10;
        
        // Inventory and equipment
        this.inventory = [];
        this.equipment = {
            weapon: null,
            armor: null,
            helmet: null,
            boots: null
        };
        
        // Skills and abilities
        this.skills = [];
        this.abilities = [];
        
        // Last update timestamp for regeneration
        this.lastUpdateTime = Date.now();
    }
    
    update() {
        const now = Date.now();
        const deltaTime = (now - this.lastUpdateTime) / 1000; // Convert to seconds
        this.lastUpdateTime = now;
        
        // Regenerate health and mana over time
        this.regenerate(deltaTime);
        
        // Check for level up
        this.checkLevelUp();
    }
    
    regenerate(deltaTime) {
        // Health regeneration
        if (this.currentHealth < this.maxHealth) {
            this.currentHealth = Math.min(
                this.maxHealth, 
                this.currentHealth + (this.healthRegen * deltaTime)
            );
        }
        
        // Mana regeneration
        if (this.currentMana < this.maxMana) {
            this.currentMana = Math.min(
                this.maxMana,
                this.currentMana + (this.manaRegen * deltaTime)
            );
        }
    }
    
    gainExperience(amount) {
        this.experience += amount;
        this.checkLevelUp();
        return this.experience;
    }
    
    checkLevelUp() {
        if (this.experience >= this.experienceToNextLevel) {
            this.levelUp();
            return true;
        }
        return false;
    }
    
    levelUp() {
        this.level++;
        this.experience -= this.experienceToNextLevel;
        this.experienceToNextLevel = Math.floor(this.experienceToNextLevel * 1.5);
        
        // Increase stats
        this.maxHealth += 10;
        this.currentHealth = this.maxHealth;
        this.maxMana += 5;
        this.currentMana = this.maxMana;
        this.strength += 2;
        this.defense += 1;
        this.speed += 1;
        
        // Increase regeneration rates
        this.healthRegen += 0.2;
        this.manaRegen += 0.1;
        
        return this.level;
    }
    
    takeDamage(amount) {
        const actualDamage = Math.max(1, amount - this.defense / 2);
        this.currentHealth = Math.max(0, this.currentHealth - actualDamage);
        return actualDamage;
    }
    
    heal(amount) {
        this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);
        return this.currentHealth;
    }
    
    useMana(amount) {
        if (this.currentMana >= amount) {
            this.currentMana -= amount;
            return true;
        }
        return false;
    }
    
    addToInventory(item) {
        this.inventory.push(item);
    }
    
    removeFromInventory(itemIndex) {
        if (itemIndex >= 0 && itemIndex < this.inventory.length) {
            return this.inventory.splice(itemIndex, 1)[0];
        }
        return null;
    }
    
    equipItem(item, slot) {
        if (this.equipment[slot] !== undefined) {
            const oldItem = this.equipment[slot];
            this.equipment[slot] = item;
            return oldItem;
        }
        return null;
    }
    
    unequipItem(slot) {
        if (this.equipment[slot] !== undefined) {
            const item = this.equipment[slot];
            this.equipment[slot] = null;
            return item;
        }
        return null;
    }
    
    learnSkill(skill) {
        this.skills.push(skill);
    }
    
    learnAbility(ability) {
        this.abilities.push(ability);
    }
    
    // Get character data for saving or sending to server
    toJSON() {
        return {
            name: this.name,
            color: this.color,
            level: this.level,
            experience: this.experience,
            experienceToNextLevel: this.experienceToNextLevel,
            maxHealth: this.maxHealth,
            currentHealth: this.currentHealth,
            healthRegen: this.healthRegen,
            maxMana: this.maxMana,
            currentMana: this.currentMana,
            manaRegen: this.manaRegen,
            strength: this.strength,
            defense: this.defense,
            speed: this.speed,
            inventory: this.inventory,
            equipment: this.equipment,
            skills: this.skills,
            abilities: this.abilities
        };
    }
    
    // Load character data from saved data or server
    static fromJSON(data) {
        const character = new Character(data.name, data.color);
        
        character.level = data.level || 1;
        character.experience = data.experience || 0;
        character.experienceToNextLevel = data.experienceToNextLevel || 100;
        
        character.maxHealth = data.maxHealth || 100;
        character.currentHealth = data.currentHealth || character.maxHealth;
        character.healthRegen = data.healthRegen || 1;
        
        character.maxMana = data.maxMana || 50;
        character.currentMana = data.currentMana || character.maxMana;
        character.manaRegen = data.manaRegen || 0.5;
        
        character.strength = data.strength || 10;
        character.defense = data.defense || 5;
        character.speed = data.speed || 10;
        
        character.inventory = data.inventory || [];
        character.equipment = data.equipment || {
            weapon: null,
            armor: null,
            helmet: null,
            boots: null
        };
        
        character.skills = data.skills || [];
        character.abilities = data.abilities || [];
        
        return character;
    }
}

// If running in Node.js environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Character;
} 
