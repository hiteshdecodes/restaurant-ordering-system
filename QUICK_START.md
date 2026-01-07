# Quick Start Guide - Theme Customization

## For Restaurant Managers

### How to Change Restaurant Colors

1. **Open Dashboard**
   - Navigate to the Dashboard admin panel
   - Click on "Settings" or the gear icon

2. **Find Theme Colors Section**
   - Scroll down in the Settings dialog
   - Look for "Theme Colors" heading
   - You'll see two color customization sections:
     - Primary Color (Buttons, Accents)
     - Secondary Color (Headings, Text)

3. **Change Colors**
   - **Option A - Color Picker**: Click the colored square to open color picker
   - **Option B - Hex Input**: Type hex color code directly (e.g., #FF6B35)

4. **Save Changes**
   - Click "Save" button
   - Changes apply instantly to all customer menus
   - No page refresh needed!

### Example Colors

**Warm Theme**
- Primary: #FF6B35 (Orange)
- Secondary: #2D5016 (Dark Green)

**Cool Theme**
- Primary: #0066CC (Blue)
- Secondary: #003366 (Dark Blue)

**Modern Theme**
- Primary: #E91E63 (Pink)
- Secondary: #1A237E (Deep Purple)

**Professional Theme**
- Primary: #1976D2 (Professional Blue)
- Secondary: #424242 (Dark Gray)

## For Developers

### Using Theme Colors in Components

```javascript
import { useTheme } from '../context/ThemeContext';

function MyComponent() {
  const { theme } = useTheme();
  
  return (
    <Box sx={{ 
      backgroundColor: theme.primary.main,
      '&:hover': {
        backgroundColor: theme.primary.light
      },
      '&:active': {
        backgroundColor: theme.primary.dark
      }
    }}>
      Click me!
    </Box>
  );
}
```

### Available Theme Properties

```javascript
theme = {
  primary: {
    main: '#ff6b35',        // Base color
    light: '#ff9966',       // Hover state (20% lighter)
    dark: '#cc5528',        // Active state (20% darker)
    contrastText: '#fff'    // Text color on primary
  },
  secondary: {
    main: '#2d5016',        // Base color
    light: '#5a8a3a',       // Hover state
    dark: '#1a2f0d',        // Active state
    contrastText: '#fff'    // Text color on secondary
  },
  background: {
    default: '#f5f5f5',
    paper: '#ffffff'
  },
  text: {
    primary: '#2d5016',     // Secondary color
    secondary: '#666666'
  }
}
```

### Accessing Raw Color Values

```javascript
import { useTheme } from '../context/ThemeContext';

function MyComponent() {
  const { restaurantColors } = useTheme();
  
  console.log(restaurantColors.primaryColor);    // '#ff6b35'
  console.log(restaurantColors.secondaryColor);  // '#2d5016'
}
```

## Architecture Overview

```
Dashboard (Admin)
    ↓
    └─→ Color Picker UI
        ↓
        └─→ Save to Database
            ↓
            └─→ Emit Socket Event: 'restaurant-updated'
                ↓
                └─→ CustomerMenu (All Instances)
                    ↓
                    └─→ Receive Socket Event
                        ↓
                        └─→ Update ThemeContext
                            ↓
                            └─→ All Components Re-render
                                ↓
                                └─→ New Colors Applied
```

## Troubleshooting

### Colors Not Updating?
1. Check browser console for errors
2. Verify Socket.io connection is active
3. Refresh the customer menu page
4. Check that colors were saved in Dashboard

### Colors Look Wrong?
1. Verify hex color format (#RRGGBB)
2. Check color contrast for accessibility
3. Try a different color combination
4. Clear browser cache and reload

### Socket Connection Issues?
1. Check server is running
2. Verify Socket.io is configured
3. Check browser console for connection errors
4. Try refreshing the page

## File Locations

- **Color Utilities**: `client/src/utils/colorUtils.js`
- **Theme Context**: `client/src/context/ThemeContext.js`
- **Dashboard Component**: `client/src/components/Dashboard.js`
- **Customer Menu**: `client/src/components/CustomerMenu.js`
- **Documentation**: `THEME_CUSTOMIZATION.md`

## Support

For issues or questions:
1. Check THEME_CUSTOMIZATION.md for detailed documentation
2. Review IMPLEMENTATION_SUMMARY.md for technical details
3. Check browser console for error messages
4. Verify Socket.io connection in Network tab

