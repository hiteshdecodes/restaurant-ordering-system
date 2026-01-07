# Restaurant Theme Customization Feature

## Overview
This feature allows restaurant managers to customize the color theme of their restaurant's menu interface in real-time. Changes made in the Dashboard are instantly reflected across all connected customer menu instances using WebSocket technology.

## Features

### 1. **Color Customization**
- **Primary Color**: Used for buttons, accents, and interactive elements
- **Secondary Color**: Used for headings, text, and structural elements
- Both colors have automatic hover and active states generated

### 2. **Real-Time Updates**
- Changes made in the Dashboard are instantly broadcast to all connected customer menus
- Uses Socket.io for real-time WebSocket communication
- No page refresh required

### 3. **Automatic Color States**
- **Hover State**: Automatically lightened version of the primary color
- **Active State**: Automatically darkened version of the primary color
- Uses HSL color space for perceptually accurate color manipulation

## Architecture

### Components

#### 1. **Dashboard.js** (Admin Interface)
- Color picker UI with hex input fields
- Saves colors to the database via REST API
- Emits `restaurant-updated` socket event when colors change

#### 2. **CustomerMenu.js** (Customer Interface)
- Listens for `restaurant-updated` socket events
- Updates theme context when colors change
- Applies colors dynamically to all UI elements

### Context & Utilities

#### **ThemeContext.js**
- Manages global theme state
- Provides `useTheme()` hook for accessing colors
- Automatically generates hover/active states

#### **colorUtils.js**
- Color conversion utilities (hex ↔ RGB ↔ HSL)
- `generateHoverColor()`: Creates lighter shade for hover states
- `generateDarkerColor()`: Creates darker shade for active states

#### **useDynamicTheme.js**
- Hook that creates MUI theme objects dynamically
- Integrates with Material-UI theming system
- Memoized for performance

## Usage

### For Administrators

1. Navigate to Dashboard Settings
2. Scroll to "Theme Colors" section
3. Click color picker or enter hex code
4. Changes apply immediately to all connected customers

### For Developers

#### Using Theme Colors in Components
```javascript
import { useTheme } from '../context/ThemeContext';

function MyComponent() {
  const { theme, restaurantColors } = useTheme();
  
  return (
    <Box sx={{ 
      backgroundColor: theme.primary.main,
      '&:hover': {
        backgroundColor: theme.primary.light
      }
    }}>
      Content
    </Box>
  );
}
```

#### Using Dynamic MUI Theme
```javascript
import { useDynamicTheme } from '../hooks/useDynamicTheme';
import { ThemeProvider } from '@mui/material/styles';

function MyComponent() {
  const dynamicTheme = useDynamicTheme();
  
  return (
    <ThemeProvider theme={dynamicTheme}>
      {/* Your components */}
    </ThemeProvider>
  );
}
```

## Database Schema

### Restaurant Model
```javascript
{
  primaryColor: String,      // Hex color code (e.g., '#ff6b35')
  secondaryColor: String,    // Hex color code (e.g., '#2d5016')
  // ... other fields
}
```

## API Endpoints

### GET /api/restaurant
Returns current restaurant settings including colors

### PUT /api/restaurant
Updates restaurant settings including colors
- Accepts FormData with color fields
- Broadcasts changes via Socket.io

## Socket Events

### `restaurant-updated`
**Emitted by**: Dashboard (when colors are saved)
**Received by**: CustomerMenu
**Payload**: Updated restaurant data object with colors

```javascript
socket.emit('restaurant-updated', {
  primaryColor: '#ff6b35',
  secondaryColor: '#2d5016',
  // ... other restaurant data
});
```

## Color Manipulation Algorithm

### HSL Color Space
Colors are manipulated in HSL (Hue, Saturation, Lightness) space for perceptually accurate results:

- **Hover State**: Lightness increased by 20%
- **Active State**: Lightness decreased by 20%
- Hue and Saturation remain constant

This ensures colors remain visually consistent while providing clear visual feedback.

## Browser Compatibility
- Modern browsers with CSS custom properties support
- Tested on Chrome, Firefox, Safari, Edge
- Requires JavaScript enabled for real-time updates

## Performance Considerations
- Theme calculations are memoized
- Socket events are debounced to prevent excessive updates
- Color conversions use efficient algorithms
- No external color library dependencies (uses custom utilities)

## Future Enhancements
- Color palette presets
- Accessibility contrast checking
- Dark mode support
- Custom font selection
- Logo upload with color extraction

