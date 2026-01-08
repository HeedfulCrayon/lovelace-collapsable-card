# Collapsable cards

Hide a list of cards behind a dropdown.

https://user-images.githubusercontent.com/3329319/117338763-db269b80-ae96-11eb-8b1a-36e96d3b3d67.mov

Big thanks to [ofekashery, the author of vertical-stack-in-card](https://github.com/ofekashery/vertical-stack-in-card), whose code I copied to make this card.

## Options

| Name       | Type    | Default      | Description                               |
| ---------- | ------- | ------------ | ----------------------------------------- |
| type       | string  |  | `custom:collapsable-card`           |
| cards      | list    |  | List of cards                         |
| head       | card    |  | Card that will be displayed instead of toggle text |
| defaultOpen | string | false | Whether the cards should be visible by default. Can also be set to `desktop-only` to be open by default on desktop and collapsed by default on mobile. Or `contain-toggled` to open only if there are active entities |
| expand_upward | bool | false | Expands the list of cards above the toggle button |
| show_icon | bool | true | Whether the chevron icon should be visible or not |
| content_alignment | string | "justify" | Determines how the content of the toggle button should be aligned.  Options are `left`, `center`, `right`, `justify` and `even`
| title      | string  | "Toggle" | Button title                       |
| buttonStyle| string  | "" | CSS overrides for the dropdown toggle button |
| button_padding | string | "16px" (or "0px" if head is used) | CSS padding value for the toggle button (e.g., "16px", "10px 20px") |
| content_padding | string | "8px" | CSS padding value for the card list when expanded (e.g., "8px", "12px") |
| card_margin | string | "0" | CSS margin value for the card. Applied to toggle button and directionally to card list: as margin-top when expanding upward, margin-bottom when expanding downward (e.g., "0", "8px", "10px 5px") |

## Installation

# HACS

Add this repository via HACS Custom repositories 

https://github.com/HeedfulCrayon/lovelace-collapsable-cards

([How to add Custom Repositories](https://hacs.xyz/docs/faq/custom_repositories/))
 
# Manually
[In-depth tutorial here](https://github.com/thomasloven/hass-config/wiki/Lovelace-Plugins), otherwise follow these steps:

1. Install the `collapsable-cards` card by copying `collapsable-card.js` to `<config directory>/www/collapsable-card.js`

2. On your lovelace dashboard
    1. Click options
    2. Edit dashboard
    3. Click Options
    4. Manage resources
    5. Add resource
        - URL: /local/collapsable-card.js
        - Resource type: JavaScript module

3. Add a custom card to your dashboard


```yaml
type: 'custom:collapsable-card'
title: Office
cards:
  - type: entities
    entities:
      - entity: light.office_desk_led
      - entity: light.office_led_strips
      - entity: sensor.ross_work_laptop_is_on
    show_header_toggle: false
```
