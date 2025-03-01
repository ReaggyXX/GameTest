class SkillSystem {
    constructor(character) {
        this.character = character;
        this.skills = [];
        this.activeSkills = [];
        this.skillPoints = 0;
        this.maxActiveSkills = 4;
        this.cooldowns = {};
        
        // Initialize with basic skills
        this.initializeSkills();
        
        // Create UI
        this.createUI();
        
        // Bind keyboard events for skill activation
        this.bindKeyEvents();
    }
    
    initializeSkills() {
        // Add basic skills
        this.addSkill(new Skill({
            id: 'dash',
            name: 'Dash',
            description: 'Quickly dash forward in the direction you\'re facing.',
            icon: '→',
            color: '#3498db',
            level: 1,
            maxLevel: 3,
            cooldown: 5,
            manaCost: 10,
            requiredLevel: 1,
            effect: (character, direction) => {
                // Get dash distance based on skill level
                const dashDistance = 3 + (this.getSkill('dash').level - 1);
                
                // Apply dash effect
                if (window.camera) {
                    const dashDir = new THREE.Vector3();
                    window.camera.getWorldDirection(dashDir);
                    window.camera.position.addScaledVector(dashDir, dashDistance);
                    
                    // Create dash effect
                    this.createDashEffect(dashDir);
                    
                    return true;
                }
                return false;
            }
        }));
        
        this.addSkill(new Skill({
            id: 'fireball',
            name: 'Fireball',
            description: 'Launch a ball of fire that damages enemies.',
            icon: '🔥',
            color: '#e74c3c',
            level: 1,
            maxLevel: 5,
            cooldown: 3,
            manaCost: 15,
            requiredLevel: 2,
            effect: (character) => {
                // Get damage based on skill level and character stats
                const damage = 10 + (this.getSkill('fireball').level * 5) + (character.strength / 2);
                
                // Create and launch fireball
                if (window.camera && window.scene) {
                    this.launchFireball(damage);
                    return true;
                }
                return false;
            }
        }));
        
        this.addSkill(new Skill({
            id: 'heal',
            name: 'Healing Aura',
            description: 'Create a healing aura that restores health over time.',
            icon: '💚',
            color: '#2ecc71',
            level: 1,
            maxLevel: 3,
            cooldown: 15,
            manaCost: 25,
            requiredLevel: 3,
            effect: (character) => {
                // Get healing amount based on skill level
                const healAmount = 5 + (this.getSkill('heal').level * 3);
                
                // Apply healing effect
                character.heal(healAmount);
                
                // Create healing effect
                this.createHealingEffect();
                
                // Set up healing over time
                const duration = 5 + (this.getSkill('heal').level * 2);
                const interval = setInterval(() => {
                    character.heal(healAmount / 2);
                    if (typeof updateCharacterStatsUI === 'function') {
                        updateCharacterStatsUI();
                    }
                }, 1000);
                
                // Clear interval after duration
                setTimeout(() => {
                    clearInterval(interval);
                }, duration * 1000);
                
                return true;
            }
        }));
        
        this.addSkill(new Skill({
            id: 'shockwave',
            name: 'Shockwave',
            description: 'Create a shockwave that damages and pushes back nearby enemies.',
            icon: '⚡',
            color: '#9b59b6',
            level: 1,
            maxLevel: 3,
            cooldown: 8,
            manaCost: 20,
            requiredLevel: 4,
            effect: (character) => {
                // Get damage and radius based on skill level
                const damage = 15 + (this.getSkill('shockwave').level * 5);
                const radius = 5 + (this.getSkill('shockwave').level);
                
                // Create shockwave effect
                this.createShockwaveEffect(radius);
                
                // Apply damage to nearby enemies
                if (window.enemies && window.camera) {
                    const playerPos = new THREE.Vector3(
                        window.camera.position.x,
                        0,
                        window.camera.position.z
                    );
                    
                    let hitCount = 0;
                    
                    for (const enemy of window.enemies) {
                        if (enemy.isDead) continue;
                        
                        const enemyPos = new THREE.Vector3(
                            enemy.mesh.position.x,
                            0,
                            enemy.mesh.position.z
                        );
                        
                        const distance = playerPos.distanceTo(enemyPos);
                        
                        if (distance <= radius) {
                            // Deal damage
                            enemy.health -= damage;
                            
                            // Show damage number
                            if (typeof showEnemyDamageNumber === 'function') {
                                showEnemyDamageNumber(enemy, damage);
                            }
                            
                            // Push enemy back
                            const pushDir = new THREE.Vector3().subVectors(enemyPos, playerPos).normalize();
                            enemy.mesh.position.addScaledVector(pushDir, 3);
                            
                            // Check if enemy is dead
                            if (enemy.health <= 0) {
                                enemy.isDead = true;
                                
                                // Give player experience
                                const xpGained = 20;
                                character.gainExperience(xpGained);
                                
                                // Show XP gained
                                if (typeof showXpGainedMessage === 'function') {
                                    showXpGainedMessage(xpGained);
                                }
                                
                                // Create death effect
                                if (typeof createDeathEffect === 'function') {
                                    createDeathEffect(enemy.mesh.position);
                                }
                            }
                            
                            hitCount++;
                        }
                    }
                    
                    // Log hit count
                    if (typeof logDebug === 'function') {
                        logDebug(`Shockwave hit ${hitCount} enemies`);
                    }
                    
                    return hitCount > 0;
                }
                
                return true;
            }
        }));

        // Add the Sword Slash skill
        this.addSkill(new Skill({
            id: 'swordSlash',
            name: 'Sword Slash',
            description: 'A powerful slash with your sword.',
            icon: '⚔️',
            color: '#e74c3c',
            level: 1,
            maxLevel: 5,
            cooldown: 2,
            manaCost: 5,
            requiredLevel: 1,
            effect: (character) => {
                // Create sword slash effect
                this.createSwordSlashEffect();
                
                // Calculate damage based on character's strength
                const damage = 10 + (character.strength / 2);
                
                // Apply damage to nearby enemies
                if (window.enemies) {
                    for (const enemy of window.enemies) {
                        if (enemy.isDead) continue;

                        const distance = enemy.mesh.position.distanceTo(window.camera.position);
                        if (distance < 2) { // Adjust the attack range as needed
                            enemy.health -= damage;

                            // Show damage number
                            if (typeof showEnemyDamageNumber === 'function') {
                                showEnemyDamageNumber(enemy, damage);
                            }

                            // Check if enemy is dead
                            if (enemy.health <= 0) {
                                enemy.isDead = true;
                                // Handle enemy death (e.g., respawn)
                                handleEnemyDeath(enemy);
                            }
                        }
                    }
                }
                
                return true; // Indicate that the skill was successfully activated
            }
        }));
    }
    
    addSkill(skill) {
        this.skills.push(skill);
    }
    
    getSkill(id) {
        return this.skills.find(skill => skill.id === id);
    }
    
    activateSkill(id) {
        const skill = this.getSkill(id);
        
        if (!skill) return false;
        
        // Check if skill is on cooldown
        if (this.isOnCooldown(id)) {
            if (typeof logDebug === 'function') {
                logDebug(`Skill ${skill.name} is on cooldown`);
            }
            return false;
        }
        
        // Check if character has enough mana
        if (this.character.currentMana < skill.manaCost) {
            if (typeof logDebug === 'function') {
                logDebug(`Not enough mana for ${skill.name}`);
            }
            return false;
        }
        
        // Check if character meets level requirement
        if (this.character.level < skill.requiredLevel) {
            if (typeof logDebug === 'function') {
                logDebug(`Character level too low for ${skill.name}`);
            }
            return false;
        }
        
        // Use mana
        this.character.currentMana -= skill.manaCost;
        
        // Update character UI
        if (typeof updateCharacterStatsUI === 'function') {
            updateCharacterStatsUI();
        }
        
        // Apply skill effect
        const success = skill.effect(this.character);
        
        if (success) {
            // Set cooldown
            this.setCooldown(id, skill.cooldown);
            
            // Update UI
            this.updateSkillUI();
            
            if (typeof logDebug === 'function') {
                logDebug(`Activated skill: ${skill.name}`);
            }
        }
        
        return success;
    }
    
    setCooldown(id, duration) {
        this.cooldowns[id] = {
            startTime: Date.now(),
            duration: duration * 1000 // Convert to milliseconds
        };
        
        // Update cooldown UI
        this.updateCooldownUI(id);
    }
    
    isOnCooldown(id) {
        if (!this.cooldowns[id]) return false;
        
        const elapsed = Date.now() - this.cooldowns[id].startTime;
        return elapsed < this.cooldowns[id].duration;
    }
    
    getCooldownRemaining(id) {
        if (!this.cooldowns[id]) return 0;
        
        const elapsed = Date.now() - this.cooldowns[id].startTime;
        const remaining = this.cooldowns[id].duration - elapsed;
        
        return Math.max(0, remaining / 1000); // Convert to seconds
    }
    
    updateCooldownUI(id) {
        const skill = this.getSkill(id);
        if (!skill) return;
        
        const cooldownElement = document.querySelector(`.skill-cooldown[data-skill="${id}"]`);
        if (!cooldownElement) return;
        
        const updateCooldown = () => {
            const remaining = this.getCooldownRemaining(id);
            
            if (remaining > 0) {
                cooldownElement.textContent = remaining.toFixed(1) + 's';
                cooldownElement.style.display = 'block';
                
                // Update progress circle
                const progressElement = document.querySelector(`.skill-progress[data-skill="${id}"]`);
                if (progressElement) {
                    const percent = (remaining / skill.cooldown) * 100;
                    progressElement.style.height = percent + '%';
                }
                
                requestAnimationFrame(updateCooldown);
            } else {
                cooldownElement.style.display = 'none';
                
                // Reset progress circle
                const progressElement = document.querySelector(`.skill-progress[data-skill="${id}"]`);
                if (progressElement) {
                    progressElement.style.height = '0%';
                }
            }
        };
        
        updateCooldown();
    }
    
    createUI() {
        // Create skills container
        this.container = document.createElement('div');
        this.container.id = 'skillsContainer';
        this.container.style.position = 'absolute';
        this.container.style.bottom = '10px';
        this.container.style.left = '50%';
        this.container.style.transform = 'translateX(-50%)';
        this.container.style.display = 'flex';
        this.container.style.gap = '10px';
        this.container.style.padding = '5px';
        this.container.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        this.container.style.borderRadius = '5px';
        this.container.style.zIndex = '100';
        
        // Create skill slots
        for (let i = 0; i < this.maxActiveSkills; i++) {
            const slot = document.createElement('div');
            slot.className = 'skill-slot';
            slot.dataset.slot = i;
            slot.style.width = '50px';
            slot.style.height = '50px';
            slot.style.backgroundColor = 'rgba(50, 50, 50, 0.7)';
            slot.style.border = '1px solid #666';
            slot.style.borderRadius = '5px';
            slot.style.display = 'flex';
            slot.style.alignItems = 'center';
            slot.style.justifyContent = 'center';
            slot.style.fontSize = '24px';
            slot.style.color = 'white';
            slot.style.position = 'relative';
            slot.style.cursor = 'pointer';
            
            // Add key binding indicator
            const keyIndicator = document.createElement('div');
            keyIndicator.className = 'key-indicator';
            keyIndicator.textContent = (i + 1).toString();
            keyIndicator.style.position = 'absolute';
            keyIndicator.style.top = '2px';
            keyIndicator.style.right = '2px';
            keyIndicator.style.fontSize = '12px';
            keyIndicator.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            keyIndicator.style.padding = '2px 4px';
            keyIndicator.style.borderRadius = '3px';
            slot.appendChild(keyIndicator);
            
            // Add cooldown indicator
            const cooldownIndicator = document.createElement('div');
            cooldownIndicator.className = 'skill-cooldown';
            cooldownIndicator.style.position = 'absolute';
            cooldownIndicator.style.bottom = '2px';
            cooldownIndicator.style.left = '0';
            cooldownIndicator.style.right = '0';
            cooldownIndicator.style.textAlign = 'center';
            cooldownIndicator.style.fontSize = '12px';
            cooldownIndicator.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            cooldownIndicator.style.padding = '2px 0';
            cooldownIndicator.style.display = 'none';
            slot.appendChild(cooldownIndicator);
            
            // Add progress indicator
            const progressContainer = document.createElement('div');
            progressContainer.className = 'skill-progress-container';
            progressContainer.style.position = 'absolute';
            progressContainer.style.bottom = '0';
            progressContainer.style.left = '0';
            progressContainer.style.width = '5px';
            progressContainer.style.height = '100%';
            progressContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
            progressContainer.style.overflow = 'hidden';
            
            const progressIndicator = document.createElement('div');
            progressIndicator.className = 'skill-progress';
            progressIndicator.style.position = 'absolute';
            progressIndicator.style.bottom = '0';
            progressIndicator.style.left = '0';
            progressIndicator.style.width = '100%';
            progressIndicator.style.height = '0%';
            progressIndicator.style.backgroundColor = '#3498db';
            
            progressContainer.appendChild(progressIndicator);
            slot.appendChild(progressContainer);
            
            // Add click event to open skill selection
            slot.addEventListener('click', () => {
                this.openSkillSelection(i);
            });
            
            this.container.appendChild(slot);
        }
        
        // Create skill selection panel
        this.selectionPanel = document.createElement('div');
        this.selectionPanel.id = 'skillSelectionPanel';
        this.selectionPanel.style.position = 'absolute';
        this.selectionPanel.style.top = '50%';
        this.selectionPanel.style.left = '50%';
        this.selectionPanel.style.transform = 'translate(-50%, -50%)';
        this.selectionPanel.style.width = '400px';
        this.selectionPanel.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        this.selectionPanel.style.border = '2px solid #444';
        this.selectionPanel.style.borderRadius = '5px';
        this.selectionPanel.style.padding = '10px';
        this.selectionPanel.style.display = 'none';
        this.selectionPanel.style.zIndex = '1000';
        this.selectionPanel.style.color = 'white';
        
        // Create header
        const header = document.createElement('div');
        header.style.borderBottom = '1px solid #444';
        header.style.paddingBottom = '10px';
        header.style.marginBottom = '10px';
        header.style.fontSize = '20px';
        header.style.fontWeight = 'bold';
        header.style.textAlign = 'center';
        header.textContent = 'Select Skill';
        this.selectionPanel.appendChild(header);
        
        // Create skills list
        this.skillsList = document.createElement('div');
        this.skillsList.style.maxHeight = '300px';
        this.skillsList.style.overflowY = 'auto';
        this.skillsList.style.padding = '10px';
        this.selectionPanel.appendChild(this.skillsList);
        
        // Create close button
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
        closeButton.addEventListener('click', () => {
            this.selectionPanel.style.display = 'none';
        });
        this.selectionPanel.appendChild(closeButton);
        
        // Add to document
        document.body.appendChild(this.container);
        document.body.appendChild(this.selectionPanel);
        
        // Initialize with default skills
        this.activeSkills = [
            this.getSkill('dash'),
            null,
            null,
            null
        ];
        
        this.updateSkillUI();
    }
    
    updateSkillUI() {
        // Update active skill slots
        const slots = document.querySelectorAll('.skill-slot');
        
        this.activeSkills.forEach((skill, index) => {
            const slot = slots[index];
            if (!slot) return;
            
            // Clear slot
            slot.innerHTML = '';
            
            // Add key binding indicator
            const keyIndicator = document.createElement('div');
            keyIndicator.className = 'key-indicator';
            keyIndicator.textContent = (index + 1).toString();
            keyIndicator.style.position = 'absolute';
            keyIndicator.style.top = '2px';
            keyIndicator.style.right = '2px';
            keyIndicator.style.fontSize = '12px';
            keyIndicator.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            keyIndicator.style.padding = '2px 4px';
            keyIndicator.style.borderRadius = '3px';
            slot.appendChild(keyIndicator);
            
            if (skill) {
                // Add skill icon
                const icon = document.createElement('div');
                icon.textContent = skill.icon;
                icon.style.fontSize = '24px';
                slot.appendChild(icon);
                
                // Set background color
                slot.style.backgroundColor = skill.color + '4D'; // Add transparency
                
                // Add cooldown indicator
                const cooldownIndicator = document.createElement('div');
                cooldownIndicator.className = 'skill-cooldown';
                cooldownIndicator.dataset.skill = skill.id;
                cooldownIndicator.style.position = 'absolute';
                cooldownIndicator.style.bottom = '2px';
                cooldownIndicator.style.left = '0';
                cooldownIndicator.style.right = '0';
                cooldownIndicator.style.textAlign = 'center';
                cooldownIndicator.style.fontSize = '12px';
                cooldownIndicator.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                cooldownIndicator.style.padding = '2px 0';
                cooldownIndicator.style.display = 'none';
                slot.appendChild(cooldownIndicator);
                
                // Add progress indicator
                const progressContainer = document.createElement('div');
                progressContainer.className = 'skill-progress-container';
                progressContainer.style.position = 'absolute';
                progressContainer.style.bottom = '0';
                progressContainer.style.left = '0';
                progressContainer.style.width = '5px';
                progressContainer.style.height = '100%';
                progressContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
                progressContainer.style.overflow = 'hidden';
                
                const progressIndicator = document.createElement('div');
                progressIndicator.className = 'skill-progress';
                progressIndicator.dataset.skill = skill.id;
                progressIndicator.style.position = 'absolute';
                progressIndicator.style.bottom = '0';
                progressIndicator.style.left = '0';
                progressIndicator.style.width = '100%';
                progressIndicator.style.height = '0%';
                progressIndicator.style.backgroundColor = '#3498db';
                
                progressContainer.appendChild(progressIndicator);
                slot.appendChild(progressContainer);
                
                // Update cooldown if on cooldown
                if (this.isOnCooldown(skill.id)) {
                    this.updateCooldownUI(skill.id);
                }
            } else {
                // Empty slot
                slot.style.backgroundColor = 'rgba(50, 50, 50, 0.7)';
                
                // Add empty indicator
                const emptyIndicator = document.createElement('div');
                emptyIndicator.textContent = '+';
                emptyIndicator.style.fontSize = '24px';
                emptyIndicator.style.color = '#aaa';
                slot.appendChild(emptyIndicator);
            }
        });
    }
    
    openSkillSelection(slotIndex) {
        // Update skills list
        this.skillsList.innerHTML = '';
        
        // Add skills to list
        this.skills.forEach(skill => {
            const skillItem = document.createElement('div');
            skillItem.className = 'skill-item';
            skillItem.style.display = 'flex';
            skillItem.style.alignItems = 'center';
            skillItem.style.padding = '10px';
            skillItem.style.borderBottom = '1px solid #444';
            skillItem.style.cursor = 'pointer';
            
            // Highlight if skill is already in this slot
            if (this.activeSkills[slotIndex] && this.activeSkills[slotIndex].id === skill.id) {
                skillItem.style.backgroundColor = 'rgba(52, 152, 219, 0.3)';
            }
            
            // Disable if character level is too low
            const isLocked = this.character.level < skill.requiredLevel;
            if (isLocked) {
                skillItem.style.opacity = '0.5';
                skillItem.style.cursor = 'not-allowed';
            }
            
            // Add skill icon
            const icon = document.createElement('div');
            icon.textContent = skill.icon;
            icon.style.fontSize = '24px';
            icon.style.width = '40px';
            icon.style.height = '40px';
            icon.style.backgroundColor = skill.color + '4D'; // Add transparency
            icon.style.borderRadius = '5px';
            icon.style.display = 'flex';
            icon.style.alignItems = 'center';
            icon.style.justifyContent = 'center';
            icon.style.marginRight = '10px';
            skillItem.appendChild(icon);
            
            // Add skill info
            const info = document.createElement('div');
            info.style.flexGrow = '1';
            
            const nameLevel = document.createElement('div');
            nameLevel.style.display = 'flex';
            nameLevel.style.justifyContent = 'space-between';
            nameLevel.style.marginBottom = '5px';
            
            const name = document.createElement('div');
            name.textContent = skill.name;
            name.style.fontWeight = 'bold';
            nameLevel.appendChild(name);
            
            const level = document.createElement('div');
            level.textContent = `Lv ${skill.level}/${skill.maxLevel}`;
            nameLevel.appendChild(level);
            
            info.appendChild(nameLevel);
            
            const description = document.createElement('div');
            description.textContent = skill.description;
            description.style.fontSize = '12px';
            description.style.marginBottom = '5px';
            info.appendChild(description);
            
            const stats = document.createElement('div');
            stats.style.display = 'flex';
            stats.style.fontSize = '12px';
            stats.style.color = '#aaa';
            
            const cooldown = document.createElement('div');
            cooldown.textContent = `CD: ${skill.cooldown}s`;
            cooldown.style.marginRight = '10px';
            stats.appendChild(cooldown);
            
            const mana = document.createElement('div');
            mana.textContent = `Mana: ${skill.manaCost}`;
            stats.appendChild(mana);
            
            info.appendChild(stats);
            
            if (isLocked) {
                const lockInfo = document.createElement('div');
                lockInfo.textContent = `Unlocks at level ${skill.requiredLevel}`;
                lockInfo.style.fontSize = '12px';
                lockInfo.style.color = '#e74c3c';
                info.appendChild(lockInfo);
            }
            
            skillItem.appendChild(info);
            
            // Add click event to assign skill to slot
            if (!isLocked) {
                skillItem.addEventListener('click', () => {
                    this.assignSkillToSlot(skill.id, slotIndex);
                    this.selectionPanel.style.display = 'none';
                });
            }
            
            this.skillsList.appendChild(skillItem);
        });
        
        // Add option to clear slot
        if (this.activeSkills[slotIndex]) {
            const clearItem = document.createElement('div');
            clearItem.className = 'skill-item';
            clearItem.style.display = 'flex';
            clearItem.style.alignItems = 'center';
            clearItem.style.padding = '10px';
            clearItem.style.borderBottom = '1px solid #444';
            clearItem.style.cursor = 'pointer';
            clearItem.style.color = '#e74c3c';
            
            const icon = document.createElement('div');
            icon.textContent = '✖';
            icon.style.fontSize = '24px';
            icon.style.width = '40px';
            icon.style.height = '40px';
            icon.style.backgroundColor = 'rgba(231, 76, 60, 0.3)';
            icon.style.borderRadius = '5px';
            icon.style.display = 'flex';
            icon.style.alignItems = 'center';
            icon.style.justifyContent = 'center';
            icon.style.marginRight = '10px';
            clearItem.appendChild(icon);
            
            const info = document.createElement('div');
            info.textContent = 'Clear Slot';
            info.style.fontWeight = 'bold';
            clearItem.appendChild(info);
            
            clearItem.addEventListener('click', () => {
                this.clearSkillSlot(slotIndex);
                this.selectionPanel.style.display = 'none';
            });
            
            this.skillsList.appendChild(clearItem);
        }
        
        // Show selection panel
        this.selectionPanel.style.display = 'block';
    }
    
    assignSkillToSlot(skillId, slotIndex) {
        const skill = this.getSkill(skillId);
        if (!skill) return;
        
        // Remove skill from any other slot it might be in
        for (let i = 0; i < this.activeSkills.length; i++) {
            if (this.activeSkills[i] && this.activeSkills[i].id === skillId) {
                this.activeSkills[i] = null;
            }
        }
        
        // Assign to new slot
        this.activeSkills[slotIndex] = skill;
        
        // Update UI
        this.updateSkillUI();
        
        if (typeof logDebug === 'function') {
            logDebug(`Assigned ${skill.name} to slot ${slotIndex + 1}`);
        }
    }
    
    clearSkillSlot(slotIndex) {
        this.activeSkills[slotIndex] = null;
        this.updateSkillUI();
    }
    
    bindKeyEvents() {
        document.addEventListener('keydown', (e) => {
            // Number keys 1-4 to activate skills
            if (e.code === 'Digit1' || e.code === 'Digit2' || e.code === 'Digit3' || e.code === 'Digit4') {
                const index = parseInt(e.key) - 1;
                if (index >= 0 && index < this.activeSkills.length) {
                    const skill = this.activeSkills[index];
                    if (skill) {
                        this.activateSkill(skill.id);
                    }
                }
            }
            
            // K key to open skills panel
            if (e.code === 'KeyK') {
                this.toggleSkillsPanel();
            }
        });

        // Bind mouse button 1 to activate sword slash
        document.addEventListener('mousedown', (e) => {
            if (e.button === 0) { // 0 is the left mouse button
                const swordSlashSkill = this.getSkill('swordSlash'); // Assuming you have a swordSlash skill
                if (swordSlashSkill) {
                    this.activateSkill(swordSlashSkill.id);
                }
            }
        });
    }
    
    toggleSkillsPanel() {
        // Create or show skills panel
        if (!this.skillsPanel) {
            this.createSkillsPanel();
        } else {
            this.skillsPanel.style.display = this.skillsPanel.style.display === 'none' ? 'block' : 'none';
        }
    }
    
    createSkillsPanel() {
        this.skillsPanel = document.createElement('div');
        this.skillsPanel.id = 'skillsPanel';
        this.skillsPanel.style.position = 'absolute';
        this.skillsPanel.style.top = '50%';
        this.skillsPanel.style.left = '50%';
        this.skillsPanel.style.transform = 'translate(-50%, -50%)';
        this.skillsPanel.style.width = '500px';
        this.skillsPanel.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        this.skillsPanel.style.border = '2px solid #444';
        this.skillsPanel.style.borderRadius = '5px';
        this.skillsPanel.style.padding = '15px';
        this.skillsPanel.style.zIndex = '1000';
        this.skillsPanel.style.color = 'white';
        
        // Create header
        const header = document.createElement('div');
        header.style.borderBottom = '1px solid #444';
        header.style.paddingBottom = '10px';
        header.style.marginBottom = '15px';
        header.style.fontSize = '24px';
        header.style.fontWeight = 'bold';
        header.style.textAlign = 'center';
        header.textContent = 'Skills';
        this.skillsPanel.appendChild(header);
        
        // Create skill points display
        const pointsDisplay = document.createElement('div');
        pointsDisplay.style.marginBottom = '15px';
        pointsDisplay.style.fontSize = '16px';
        pointsDisplay.style.textAlign = 'center';
        pointsDisplay.innerHTML = `Available Skill Points: <span style="color: #3498db; font-weight: bold;">${this.skillPoints}</span>`;
        this.skillsPanel.appendChild(pointsDisplay);
        
        // Create skills list
        const skillsList = document.createElement('div');
        skillsList.style.display = 'grid';
        skillsList.style.gridTemplateColumns = '1fr';
        skillsList.style.gap = '10px';
        skillsList.style.maxHeight = '400px';
        skillsList.style.overflowY = 'auto';
        skillsList.style.padding = '5px';
        
        // Add each skill to the list
        this.skills.forEach(skill => {
            const skillItem = document.createElement('div');
            skillItem.style.display = 'flex';
            skillItem.style.padding = '10px';
            skillItem.style.backgroundColor = 'rgba(50, 50, 50, 0.5)';
            skillItem.style.borderRadius = '5px';
            skillItem.style.border = '1px solid #555';
            
            // Add skill icon
            const iconContainer = document.createElement('div');
            iconContainer.style.width = '50px';
            iconContainer.style.height = '50px';
            iconContainer.style.backgroundColor = skill.color + '4D'; // Add transparency
            iconContainer.style.borderRadius = '5px';
            iconContainer.style.display = 'flex';
            iconContainer.style.alignItems = 'center';
            iconContainer.style.justifyContent = 'center';
            iconContainer.style.marginRight = '15px';
            iconContainer.style.fontSize = '24px';
            iconContainer.textContent = skill.icon;
            skillItem.appendChild(iconContainer);
            
            // Add skill info
            const infoContainer = document.createElement('div');
            infoContainer.style.flexGrow = '1';
            
            const nameContainer = document.createElement('div');
            nameContainer.style.display = 'flex';
            nameContainer.style.justifyContent = 'space-between';
            nameContainer.style.alignItems = 'center';
            nameContainer.style.marginBottom = '5px';
            
            const skillName = document.createElement('div');
            skillName.style.fontSize = '18px';
            skillName.style.fontWeight = 'bold';
            skillName.textContent = skill.name;
            nameContainer.appendChild(skillName);
            
            const levelDisplay = document.createElement('div');
            levelDisplay.style.fontSize = '14px';
            levelDisplay.innerHTML = `Level <span style="color: #f39c12;">${skill.level}</span>/<span style="color: #f39c12;">${skill.maxLevel}</span>`;
            nameContainer.appendChild(levelDisplay);
            
            infoContainer.appendChild(nameContainer);
            
            const description = document.createElement('div');
            description.style.fontSize = '14px';
            description.style.marginBottom = '8px';
            description.textContent = skill.description;
            infoContainer.appendChild(description);
            
            const statsContainer = document.createElement('div');
            statsContainer.style.display = 'flex';
            statsContainer.style.fontSize = '12px';
            statsContainer.style.color = '#aaa';
            
            const cooldown = document.createElement('div');
            cooldown.textContent = `Cooldown: ${skill.cooldown}s`;
            cooldown.style.marginRight = '15px';
            statsContainer.appendChild(cooldown);
            
            const mana = document.createElement('div');
            mana.textContent = `Mana Cost: ${skill.manaCost}`;
            statsContainer.appendChild(mana);
            
            infoContainer.appendChild(statsContainer);
            
            skillItem.appendChild(infoContainer);
            
            // Add upgrade button if not max level
            if (skill.level < skill.maxLevel) {
                const upgradeButton = document.createElement('button');
                upgradeButton.textContent = 'Upgrade';
                upgradeButton.style.backgroundColor = this.skillPoints > 0 ? '#3498db' : '#555';
                upgradeButton.style.color = 'white';
                upgradeButton.style.border = 'none';
                upgradeButton.style.borderRadius = '3px';
                upgradeButton.style.padding = '5px 10px';
                upgradeButton.style.marginLeft = '10px';
                upgradeButton.style.cursor = this.skillPoints > 0 ? 'pointer' : 'not-allowed';
                upgradeButton.style.alignSelf = 'center';
                
                upgradeButton.addEventListener('click', () => {
                    if (this.skillPoints > 0) {
                        this.upgradeSkill(skill.id);
                    }
                });
                
                skillItem.appendChild(upgradeButton);
            } else {
                const maxedLabel = document.createElement('div');
                maxedLabel.textContent = 'MAXED';
                maxedLabel.style.backgroundColor = '#27ae60';
                maxedLabel.style.color = 'white';
                maxedLabel.style.borderRadius = '3px';
                maxedLabel.style.padding = '5px 10px';
                maxedLabel.style.marginLeft = '10px';
                maxedLabel.style.alignSelf = 'center';
                maxedLabel.style.fontSize = '12px';
                maxedLabel.style.fontWeight = 'bold';
                
                skillItem.appendChild(maxedLabel);
            }
            
            skillsList.appendChild(skillItem);
        });
        
        this.skillsPanel.appendChild(skillsList);
        
        // Add close button
        const closeButton = document.createElement('button');
        closeButton.textContent = 'Close';
        closeButton.style.marginTop = '15px';
        closeButton.style.padding = '8px 15px';
        closeButton.style.backgroundColor = '#333';
        closeButton.style.color = 'white';
        closeButton.style.border = '1px solid #666';
        closeButton.style.borderRadius = '3px';
        closeButton.style.cursor = 'pointer';
        closeButton.style.float = 'right';
        closeButton.addEventListener('click', () => {
            this.skillsPanel.style.display = 'none';
        });
        this.skillsPanel.appendChild(closeButton);
        
        // Add to document
        document.body.appendChild(this.skillsPanel);
    }
    
    upgradeSkill(skillId) {
        const skill = this.getSkill(skillId);
        if (!skill || skill.level >= skill.maxLevel || this.skillPoints <= 0) return;
        
        // Upgrade skill
        skill.level++;
        this.skillPoints--;
        
        // Update UI
        this.toggleSkillsPanel(); // Refresh panel
        
        if (typeof logDebug === 'function') {
            logDebug(`Upgraded ${skill.name} to level ${skill.level}`);
        }
    }
    
    // Visual effects for skills
    createDashEffect(direction) {
        if (!window.scene || !window.camera) return;
        
        // Create dash trail effect
        const trailGeometry = new THREE.BufferGeometry();
        const trailMaterial = new THREE.PointsMaterial({
            color: 0x3498db,
            size: 0.2,
            transparent: true,
            opacity: 0.7
        });
        
        // Create trail points
        const positions = [];
        const startPos = window.camera.position.clone();
        
        // Create points along the dash path
        for (let i = 0; i < 20; i++) {
            const point = startPos.clone().sub(direction.clone().multiplyScalar(i * 0.15));
            positions.push(point.x, point.y, point.z);
        }
        
        trailGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        const trail = new THREE.Points(trailGeometry, trailMaterial);
        window.scene.add(trail);
        
        // Animate trail
        let opacity = 0.7;
        const animateTrail = () => {
            opacity -= 0.05;
            trail.material.opacity = opacity;
            
            if (opacity <= 0) {
                window.scene.remove(trail);
                return;
            }
            
            requestAnimationFrame(animateTrail);
        };
        
        requestAnimationFrame(animateTrail);
        
        // Play dash sound if available
        if (typeof playSound === 'function') {
            playSound('dash');
        }
    }
    
    launchFireball(damage) {
        if (!window.scene || !window.camera) return;
        
        // Create fireball mesh
        const fireballGeometry = new THREE.SphereGeometry(0.3, 16, 16);
        const fireballMaterial = new THREE.MeshBasicMaterial({
            color: 0xff5500,
            transparent: true,
            opacity: 0.9
        });
        
        const fireball = new THREE.Mesh(fireballGeometry, fireballMaterial);
        
        // Position fireball in front of player
        const direction = new THREE.Vector3();
        window.camera.getWorldDirection(direction);
        
        const startPosition = window.camera.position.clone().add(direction.clone().multiplyScalar(1));
        startPosition.y -= 0.5; // Adjust height
        
        fireball.position.copy(startPosition);
        window.scene.add(fireball);
        
        // Animate fireball movement
        const speed = 0.5; // Adjust speed as needed
        const maxDistance = 30;
        let distanceTraveled = 0;
        
        const animateFireball = () => {
            fireball.position.add(direction.clone().multiplyScalar(speed));
            distanceTraveled += speed;
            
            // Check for collision with enemies
            if (window.enemies) {
                for (const enemy of window.enemies) {
                    if (enemy.isDead) continue;

                    const distance = fireball.position.distanceTo(enemy.mesh.position);
                    if (distance < 1.5) { // Adjust the hit radius as needed
                        // Hit enemy
                        enemy.health -= damage;

                        // Show damage number
                        if (typeof showEnemyDamageNumber === 'function') {
                            showEnemyDamageNumber(enemy, damage);
                        }

                        // Create explosion effect
                        this.createFireballExplosion(fireball.position.clone());

                        // Check if enemy is dead
                        if (enemy.health <= 0) {
                            enemy.isDead = true;

                            // Give player experience
                            const xpGained = 20;
                            this.character.gainExperience(xpGained);

                            // Show XP gained
                            if (typeof showXpGainedMessage === 'function') {
                                showXpGainedMessage(xpGained);
                            }

                            // Create death effect
                            if (typeof createDeathEffect === 'function') {
                                createDeathEffect(enemy.mesh.position);
                            }
                        }

                        // Remove fireball
                        window.scene.remove(fireball);
                        return;
                    }
                }
            }
            
            // Check if fireball has traveled max distance
            if (distanceTraveled >= maxDistance) {
                window.scene.remove(fireball);
                return;
            }
            
            requestAnimationFrame(animateFireball);
        };
        
        requestAnimationFrame(animateFireball);
    }
    
    createFireballExplosion(position) {
        if (!window.scene) return;
        
        // Create explosion mesh
        const explosionGeometry = new THREE.SphereGeometry(0.1, 16, 16);
        const explosionMaterial = new THREE.MeshBasicMaterial({
            color: 0xff5500,
            transparent: true,
            opacity: 0.8
        });
        
        const explosion = new THREE.Mesh(explosionGeometry, explosionMaterial);
        explosion.position.copy(position);
        window.scene.add(explosion);
        
        // Animate explosion
        let scale = 0.1;
        const animateExplosion = () => {
            scale += 0.2;
            explosion.scale.set(scale, scale, scale);
            
            explosion.material.opacity -= 0.05;
            
            if (explosion.material.opacity <= 0) {
                window.scene.remove(explosion);
                return;
            }
            
            requestAnimationFrame(animateExplosion);
        };
        
        requestAnimationFrame(animateExplosion);
        
        // Create particle effect
        const particleCount = 30;
        const particleGeometry = new THREE.BufferGeometry();
        const particlePositions = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            particlePositions[i * 3] = position.x;
            particlePositions[i * 3 + 1] = position.y;
            particlePositions[i * 3 + 2] = position.z;
        }
        
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
        
        const particleMaterial = new THREE.PointsMaterial({
            color: 0xff3300,
            size: 0.1,
            transparent: true,
            opacity: 0.8
        });
        
        const particles = new THREE.Points(particleGeometry, particleMaterial);
        window.scene.add(particles);
        
        // Particle velocities
        const velocities = [];
        for (let i = 0; i < particleCount; i++) {
            velocities.push({
                x: (Math.random() - 0.5) * 0.2,
                y: (Math.random() - 0.5) * 0.2,
                z: (Math.random() - 0.5) * 0.2
            });
        }
        
        // Animate particles
        const animateParticles = () => {
            const positions = particles.geometry.attributes.position.array;
            
            for (let i = 0; i < particleCount; i++) {
                positions[i * 3] += velocities[i].x;
                positions[i * 3 + 1] += velocities[i].y;
                positions[i * 3 + 2] += velocities[i].z;
            }
            
            particles.geometry.attributes.position.needsUpdate = true;
            
            particles.material.opacity -= 0.02;
            
            if (particles.material.opacity <= 0) {
                window.scene.remove(particles);
                return;
            }
            
            requestAnimationFrame(animateParticles);
        };
        
        requestAnimationFrame(animateParticles);
    }
    
    createHealingEffect() {
        if (!window.camera || !window.scene) return;
        
        // Create healing particles around player
        const particleCount = 30;
        const particleGeometry = new THREE.BufferGeometry();
        const particlePositions = new Float32Array(particleCount * 3);
        
        const playerPos = window.camera.position.clone();
        
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 1 + Math.random() * 0.5;
            
            particlePositions[i * 3] = playerPos.x + Math.cos(angle) * radius;
            particlePositions[i * 3 + 1] = playerPos.y - 1 + Math.random() * 2;
            particlePositions[i * 3 + 2] = playerPos.z + Math.sin(angle) * radius;
        }
        
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
        
        const particleMaterial = new THREE.PointsMaterial({
            color: 0x2ecc71,
            size: 0.15,
            transparent: true,
            opacity: 0.8
        });
        
        const particles = new THREE.Points(particleGeometry, particleMaterial);
        window.scene.add(particles);
        
        // Animate particles
        let time = 0;
        const animateParticles = () => {
            time += 0.05;
            
            const positions = particles.geometry.attributes.position.array;
            
            for (let i = 0; i < particleCount; i++) {
                // Spiral upward
                positions[i * 3 + 1] += 0.03;
                
                // Spiral around player
                const angle = time + i * 0.1;
                const radius = 1 + Math.sin(time * 0.5) * 0.2;
                
                positions[i * 3] = playerPos.x + Math.cos(angle) * radius;
                positions[i * 3 + 2] = playerPos.z + Math.sin(angle) * radius;
            }
            
            particles.geometry.attributes.position.needsUpdate = true;
            
            particles.material.opacity -= 0.01;
            
            if (particles.material.opacity <= 0) {
                window.scene.remove(particles);
                return;
            }
            
            requestAnimationFrame(animateParticles);
        };
        
        requestAnimationFrame(animateParticles);
    }
    
    createShockwaveEffect(radius) {
        if (!window.camera || !window.scene) return;
        
        const playerPos = window.camera.position.clone();
        playerPos.y = 0.1; // Just above ground
        
        // Create ring geometry
        const ringGeometry = new THREE.RingGeometry(0.1, 0.5, 32);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0x9b59b6,
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide
        });
        
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = -Math.PI / 2; // Lay flat on ground
        ring.position.copy(playerPos);
        window.scene.add(ring);
        
        // Animate ring
        let scale = 0.1;
        const animateRing = () => {
            scale += 0.3;
            ring.scale.set(scale, scale, scale);
            
            ring.material.opacity -= 0.02;
            
            if (ring.material.opacity <= 0 || scale >= radius * 2) {
                window.scene.remove(ring);
                return;
            }
            
            requestAnimationFrame(animateRing);
        };
        
        requestAnimationFrame(animateRing);
        
        // Create particles
        const particleCount = 50;
        const particleGeometry = new THREE.BufferGeometry();
        const particlePositions = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const radius = 0.5;
            
            particlePositions[i * 3] = playerPos.x + Math.cos(angle) * radius;
            particlePositions[i * 3 + 1] = playerPos.y + 0.1;
            particlePositions[i * 3 + 2] = playerPos.z + Math.sin(angle) * radius;
        }
        
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
        
        const particleMaterial = new THREE.PointsMaterial({
            color: 0x9b59b6,
            size: 0.1,
            transparent: true,
            opacity: 0.8
        });
        
        const particles = new THREE.Points(particleGeometry, particleMaterial);
        window.scene.add(particles);
        
        // Animate particles
        let particleScale = 0.1;
        const animateParticles = () => {
            particleScale += 0.3;
            
            const positions = particles.geometry.attributes.position.array;
            
            for (let i = 0; i < particleCount; i++) {
                const angle = (i / particleCount) * Math.PI * 2;
                const currentRadius = 0.5 + particleScale;
                
                positions[i * 3] = playerPos.x + Math.cos(angle) * currentRadius;
                positions[i * 3 + 2] = playerPos.z + Math.sin(angle) * currentRadius;
            }
            
            particles.geometry.attributes.position.needsUpdate = true;
            
            particles.material.opacity -= 0.02;
            
            if (particles.material.opacity <= 0 || particleScale >= radius * 2) {
                window.scene.remove(particles);
                return;
            }
            
            requestAnimationFrame(animateParticles);
        };
        
        requestAnimationFrame(animateParticles);
    }

    createSwordSlashEffect() {
        if (!window.scene || !window.camera) return;

        // Create a sword slash shape (a simple line for demonstration)
        const geometry = new THREE.CylinderGeometry(0.05, 0.05, 1, 8);
        const material = new THREE.MeshBasicMaterial({ color: 0xffcc00 });
        const slash = new THREE.Mesh(geometry, material);

        // Position the slash in front of the player
        const direction = new THREE.Vector3();
        window.camera.getWorldDirection(direction);
        const startPosition = window.camera.position.clone().add(direction.clone().multiplyScalar(1));
        slash.position.copy(startPosition);
        slash.rotation.x = Math.PI / 2; // Rotate to lay flat

        window.scene.add(slash);

        // Animate the slash
        const animateSlash = () => {
            slash.scale.y -= 0.1; // Shrink the slash over time
            if (slash.scale.y <= 0) {
                window.scene.remove(slash); // Remove the slash when it's gone
                return;
            }
            requestAnimationFrame(animateSlash);
        };

        requestAnimationFrame(animateSlash);
    }
}

// Skill class
class Skill {
    constructor(options) {
        this.id = options.id;
        this.name = options.name;
        this.description = options.description;
        this.icon = options.icon;
        this.color = options.color;
        this.level = options.level || 1;
        this.maxLevel = options.maxLevel || 5;
        this.cooldown = options.cooldown || 5;
        this.manaCost = options.manaCost || 10;
        this.requiredLevel = options.requiredLevel || 1;
        this.effect = options.effect || (() => {});
    }
}

// Export to window
window.SkillSystem = SkillSystem;
window.Skill = Skill;
