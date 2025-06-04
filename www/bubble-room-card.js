class BubbleRoomCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  setConfig(config) {
    if (!config) {
      throw new Error('Invalid configuration');
    }

    this.config = {
      name: config.name || 'Room',
      icon: config.icon || 'mdi:home',
      main_entity: config.main_entity,
      entities: config.entities || [],
      navigation_path: config.navigation_path || '/lovelace/default',
      ...config
    };

    this.render();
  }

  render() {
    const bubbleConfig = this.generateBubbleConfig();
    
    // Create bubble card element
    const bubbleCard = document.createElement('bubble-card');
    bubbleCard.setConfig(bubbleConfig);
    
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(bubbleCard);
  }

  generateBubbleConfig() {
    const entities = this.config.entities.slice(0, 4); // Max 4 entities
    
    const subButtons = entities.map((entity, index) => ({
      entity: entity.entity,
      show_last_changed: false,
      show_attribute: false,
      show_state: false,
      tap_action: {
        action: entity.tap_action || 'toggle',
        haptic: 'light'
      },
      show_background: true,
      icon: entity.icon || 'mdi:power'
    }));

    const bubbleConfig = {
      type: 'custom:bubble-card',
      card_type: 'button',
      layout_options: {
        grid_columns: 2,
        grid_rows: 3
      },
      entity: this.config.main_entity,
      name: this.config.name,
      icon: this.config.icon,
      show_attribute: false,
      show_name: true,
      show_icon: true,
      scrolling_effect: true,
      show_state: true,
      card_layout: 'large-2-rows',
      button_type: 'state',
      sub_button: subButtons,
      tap_action: {
        action: 'navigate',
        navigation_path: this.config.navigation_path,
        haptic: 'light'
      },
      styles: this.generateStyles()
    };

    return bubbleConfig;
  }

  generateStyles() {
    const entities = this.config.entities.slice(0, 4);
    
    // Generate dynamic icon styles
    let iconVars = '';
    entities.forEach((entity, index) => {
      const num = index + 1;
      const onState = entity.on_state || 'on';
      iconVars += `    --bubble-sub-button-${num}-icon: \${hass.states['${entity.entity}'].state === '${onState}' ? '${entity.icon_on || entity.icon || 'mdi:power'}' : '${entity.icon_off || entity.icon || 'mdi:power-off'}'};\\n`;
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
        animation: \${hass.states['${entity.entity}'].state === '${onState}' ? 'sound 0.8s' : ''} !important;
        animation-iteration-count: infinite !important;
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
        height: calc( var(--row-height) * var(--row-size) + var(--row-gap) * ( var(--row-size) - 1 )) !important;
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
        background-color: var(--card-bg-color) !important;
      }

      .bubble-icon-container {
        grid-area: i;
        border-radius: 50% !important;
        width: 150% !important;
        height: 150% !important;
        max-width: none !important;
        max-height: none !important;
        position: absolute !important;
        place-self: center !important;
        margin: 0px 0px 0px 0px !important;
        padding: 0px !important;
        background-color: var(--icon-bg-color);
      }

      .bubble-icon {
        width: 40%;
        position: relative !important;
        --mdc-icon-size: 100px !important;
        opacity: 0.5 !important;
        color: var(--icon-color) !important;
      }

      .bubble-name-container {
        grid-area: n;
        justify-self: start;
        margin-left: 20px;
        max-width: calc(100% - (12px + 0px));
      }

      .bubble-name {
        font-weight: bold;
        font-size: 16px;
        color: var(--icon-color);
      }

      .bubble-state {
        font-weight: bold;
        font-size: 14px;
        color: var(--icon-color);
      }

      .rows-2 .bubble-sub-button-container {
        grid-area: b;
        display: flex !important;
        flex-wrap: wrap;
        flex-direction: column;
        justify-content: space-evenly;
        width: auto !important;
        padding-right: 0px;
        height: 100% !important;
        padding-top: 10px;
        padding-bottom: 10px;
      }

      .rows-2 .bubble-sub-button {
        height: 32px !important;
      }

      .bubble-sub-button {
        min-width: 32px !important;
        width: 32px !important;
        border-radius: 50% !important;
        transition: transform 0.2s ease;
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
      main_entity: 'sensor.temperature',
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
  '%c  BUBBLE-ROOM-CARD  %c  Version 1.0.0  ',
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray'
);
