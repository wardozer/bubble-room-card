# Bubble Room Card

A customizable Home Assistant Lovelace card that creates beautiful room cards with animated sub-buttons. Built as a configuration generator for the popular [bubble-card](https://github.com/Clooos/Bubble-Card).

## Features

- ✨ **Animated Sub-buttons**: Pulsing animations when entities are active
- 🎨 **Dynamic Colors**: Green theme for "on" states, red theme for "off" states  
- 🏠 **Room-Based**: Perfect for organizing entities by room
- ⚙️ **Highly Configurable**: Customize everything from icons to entity states
- 📱 **Responsive**: Works great on mobile and desktop
- 🔧 **Easy Setup**: Simple YAML configuration

## Prerequisites

This card requires the [Bubble Card](https://github.com/Clooos/Bubble-Card) to be installed first, as it generates configurations for bubble-card.

## Installation

### HACS (Recommended)

1. Open HACS in Home Assistant
2. Go to "Frontend" section
3. Click the 3 dots menu → "Custom repositories"
4. Add repository: `https://github.com/wardozer/bubble-room-card`
5. Category: `Lovelace`
6. Install "Bubble Room Card"
7. Restart Home Assistant

### Manual Installation

1. Download `bubble-room-card.js` from this repository
2. Copy it to your `www` folder in Home Assistant
3. Add the resource in Lovelace:
   ```yaml
   resources:
     - url: /local/bubble-room-card.js
       type: module
   ```

## Configuration

### Basic Example

```yaml
type: custom:bubble-room-card
name: Living Room
icon: mdi:sofa
main_entity: sensor.living_room_temperature
entities:
  - entity: light.living_room_lights
    icon: mdi:lightbulb
    on_state: "on"
  - entity: switch.living_room_outlets
    icon: mdi:power-socket
    on_state: "on"
```

### Full Configuration

```yaml
type: custom:bubble-room-card
name: Living Room                              # Room name (required)
icon: mdi:sofa                                # Room icon (required)
main_entity: sensor.living_room_temperature   # Main entity for temperature/state display
navigation_path: /lovelace/living-room        # Optional: path when card is tapped
entities:                                     # 1-4 sub-button entities
  - entity: light.living_room_lights          # Entity ID (required)
    icon: mdi:lightbulb                       # Default icon (required)
    icon_on: mdi:lightbulb                    # Icon when entity is "on"
    icon_off: mdi:lightbulb-off               # Icon when entity is "off"
    on_state: "on"                            # State that counts as "on" (default: "on")
    tap_action: toggle                        # Action when tapped (default: toggle)
  - entity: switch.living_room_outlets
    icon: mdi:power-socket-uk
    icon_on: mdi:power-socket
    icon_off: mdi:power-socket-off
    on_state: "on"
    tap_action: toggle
  - entity: media_player.living_room_tv
    icon: phu:apple-tv
    icon_on: mdi:television
    icon_off: mdi:television-off
    on_state: "playing"                       # Media players use "playing" state
    tap_action: toggle
```

## Configuration Options

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `name` | string | **Required** | Display name for the room |
| `icon` | string | **Required** | MDI icon for the room |
| `main_entity` | string | **Required** | Entity ID for main display (usually temperature sensor) |
| `navigation_path` | string | `/lovelace/default` | Path to navigate when card is tapped |
| `entities` | list | `[]` | List of 1-4 sub-button entities |

### Entity Configuration

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `entity` | string | **Required** | Entity ID |
| `icon` | string | **Required** | Default MDI icon |
| `icon_on` | string | `icon` | Icon when entity is in "on" state |
| `icon_off` | string | `icon` | Icon when entity is in "off" state |
| `on_state` | string | `"on"` | State value that represents "on" |
| `tap_action` | string | `toggle` | Action when sub-button is tapped |

## Examples

### Kitchen Card
```yaml
type: custom:bubble-room-card
name: Kitchen
icon: mdi:chef-hat
main_entity: sensor.kitchen_temperature
entities:
  - entity: light.kitchen_lights
    icon: mdi:ceiling-light
    on_state: "on"
  - entity: switch.coffee_maker
    icon: mdi:coffee
    on_state: "on"
```

### Bedroom Card (Minimal)
```yaml
type: custom:bubble-room-card
name: Bedroom
icon: mdi:bed
main_entity: sensor.bedroom_temperature
entities:
  - entity: light.bedroom_lights
    icon: mdi:lamp
    on_state: "on"
```

## Color Scheme

The card uses a fixed color scheme:
- **On State**: Green theme (#81c992)
- **Off State**: Red theme (#f18b81)
- **Backgrounds**: Dark green/red variants

## Animations

- **Pulse Animation**: Sub-buttons pulse when their entity is in the "on" state
- **Click Animation**: Brief scale-down effect when buttons are pressed
- **Dynamic Colors**: Card and buttons change colors based on entity states

## Troubleshooting

### Card Not Appearing
1. Make sure Bubble Card is installed first
2. Check that the resource is properly loaded in Lovelace
3. Verify your YAML configuration syntax

### Icons Not Changing
- Make sure `icon_on` and `icon_off` are properly specified
- Check that your `on_state` matches your entity's actual state values
- For media players, use `"playing"` instead of `"on"`

### Colors Not Working
- Ensure your entities are reporting the correct states
- Check the browser console for any JavaScript errors

## Contributing

Feel free to open issues or submit pull requests!

## License

MIT License - see LICENSE file for details

## Credits

- Built on top of [Bubble Card](https://github.com/Clooos/Bubble-Card) by Clooos
- Inspired by modern smart home interfaces
