class Inventory {
    constructor() {
        this.items = [];
        this.maxSlots = 20;
        this.isOpen = false;
        this.selectedSlot = -1;
        
        // Create UI elements
        this.createUI();
        
        // Bind keyboard events
        document.addEventListener('keydown', (e) => {
            if (e.code === 'KeyI') {
                this.toggleInventory();
            }
        });
    }
    
    createUI() {
        // Create main inventory container
        this.container = document.createElement('div');
        this.container.id = 'inventoryContainer';
        this.container.style.position = 'absolute';
        this.container.style.top = '50%';
        this.container.style.left = '50%';
        this.container.style.transform = 'translate(-50%, -50%)';
        this.container.style.width = '400px';
        this.container.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        this.container.style.border = '2px solid #444';
        this.container.style.borderRadius = '5px';
        this.container.style.padding = '10px';
        this.container.style.display = 'none';
        this.container.style.zIndex = '1000';
        this.container.style.color = 'white';
        
        // Create header
        const header = document.createElement('div');
        header.style.borderBottom = '1px solid #444';
        header.style.paddingBottom = '10px';
        header.style.marginBottom = '10px';
        header.style.fontSize = '20px';
        header.style.fontWeight = 'bold';
        header.style.textAlign = 'center';
        header.textContent = 'Inventory';
        this.container.appendChild(header);
        
        // Create slots container
        this.slotsContainer = document.createElement('div');
        this.slotsContainer.style.display = 'grid';
        this.slotsContainer.style.gridTemplateColumns = 'repeat(5, 1fr)';
        this.slotsContainer.style.gap = '10px';
        this.slotsContainer.style.padding = '10px';
        this.container.appendChild(this.slotsContainer);
        
        // Create item info section
        this.itemInfo = document.createElement('div');
        this.itemInfo.style.marginTop = '10px';
        this.itemInfo.style.padding = '10px';
        this.itemInfo.style.borderTop = '1px solid #444';
        this.itemInfo.style.minHeight = '60px';
        this.container.appendChild(this.itemInfo);
        
        // Create slots
        for (let i = 0; i < this.maxSlots; i++) {
            const slot = document.createElement('div');
            slot.className = 'inventory-slot';
            slot.dataset.index = i;
            slot.style.backgroundColor = 'rgba(50, 50, 50, 0.5)';
            slot.style.border = '1px solid #666';
            slot.style.borderRadius = '3px';
            slot.style.height = '50px';
            slot.style.display = 'flex';
            slot.style.flexDirection = 'column';
            slot.style.alignItems = 'center';
            slot.style.justifyContent = 'center';
            slot.style.position = 'relative';
            slot.style.cursor = 'pointer';
            
            // Add click event to select item
            slot.addEventListener('click', () => {
                this.selectSlot(i);
            });
            
            this.slotsContainer.appendChild(slot);
        }
        
        // Add close button
        const closeButton = document.createElement('button');
        closeButton.textContent = 'Close';
        closeButton.style.marginTop = '10px';
        closeButton.style.padding = '5px 10px';
        closeButton.style.backgroundColor = '#333';
        closeButton.style.color = 'white';
        closeButton.style.border = '1px solid #666';
        closeButton.style.borderRadius = '3px';
        closeButton.style.cursor = 'pointer';
        closeButton.style.float = 'right';
        closeButton.addEventListener('click', () => this.toggleInventory());
        this.container.appendChild(closeButton);
        
        // Add use button
        const useButton = document.createElement('button');
        useButton.textContent = 'Use Item';
        useButton.style.marginTop = '10px';
        useButton.style.marginRight = '10px';
        useButton.style.padding = '5px 10px';
        useButton.style.backgroundColor = '#333';
        useButton.style.color = 'white';
        useButton.style.border = '1px solid #666';
        useButton.style.borderRadius = '3px';
        useButton.style.cursor = 'pointer';
        useButton.style.float = 'right';
        useButton.addEventListener('click', () => this.useSelectedItem());
        this.container.appendChild(useButton);
        
        // Add to document
        document.body.appendChild(this.container);
    }
    
    toggleInventory() {
        this.isOpen = !this.isOpen;
        this.container.style.display = this.isOpen ? 'block' : 'none';
        
        // Update UI when opening
        if (this.isOpen) {
            this.updateUI();
        }
    }
    
    addItem(item) {
        if (this.items.length < this.maxSlots) {
            this.items.push(item);
            this.updateUI();
            return true;
        }
        return false;
    }
    
