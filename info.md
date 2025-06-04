# Bubble Room Card

A customizable Home Assistant Lovelace card that creates beautiful room cards with animated sub-buttons.

## Features

- Animated sub-buttons with pulsing effects
- Dynamic green/red color themes
- Support for 1-4 configurable entities per room
- Custom icons for on/off states
- Room-based organization
- Built on Bubble Card for reliability

## Quick Start

```yaml
type: custom:bubble-room-card
name: Living Room
icon: mdi:sofa
main_entity: sensor.living_room_temperature
entities:
  - entity: light.living_room_lights
    icon: mdi:lightbulb
    on_state: "on"
```

**Note**: Requires [Bubble Card](https://github.com/Clooos/Bubble-Card) to be installed first.
