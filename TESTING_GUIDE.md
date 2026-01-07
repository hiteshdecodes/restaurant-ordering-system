# Testing Guide - Real-Time Theme Customization

## Pre-Test Checklist

- [ ] Server is running
- [ ] Client is running
- [ ] Database is accessible
- [ ] Socket.io is configured
- [ ] Browser console is open (F12)

## Test 1: Color Picker UI Visibility

**Steps:**
1. Navigate to Dashboard
2. Click Settings/Gear icon
3. Scroll down in dialog

**Expected Result:**
- "Theme Colors" section visible
- Two color picker sections:
  - Primary Color (Buttons, Accents)
  - Secondary Color (Headings, Text)
- Each section has:
  - Color picker square
  - Hex input field
  - Labels

**Pass/Fail:** ___

## Test 2: Color Picker Functionality

**Steps:**
1. Click on Primary Color picker square
2. Select a new color from color picker
3. Verify hex field updates
4. Click on Secondary Color picker square
5. Select a new color

**Expected Result:**
- Color picker opens when clicking square
- Hex field updates with selected color
- Both colors can be changed independently

**Pass/Fail:** ___

## Test 3: Hex Input Validation

**Steps:**
1. Click Primary Color hex field
2. Clear current value
3. Type: #FF0000 (red)
4. Press Tab or click elsewhere
5. Verify color picker updates

**Expected Result:**
- Hex field accepts valid hex codes
- Color picker reflects the entered color
- Invalid formats are handled gracefully

**Pass/Fail:** ___

## Test 4: Save and Database Update

**Steps:**
1. Change Primary Color to #0066CC
2. Change Secondary Color to #003366
3. Click Save button
4. Wait for confirmation

**Expected Result:**
- Dialog closes
- No errors in console
- Colors saved to database
- Can verify in database: Restaurant collection

**Pass/Fail:** ___

## Test 5: Real-Time Socket Update

**Steps:**
1. Open two browser windows/tabs
2. Window A: Dashboard (admin)
3. Window B: Customer Menu
4. In Window A: Change Primary Color to #FF6B35
5. Click Save
6. Observe Window B

**Expected Result:**
- Window B updates immediately
- No page refresh needed
- All buttons/accents change color
- No console errors

**Pass/Fail:** ___

## Test 6: Multiple Client Updates

**Steps:**
1. Open 3+ customer menu instances
2. Change colors in Dashboard
3. Observe all instances

**Expected Result:**
- All instances update simultaneously
- No lag or delay
- All show same colors
- No console errors

**Pass/Fail:** ___

## Test 7: Hover State Generation

**Steps:**
1. Change Primary Color to #FF0000 (red)
2. Save changes
3. In Customer Menu, hover over buttons
4. Observe button color on hover

**Expected Result:**
- Hover color is lighter than base color
- Hover color is still recognizable as same color family
- Smooth transition on hover
- No visual glitches

**Pass/Fail:** ___

## Test 8: Active State Generation

**Steps:**
1. Change Primary Color to #0066CC (blue)
2. Save changes
3. In Customer Menu, click and hold on button
4. Observe button color while pressed

**Expected Result:**
- Active color is darker than base color
- Active color is still recognizable as same color family
- Clear visual feedback for pressed state

**Pass/Fail:** ___

## Test 9: Color Persistence

**Steps:**
1. Set colors to custom values
2. Save changes
3. Refresh Dashboard page
4. Check Settings dialog

**Expected Result:**
- Colors are still set to custom values
- No reset to defaults
- Colors persist in database

**Pass/Fail:** ___

## Test 10: Socket Reconnection

**Steps:**
1. Open Customer Menu
2. Change colors in Dashboard
3. Verify update received
4. Disconnect network (DevTools)
5. Change colors again in Dashboard
6. Reconnect network
7. Observe Customer Menu

**Expected Result:**
- Initial update works
- After reconnection, latest colors are applied
- No stale data displayed
- Graceful error handling

**Pass/Fail:** ___

## Test 11: Color Contrast

**Steps:**
1. Set Primary Color to #FFFF00 (yellow)
2. Set Secondary Color to #FFFFFF (white)
3. View Customer Menu
4. Check text readability

**Expected Result:**
- Text is readable on colored backgrounds
- No accessibility issues
- Good contrast ratio

**Pass/Fail:** ___

## Test 12: Browser Compatibility

**Test on:**
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

**Expected Result:**
- Feature works on all modern browsers
- Colors display correctly
- Socket connection works
- No console errors

**Pass/Fail:** ___

## Test 13: Performance

**Steps:**
1. Open Customer Menu
2. Change colors 10+ times rapidly
3. Monitor browser performance
4. Check for lag or stuttering

**Expected Result:**
- No lag or stuttering
- Smooth color transitions
- CPU usage remains reasonable
- Memory usage stable

**Pass/Fail:** ___

## Test 14: Error Handling

**Steps:**
1. Disconnect server
2. Try to save colors in Dashboard
3. Observe error handling
4. Reconnect server
5. Try again

**Expected Result:**
- Error message displayed
- No crash or freeze
- User can retry
- Graceful degradation

**Pass/Fail:** ___

## Test 15: Default Colors

**Steps:**
1. Reset database
2. Open Dashboard Settings
3. Check color values

**Expected Result:**
- Primary Color: #ff6b35 (orange)
- Secondary Color: #2d5016 (green)
- Defaults match documentation

**Pass/Fail:** ___

## Summary

**Total Tests:** 15
**Passed:** ___
**Failed:** ___
**Notes:** 

---

## Known Issues / Observations

(Document any issues found during testing)

---

## Sign-Off

Tested by: _______________
Date: _______________
Status: [ ] PASS [ ] FAIL