    removeItem(index) {
        if (index >= 0 && index < this.items.length) {
            this.items.splice(index, 1);
            this.updateUI();
            return true;
        }
        return false;
    }
    
    selectSlot(index) {
        // Clear previous selection
        const slots = document.querySelectorAll('.inventory-slot');
        slots.forEach(slot => {
            slot.style.border = '1px solid #666';
        });
        
        if (index >= 0 && index < this.items.length) {
            // Highlight selected slot
            const selectedSlot = document.querySelector(`.inventory-slot[data-index="${index}"]`);
            if (selectedSlot) {
                selectedSlot.style.border = '2px solid #ffcc00';
                this.selectedSlot = index;
                
                // Update item info
                const item = this.items[index];
                this.itemInfo.innerHTML = `
                    <h3>${item.name}</h3>
                    <p>${item.description}</p>
                `;
            }
        } else {
            this.selectedSlot = -1;
            this.itemInfo.innerHTML = '';
        }
    }
    
    useSelectedItem() {
        if (this.selectedSlot >= 0 && this.selectedSlot < this.items.length) {
            const item = this.items[this.selectedSlot];
            
            // Apply item effect
            if (item.use && typeof item.use === 'function') {
                const used = item.use();
                
                // If item was used successfully, remove it from inventory
                if (used) {
                    this.removeItem(this.selectedSlot);
                    this.selectedSlot = -1;
                }
            }
        }
    }
    
    updateUI() {
        // Clear all slots
        const slots = document.querySelectorAll('.inventory-slot');
        slots.forEach(slot => {
            slot.innerHTML = '';
        });
        
        // Add items to slots
        this.items.forEach((item, index) => {
            const slot = document.querySelector(`.inventory-slot[data-index="${index}"]`);
            if (slot) {
                // Create item icon
                const icon = document.createElement('div');
                icon.style.width = '32px';
                icon.style.height = '32px';
                icon.style.backgroundColor = item.color || '#aaa';
                icon.style.borderRadius = '3px';
                
                // Add item image if available
                if (item.image) {
                    icon.style.backgroundImage = `url(${item.image})`;
                    icon.style.backgroundSize = 'contain';
                    icon.style.backgroundPosition = 'center';
                    icon.style.backgroundRepeat = 'no-repeat';
                } else {
                    // Display first letter of item name
                    icon.textContent = item.name.charAt(0);
                    icon.style.display = 'flex';
                    icon.style.alignItems = 'center';
                    icon.style.justifyContent = 'center';
                    icon.style.color = 'white';
                    icon.style.fontWeight = 'bold';
                }
                
                // Add quantity if stackable
                if (item.quantity && item.quantity > 1) {
                    const quantity = document.createElement('div');
                    quantity.style.position = 'absolute';
                    quantity.style.bottom = '2px';
                    quantity.style.right = '2px';
                    quantity.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                    quantity.style.color = 'white';
                    quantity.style.padding = '1px 3px';
                    quantity.style.borderRadius = '3px';
                    quantity.style.fontSize = '10px';
                    quantity.textContent = item.quantity;
                    slot.appendChild(quantity);
                }
                
                slot.appendChild(icon);
            }
        });
    }
}

// Item class
class Item {
    constructor(options) {
        this.id = options.id || `item_${Math.random().toString(36).substr(2, 9)}`;
        this.name = options.name || 'Unknown Item';
        this.description = options.description || 'No description available.';
        this.type = options.type || 'misc';
        this.color = options.color || '#aaaaaa';
        this.image = options.image || null;
        this.quantity = options.quantity || 1;
        this.stackable = options.stackable || false;
        this.use = options.use || null;
        this.value = options.value || 0;
    }
    
    static createApple() {
        return new Item({
            id: 'apple',
            name: 'Apple',
            description: 'A juicy red apple. Restores 10 health when eaten.',
            type: 'consumable',
            color: '#ff0000',
            stackable: true,
            value: 5,
            use: function() {
                // Get player character from global scope
                if (window.playerCharacter) {
                    const healAmount = 10;
                    window.playerCharacter.heal(healAmount);
                    
                    // Show healing effect
                    showHealingEffect(healAmount);
                    
                    // Update character UI
                    if (typeof updateCharacterStatsUI === 'function') {
                        updateCharacterStatsUI();
                    }
                    
                    return true; // Item was used successfully
                }
                return false; // Item use failed
            }
        });
    }
    
