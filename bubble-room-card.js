class BubbleRoomCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._hass = null;
  }

  setConfig(config) {
    if (!config) {
      throw new Error('Invalid configuration');
    }

    // Validate required fields
    if (!config.name) {
      throw new Error('name is required');
    }
    if (!config.icon) {
      throw new Error('icon is required');
    }
    if (!config.main_entity) {
      throw new Error('main_entity is required');
    }

    this.config = {
      name: config.name,
      icon: config.icon,
      main_entity: config.main_entity,
      entities: config.entities || [],
      navigation_path: config.navigation_path || '/lovelace/default',
      ...config
    };

    // Validate entities
    if (this.config.entities.length > 4) {
      console.warn('Bubble Room Card: Maximum 4 entities supported, truncating list');
      this.config.entities = this.config.entities.slice(0, 4);
    }

    this.config.entities.forEach((entity, index) => {
      if (!entity.entity) {
        throw new Error(`Entity ${index + 1}: entity ID is required`);
      }
      if (!entity.icon) {
        throw new Error(`Entity ${index + 1}: icon is required`);
      }
    });

    console.log('Bubble Room Card Config:', this.config);
    
    if (this._hass) {
      this.render();
    }
  }

  set hass(hass) {
    this._hass = hass;
    if (this.config) {
      this.render();
    }
  }

  get hass() {
    return this._hass;
  }

  render() {
    if (!this._hass || !this.config) {
      console.warn('Bubble Room Card: Missing hass or config');
      return;
    }

    // Check if bubble-card is available
    if (!customElements.get('bubble-card')) {
      this.shadowRoot.innerHTML = `
        <ha-card>
          <div style="padding: 16px; color: red; text-align: center;">
            <h3>Bubble Card Required</h3>
            <p>Please install <a href="https://github.com/Clooos/Bubble-Card" target="_blank">Bubble Card</a> first.</p>
          </div>
        </ha-card>
      `;
      return;
    }

    // Validate main entity exists
    if (!this._hass.states[this.config.main_entity]) {
      this.shadowRoot.innerHTML = `
        <ha-card>
          <div style="padding: 16px; color: red; text-align: center;">
            <h3>Entity Not Found</h3>
            <p>Main entity "${this.config.main_entity}" not found in Home Assistant.</p>
          </div>
        </ha-card>
      `;
      return;
    }

    // Validate sub-button entities exist
    const missingEntities = this.config.entities.filter(entity => !this._hass.states[entity.entity]);
    if (missingEntities.length > 0) {
      console.warn('Bubble Room Card: Missing entities:', missingEntities.map(e => e.entity));
    }

    try {
      const bubbleConfig = this.generateBubbleConfig();
      console.log('Generated Bubble Config:', bubbleConfig);

      // Clear previous content
      this.shadowRoot.innerHTML = '';
      
      // Create bubble card element
      const bubbleCard = document.createElement('bubble-card');
      
      // Set hass first
      bubbleCard.hass = this._hass;
      
      // Try to set config with error handling
      try {
        bubbleCard.setConfig(bubbleConfig);
      } catch (configError) {
        console.error('Bubble card config error:', configError);
        // Try with a simpler config if the main one fails
        const simpleConfig = this.generateSimpleBubbleConfig();
        console.log('Trying simple config:', simpleConfig);
        bubbleCard.setConfig(simpleConfig);
      }
      
      this.shadowRoot.appendChild(bubbleCard);
    } catch (error) {
      console.error('Bubble Room Card render error:', error);
      this.shadowRoot.innerHTML = `
        <ha-card>
          <div style="padding: 16px; color: red; text-align: center;">
            <h3>Render Error</h3>
            <p>${error.message}</p>
            <p><small>Check browser console for details</small></p>
          </div>
        </ha-card>
      `;
    }
  }

  generateSimpleBubbleConfig() {
    // Fallback simple configuration
    return {
      card_type: 'button',
      button_type: 'name',
      entity: this.config.main_entity,
      name: this.config.name,
      icon: this.config.icon,
      show_name: true,
      show_icon: true,
      show_state: true,
      tap_action: {
        action: 'navigate',
        navigation_path: this.config.navigation_path
      },
      styles: this.generateSimpleStyles()
    };
  }

  generateBubbleConfig() {
    const entities = this.config.entities.slice(0, 4); // Max 4 entities
    
    const subButtons = entities
      .filter(entity => this._hass.states[entity.entity]) // Only include existing entities
      .map((entity, index) => {
        const entityState = this._hass.states[entity.entity];
        const onState = entity.on_state || 'on';
        const isOn = entityState.state === onState;
        
        return {
          entity: entity.entity,
          show_last_changed: false,
          show_attribute: false,
          show_state: false,
          tap_action: {
            action: entity.tap_action || 'toggle'
          },
          show_background: true,
          icon: isOn ? (entity.icon_on || entity.icon) : (entity.icon_off || entity.icon),
          show_icon: true
        };
      });

    // Build the configuration object step by step to ensure all required fields are present
    const bubbleConfig = {};
    
    // Required fields first
    bubbleConfig.card_type = 'button';
    bubbleConfig.button_type = subButtons.length > 0 ? 'state' : 'name';
    bubbleConfig.entity = this.config.main_entity;
    
    // Optional fields
    bubbleConfig.name = this.config.name;
    bubbleConfig.icon = this.config.icon;
    bubbleConfig.show_name = true;
    bubbleConfig.show_icon = true;
    bubbleConfig.show_state = true;
    
    // Navigation action
    bubbleConfig.tap_action = {
      action: 'navigate',
      navigation_path: this.config.navigation_path
    };

    // Add sub-buttons if we have them
    if (subButtons.length > 0) {
      bubbleConfig.sub_button = subButtons;
      bubbleConfig.card_layout = 'large-2-rows';
    }

    // Add styles last
    bubbleConfig.styles = this.generateStyles();

    // Validate that card_type is definitely set
    if (!bubbleConfig.card_type) {
      console.error('card_type is missing from bubble config');
      bubbleConfig.card_type = 'button';
    }

    return bubbleConfig;
  }

  generateSimpleStyles() {
    return `
      .bubble-button-card {
        background-color: var(--ha-card-background, var(--card-background-color, white)) !important;
      }
      .bubble-name {
        color: var(--primary-text-color) !important;
      }
      .bubble-state {
        color: var(--secondary-text-color) !important;
      }
    `;
  }

  generateStyles() {
    const entities = this.config.entities
      .slice(0, 4)
      .filter(entity => this._hass.states[entity.entity]); // Only include existing entities
    
    if (entities.length === 0) {
      return this.generateSimpleStyles();
    }

    // Generate dynamic icon styles
    let iconVars = '';
    entities.forEach((entity, index) => {
      const num = index + 1;
      const onState = entity.on_state || 'on';
      const iconOn = entity.icon_on || entity.icon || 'mdi:power';
      const iconOff = entity.icon_off || entity.icon || 'mdi:power-off';
      
      iconVars += `    --bubble-sub-button-${num}-icon: \${hass.states['${entity.entity}'].state === '${onState}' ? '${iconOn}' : '${iconOff}'};\\n`;
    });

    // Generate main card dynamic colors
    let mainColorLogic = '';
    if (entities.length > 0) {
      const conditions = entities.map(entity => {
        const onState = entity.on_state || 'on';
        return `hass.states['${entity.entity}'].state === '${onState}'`;
      }).join(' || ');
      
      mainColorLogic = `
          --icon-color: \${${conditions} ? 'var(--icon-on-color)' : 'var(--icon-off-color)'};
          --icon-bg-color: \${${conditions} ? 'var(--icon-bg-on-color)' : 'var(--icon-bg-off-color)'};
          --card-bg-color: \${${conditions} ? 'var(--card-bg-on-color)' : 'var(--card-bg-off-color)'};`;
    }

    // Generate sub-button color styles
    let subButtonStyles = '';
    entities.forEach((entity, index) => {
      const num = index + 1;
      const onState = entity.on_state || 'on';
      subButtonStyles += `
      .bubble-sub-button-${num} {
        color: rgba(var(\${hass.states['${entity.entity}'].state === '${onState}' ? '--color-on' : '--color-off'}), 1) !important;
        background-color: rgba(var(\${hass.states['${entity.entity}'].state === '${onState}' ? '--color-bg-on' : '--color-bg-off'}), 0.3) !important;
      }
      .bubble-sub-button-${num} .bubble-sub-button-icon{
        animation: \${hass.states['${entity.entity}'].state === '${onState}' ? 'sound 0.8s infinite' : 'none'} !important;
      }`;
    });

    return `
      :host{
          /* ON state colors - green theme */
          --icon-on-color: #81c992;
          --icon-bg-on-color: #304536;
          --card-bg-on-color: #1d231f;
          
          /* OFF state colors - red theme */
          --icon-off-color: #f18b81;
          --icon-bg-off-color: #473332;
          --card-bg-off-color: #1d1d1d;
          
          ${mainColorLogic}
          
          /* Sub-button colors in RGB format for rgba() usage */
          --color-on: 129, 201, 146; /* light green (#81c992) */
          --color-off: 241, 139, 129; /* light red (#f18b81) */
          --color-bg-on: 48, 69, 54; /* dark green (#304536) */
          --color-bg-off: 71, 51, 50; /* dark red (#473332) */
      }

      .card-content {
        width: 100%;
        margin: 0 !important;
      }

      .large .bubble-button-card-container {
        height: auto !important;
        overflow: hidden !important;
      }

      .bubble-button-card {
        display: grid;
        grid-template-areas:
          'n n n b'
          'l l l b'
          'i i . b'
          'i i . b';
        grid-template-columns: 1fr 1fr 1fr 1fr;
        grid-template-rows: 1.5fr 0.5fr 1fr 1fr;
        justify-items: center;
        background-color: var(--card-bg-color, var(--ha-card-background)) !important;
        min-height: 120px;
      }

      .bubble-icon-container {
        grid-area: i;
        border-radius: 50% !important;
        width: 60px !important;
        height: 60px !important;
        position: relative !important;
        place-self: center !important;
        margin: 0 !important;
        padding: 0 !important;
        background-color: var(--icon-bg-color, var(--primary-color)) !important;
      }

      .bubble-icon {
        width: 60% !important;
        height: 60% !important;
        position: absolute !important;
        top: 50% !important;
        left: 50% !important;
        transform: translate(-50%, -50%) !important;
        color: var(--icon-color, var(--primary-text-color)) !important;
      }

      .bubble-name-container {
        grid-area: n;
        justify-self: start;
        margin-left: 20px;
        max-width: calc(100% - 60px);
      }

      .bubble-name {
        font-weight: bold;
        font-size: 16px;
        color: var(--icon-color, var(--primary-text-color));
        margin: 0;
      }

      .bubble-state {
        font-weight: normal;
        font-size: 14px;
        color: var(--icon-color, var(--secondary-text-color));
        margin: 0;
      }

      .bubble-sub-button-container {
        grid-area: b;
        display: flex !important;
        flex-direction: column;
        justify-content: space-evenly;
        align-items: center;
        width: 100% !important;
        height: 100% !important;
        padding: 10px;
      }

      .bubble-sub-button {
        min-width: 32px !important;
        width: 32px !important;
        height: 32px !important;
        border-radius: 50% !important;
        transition: transform 0.2s ease;
        margin: 2px 0;
      }

      .bubble-sub-button:active {
        transform: scale(0.9);
      }

      ${subButtonStyles}

      @keyframes sound {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }

      /* Dynamic icon changing based on states */ 
      ha-card {
${iconVars}      }
    `;
  }

  getCardSize() {
    return 3;
  }

  static getConfigElement() {
    return document.createElement('bubble-room-card-editor');
  }

  static getStubConfig() {
    return {
      name: 'Living Room',
      icon: 'mdi:sofa',
      main_entity: 'sensor.time',
      entities: [
        {
          entity: 'light.living_room',
          icon: 'mdi:lightbulb',
          icon_on: 'mdi:lightbulb',
          icon_off: 'mdi:lightbulb-off',
          on_state: 'on'
        }
      ]
    };
  }
}

customElements.define('bubble-room-card', BubbleRoomCard);

// Register the card
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'bubble-room-card',
  name: 'Bubble Room Card',
  description: 'A customizable room card with animated sub-buttons'
});

console.info(
  '%c  BUBBLE-ROOM-CARD  %c  Version 1.0.5  ',
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray'
);
