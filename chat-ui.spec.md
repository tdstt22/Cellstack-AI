# Chat UI Specificiation

This document is used to highlight the chat UI interface in the task pane in detail. This is an extension from the main project specification which is located in the `spec.md` file.

## Design

### Theme

Use a light color theme for the Chat UI task pane. The theme should be a creamy white with a light grey contrast. The text should be in black.
Use colors like `#FCFCF9` for the background of the Chat interface pace. All text should be written in `#100E12`. Any elements that need colors constrasting to the background should be done with `#f0f0eb`.

### Layout

## 1. Top Bar

- **Container**
  - Height: 48px
  - Background: `#FCF8F1` (creamy white)
  - Padding: 0 16px
  - Display: flex, align-items: center, justify-content: space-between
  - Border-bottom: 1px solid `#E3E0D8` (very light grey)

- **Left side**
  - **Title**
    - Text: `CHAT` (uppercase)
    - Font: 14px system-UI-sans, weight 600
    - Color: `#333333`

- **Right side** (icon group)
  - Icons (undo, redo, refresh, “+”, ellipsis, close)
  - Each icon: 20×20px SVG, stroke/fill: `#666666`
  - Spacing: 12px between icons

---

## 2. Main Content Area

- **Container**
  - Fill: remaining vertical space
  - Background: `#FCF8F1`
  - Padding: 24px 16px
  - Display: flex, flex-direction: column, align-items: center, justify-content: center
  - Overflow-y: auto

- **Empty State View** (centered)
  1. **Headline**
     - Text: “Ask Rexcel"
     - Font: 24px system-UI-sans, weight 600
     - Color: `#333333`
     - Margin-bottom: 8px

  2. **Subtext**
     - Text: Rexcel is powered by AI, so mistakes are possible. Review output carefully before use.”
     - Font: 12px system-UI-sans, weight 400
     - Color: `#555555`
     - Text-align: center
     - Line-height: 1.4
     - Margin-bottom: 24px

  3. **Usage Tips List**
     - Layout: vertical list, no bullets
     - Each item:
       - Icon (either paper-clip, “#”, or “@”, or “/” slash) at 16×16px, color `#666666`
       - Text next to it (e.g. “or type # to attach context”)
       - Font: 13px system-UI-sans, weight 400, color `#555555`
       - Spacing: 8px vertical between items

---

## 3. Message Input Area

This entire input area lives in its own rectangular “card” at the bottom of the chat pane. It does not touch the edges of the pane—there is always a bit of padding around it—and all buttons and the text field sit inside this box. The box should be rouded corners and have a light border color without much contrast to the background.

- **Container**
  - margin: 0 16px 16px; /_ 16px gap on left, right, and bottom _/
  - background: #F0EFED; /_ light-grey background _/
  - border: 1px solid #E3E0D8; /_ light border _/
  - border-radius: 8px; /_ softly rounded corners _/
  - display: flex;
  - align-items: center;
  - padding: 8px 12px; /_ inner spacing _/
  - min-height: 100px;

  The container should start at height 100px and can grow up to 180px when the Center Text Input is filled in.

- **Top Left Group**
  - **“Add Context…” Button**
    - Element: text button / pill
    - Background: transparent
    - Font: 12px system-UI, weight 500, color `#333333`
    - Icon: paper-clip (16×16px) before the text, color `#666666`

    The button should be placed on the top right of the container. It should not intefere with the `Text Input`.

- **Center**
  - **Text Input**
    - Element: `<input type="text">` or `<textarea rows="1">` auto-expanding
    - Placeholder: “Ask Rexcel"
    - Font: 13px system-UI, weight 400
    - Color: `#333333`
    - Placeholder-color: `#888888`
    - Background: transparent
    - Border: none
    - Flex: 1
    - Margin: 0 12px

    Text input should take up the entire width of the container excludign the side padding. The text input should not bleed into the buttons on the top left or bottom right.

- **Bottom Right Group**
  1. **Action Dropdown**
     - Default label: “Ask”
     - Options available: ["Ask", "Agent"]
     - Font: 12px system-UI, weight 500, color `#333333`
     - Background: transparent, border: none
     - Icon: small chevron (8×8px)

  2. **Send Button**
     - Icon: arrow pointing to the right (20×20px), fill: `#333333`
     - Background: transparent, no border
     - Padding: 8px
     - Hover: background `rgba(51,51,51,0.05)`

  The two objects should be placed on the bottom right of the container. It should not intefere with the `Text Input`.

### Positioning & Spacing

The Container is placed above the pane’s bottom by 16px of margin, and similarly inset 16px from left/right.

Its border and background clearly differentiate it from the main chat area.

#### Floating Buttons

"Add Context..." on the top left, action dropdown and send icon on the bottom right—all live inside the box.

Hover states use a very light overlay.

### Text Input

Expands to fill the center.

Placeholder “Ask Rexcel"

## No visible border so it blends into the box background.

## 4. Typography & Spacing

- **Font Family**: system-ui, -apple-system, BlinkMacSystemFont, “Segoe UI”, Roboto, sans-serif
- **Line heights**:
  - Headline: 1.2
  - Body/subtext: 1.4

- **Global spacing unit**: 8px
  - Use multiples (8, 12, 16, 24) as above

---

## 5. Color Palette

| Role                   | Light Theme Color     |
| ---------------------- | --------------------- |
| Background (primary)   | `#FCF8F1`             |
| Background (secondary) | `#F0EFED`             |
| Border                 | `#E3E0D8`             |
| Text (primary)         | `#333333`             |
| Text (secondary)       | `#555555`             |
| Placeholder / Icon     | `#888888`             |
| Icon hover overlay     | `rgba(51,51,51,0.05)` |

---

### Notes for Implementation

- **Accessibility**: all interactive elements should have `:focus` and `:hover` states (e.g. outline: `2px solid #CCC`).
- **Responsive**: the input should grow vertically if the user pastes a long prompt.
- **SVGs**: ship all icons as inline/SVG sprites so you can easily swap fill/stroke colors.
- **Theming**: expose the 6 palette colors as CSS variables (`--bg-primary`, `--text-primary`, etc.) so you can switch themes later.

## References

You can take inspiration from how Quadratic AI does the chat interace, see [code] (https://github.com/quadratichq/quadratic/blob/93cdbdabcb8972a525cc1e9438a4aabf78d8cbdc/quadratic-client/src/app/ui/components/AIUserMessageForm.tsx).