    static createHealthPotion() {
        return new Item({
            id: 'health_potion',
            name: 'Health Potion',
            description: 'A magical potion that restores 25 health.',
            type: 'consumable',
            color: '#ff3366',
            stackable: true,
            value: 15,
            use: function() {
                if (window.playerCharacter) {
                    const healAmount = 25;
                    window.playerCharacter.heal(healAmount);
                    showHealingEffect(healAmount);
                    
                    if (typeof updateCharacterStatsUI === 'function') {
                        updateCharacterStatsUI();
                    }
                    
                    return true;
                }
                return false;
            }
        });
    }
    
    static createManaPotion() {
        return new Item({
            id: 'mana_potion',
            name: 'Mana Potion',
            description: 'A magical potion that restores 25 mana.',
            type: 'consumable',
            color: '#3366ff',
            stackable: true,
            value: 15,
            use: function() {
                if (window.playerCharacter) {
                    window.playerCharacter.currentMana = Math.min(
                        window.playerCharacter.maxMana,
                        window.playerCharacter.currentMana + 25
                    );
                    
                    // Show mana restore effect
                    showManaRestoreEffect(25);
                    
                    if (typeof updateCharacterStatsUI === 'function') {
                        updateCharacterStatsUI();
                    }
                    
                    return true;
                }
                return false;
            }
        });
    }
    
    static createRandomLoot() {
        const lootTable = [
            { item: Item.createApple, weight: 70 },
            { item: Item.createHealthPotion, weight: 20 },
            { item: Item.createManaPotion, weight: 10 }
        ];
        
        // Calculate total weight
        const totalWeight = lootTable.reduce((sum, entry) => sum + entry.weight, 0);
        
        // Generate random number
        const roll = Math.random() * totalWeight;
        
        // Find the item that corresponds to the roll
        let weightSum = 0;
        for (const entry of lootTable) {
            weightSum += entry.weight;
            if (roll < weightSum) {
                return entry.item();
            }
        }
        
        // Fallback
        return Item.createApple();
    }
}

// Helper function to show healing effect
function showHealingEffect(amount) {
    const healDiv = document.createElement('div');
    healDiv.textContent = `+${amount} HP`;
    healDiv.style.position = 'absolute';
    healDiv.style.color = '#00ff00';
    healDiv.style.fontSize = '24px';
    healDiv.style.fontWeight = 'bold';
    healDiv.style.textShadow = '2px 2px 0 #000';
    healDiv.style.top = '50%';
    healDiv.style.left = '50%';
    healDiv.style.transform = 'translate(-50%, -50%)';
    healDiv.style.pointerEvents = 'none';
    healDiv.style.zIndex = '1001';
    document.body.appendChild(healDiv);
    
    // Animate the healing indicator
    let opacity = 1;
    let posY = 0;
    
    const animateHeal = () => {
        opacity -= 0.02;
        posY -= 1;
        
        healDiv.style.opacity = opacity;
        healDiv.style.transform = `translate(-50%, calc(-50% + ${posY}px))`;
        
        if (opacity > 0) {
            requestAnimationFrame(animateHeal);
        } else {
            document.body.removeChild(healDiv);
        }
    };
    
    requestAnimationFrame(animateHeal);
}

// Helper function to show mana restore effect
function showManaRestoreEffect(amount) {
    const manaDiv = document.createElement('div');
    manaDiv.textContent = `+${amount} MP`;
    manaDiv.style.position = 'absolute';
    manaDiv.style.color = '#3366ff';
    manaDiv.style.fontSize = '24px';
    manaDiv.style.fontWeight = 'bold';
    manaDiv.style.textShadow = '2px 2px 0 #000';
    manaDiv.style.top = '50%';
    manaDiv.style.left = '50%';
    manaDiv.style.transform = 'translate(-50%, -50%)';
    manaDiv.style.pointerEvents = 'none';
    manaDiv.style.zIndex = '1001';
    document.body.appendChild(manaDiv);
    
    // Animate the mana indicator
    let opacity = 1;
    let posY = 0;
    
    const animateMana = () => {
        opacity -= 0.02;
        posY -= 1;
        
        manaDiv.style.opacity = opacity;
        manaDiv.style.transform = `translate(-50%, calc(-50% + ${posY}px))`;
        
        if (opacity > 0) {
            requestAnimationFrame(animateMana);
        } else {
            document.body.removeChild(manaDiv);
        }
    };
    
    requestAnimationFrame(animateMana);
}

// Export the Inventory and Item classes
window.Inventory = Inventory;
window.Item = Item; 
