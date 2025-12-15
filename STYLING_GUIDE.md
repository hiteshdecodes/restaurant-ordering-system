# 🎨 STYLING COMPONENTS GUIDE

## 📍 WHERE IS THE STYLING?

All styling in our restaurant ordering system is done using **Material-UI (MUI)** with inline `sx` props. There are NO separate CSS files for component styling.

---

## 📂 STYLING FILES LOCATION

### **1. Global Styling**
- **File**: `latest ordering solution/client/src/index.css`
- **Lines**: 1-14
- **Contains**: 
  - Font family setup
  - Font smoothing
  - Basic body styling

### **2. App-level Styling**
- **File**: `latest ordering solution/client/src/App.css`
- **Lines**: 1-107
- **Contains**:
  - MUI component transitions (Tabs, Collapse, Drawer, Dialog, Button, Card, Chip)
  - Animation timing functions
  - Reduced motion preferences

---

## 🎯 COMPONENT STYLING LOCATIONS

### **CustomerMenu.js** - MAIN STYLING FILE
**File**: `latest ordering solution/client/src/components/CustomerMenu.js`

#### **Header Section** (Lines 320-342)
- Logo/Title styling
- Logout button styling
- Header layout with flexbox

#### **Search Bar & Category Tabs** (Lines 346-396)
- **Search Bar**: Lines 349-370
  - TextField with SearchIcon
  - Clear button styling
  - Sticky positioning
  
- **Category Tabs**: Lines 372-395
  - Scrollable tabs
  - Tab indicator styling
  - Border styling

#### **Category Headers** (Lines 408-426)
- **Styling**:
  - `backgroundColor: 'primary.main'` (Blue color)
  - `color: 'white'`
  - `borderRadius: 1`
  - Hover effect: `'&:hover': { backgroundColor: 'primary.dark' }`
  - Cursor pointer for expand/collapse

#### **Menu Items** (Lines 433-531)
- **Item Container**: Lines 433-443
  - Flexbox layout
  - Border bottom: `'1px solid #eee'`
  - Hover effect: `backgroundColor: '#fafafa'`
  
- **Item Image**: Lines 446-457
  - Width: 100px, Height: 80px
  - Border radius: 2
  - Object fit: cover
  
- **Item Name & Price**: Lines 461-507
  - Name: `variant="subtitle1" fontWeight="bold"`
  - Price: `color="primary"` (Blue)
  - Description: `color="text.secondary"` (Gray)
  
- **Veg/Non-Veg Icons**: Lines 466-487
  - Size: 24x24px
  - Positioned next to item name
  
- **Spicy Chip**: Lines 488-496
  - `color="error"` (Red)
  - Size: small
  
- **Quantity Controls**: Lines 508-528
  - Outlined buttons
  - Size: small
  - Remove/Add icons

#### **Cart Drawer** (Lines 560-658)
- **Floating Cart Button**: Lines 548-550
  - `position: 'fixed'`
  - `bottom: 16, right: 16`
  - `color="primary"`
  
- **Cart Drawer**: Lines 560-658
  - `anchor="bottom"`
  - `borderTopLeftRadius: 16`
  - `borderTopRightRadius: 16`
  - Max height: 80vh
  
- **Cart Items**: Lines 604-640
  - Similar layout to menu items
  - Quantity controls
  - Remove button
  
- **Cart Footer**: Lines 641-658
  - Total price display
  - Place Order button
  - Button styling: `variant="contained"` (Blue)

#### **Order Success Modal** (Lines 661-745)
- **Modal Dialog**: Lines 663-745
  - `maxWidth="sm"`
  - `fullWidth`
  - Border radius: 3
  - Box shadow: `'0 20px 60px rgba(0, 0, 0, 0.3)'`
  
- **Close Button**: Lines 686-697
  - Position: absolute
  - Top: 12, Right: 12
  - Background: `'rgba(0, 0, 0, 0.05)'`
  
- **Checkmark Circle**: Lines 700-720
  - Width/Height: 120px
  - Border radius: 50% (circle)
  - Background: `'#4caf50'` (Green)
  - Animation: scaleIn 0.6s
  
- **Success Text**: Lines 722-743
  - Variant: h4
  - Font weight: bold
  - Color: `'#1b5e20'` (Dark green)

---

## 🎨 COLOR PALETTE USED

| Element | Color | Hex Code |
|---------|-------|----------|
| Primary (Buttons, Headers) | Blue | `primary.main` |
| Primary Dark (Hover) | Dark Blue | `primary.dark` |
| Error (Spicy, Delete) | Red | `error` |
| Success (Checkmark) | Green | `#4caf50` |
| Text Primary | Dark | `text.primary` |
| Text Secondary | Gray | `text.secondary` |
| Background | White | `background.default` |
| Borders | Light Gray | `#eee` |
| Hover Background | Very Light Gray | `#fafafa` |

---

## 🔧 HOW TO MODIFY STYLING

All styling uses MUI's `sx` prop. To change styling:

1. **Find the component** in CustomerMenu.js
2. **Locate the `sx` prop** in that component
3. **Modify the CSS properties** inside the sx object
4. **Save and refresh** the browser

Example:
```javascript
// Before
sx={{ backgroundColor: 'primary.main', color: 'white' }}

// After
sx={{ backgroundColor: '#ff6b35', color: 'white' }}
```

---

## 📱 RESPONSIVE DESIGN

Currently using MUI's default responsive breakpoints:
- `xs`: 0px
- `sm`: 600px
- `md`: 960px
- `lg`: 1280px
- `xl`: 1920px

To add responsive styling, use:
```javascript
sx={{
  fontSize: { xs: '12px', sm: '14px', md: '16px' }
}}
```

