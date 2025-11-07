# Mobile Swipe Actions

**Implementation Date**: November 7, 2025  
**Status**: ✅ Implemented & Active  
**Task ID**: T116

## Overview

Mobile swipe gestures provide an intuitive way to interact with tasks on touch devices:

- **Swipe Left** → Delete task
- **Swipe Right** → Complete/Uncomplete task
- **Visual Feedback** → Background color changes during swipe (red for delete, green for complete)
- **Haptic Feedback** → Tactile response when action is executed
- **Threshold-Based** → Actions only execute when swipe distance exceeds 80px

## Components

### 1. Touch Swipe Detection Hook

**File**: `src/hooks/useTouchSwipe.js`

A custom Preact hook that detects horizontal swipe gestures using native touch events.

**Features**:

- Tracks touch start, move, and end positions
- Calculates swipe direction (left/right) and distance
- Prevents vertical scrolling during horizontal swipes
- Supports velocity-based threshold detection
- Provides swipe progress (0-1) for visual feedback

**Configuration**:

```javascript
const {
  swipeOffset, // Current horizontal offset (px)
  isSwiping, // Whether user is currently swiping
  swipeDirection, // 'left' or 'right'
  swipeProgress, // 0 to 1 (progress toward threshold)
  isThresholdMet, // Whether threshold distance reached
  handlers, // Touch event handlers
} = useTouchSwipe({
  onSwipeLeft: () => {}, // Callback for left swipe
  onSwipeRight: () => {}, // Callback for right swipe
  threshold: 80, // Distance to trigger action (px)
});
```

**Constants**:

- `SWIPE_THRESHOLD`: 80px (minimum distance to trigger action)
- `SWIPE_VELOCITY_THRESHOLD`: 0.3px/ms (fast swipes trigger action sooner)
- `MAX_VERTICAL_DEVIATION`: 50px (max vertical movement for horizontal swipe)

### 2. TaskItem Component Integration

**File**: `src/components/TaskItem.jsx`

The TaskItem component integrates swipe functionality with visual feedback.

**Swipe Actions**:

```javascript
// Swipe left → Delete
const handleSwipeLeft = () => {
  hapticDelete();
  onDelete(task.id);
};

// Swipe right → Complete/Uncomplete
const handleSwipeRight = () => {
  hapticTaskComplete();
  onToggle(task.id);
};
```

**Visual Feedback**:

- **Background Color**: Fades in red (delete) or green (complete) based on swipe direction
- **Opacity**: Increases with swipe progress (max 30%)
- **Transform**: Task translates horizontally following finger movement
- **Icons**: Shows 🗑️ (delete) or ✓ (complete) when threshold is met

**Animation**:

- **During Swipe**: Instant translation (no transition)
- **On Release**: Spring-back animation if threshold not met
- **On Action**: Immediate execution (delete or complete)

## User Experience

### Swipe Right (Complete/Uncomplete)

1. User touches task and swipes right
2. Task slides right following finger
3. Background fades to green
4. When distance > 80px: ✓ icon appears and pulses
5. On release: Task completes with haptic feedback
6. Task animates to Completed section

### Swipe Left (Delete)

1. User touches task and swipes left
2. Task slides left following finger
3. Background fades to red
4. When distance > 80px: 🗑️ icon appears and pulses
5. On release: Task deletes with haptic feedback
6. Task disappears from list

### Partial Swipe (< 80px)

1. User swipes but doesn't reach threshold
2. Visual feedback shows partial progress
3. On release: Task springs back to original position
4. No action executed

## Accessibility

**ARIA Labels**: Updated to include swipe instructions

```
"Press Enter or Space to toggle completion. Press Delete to remove.
Swipe left to delete, swipe right to toggle completion."
```

**Alternative Actions**: All swipe actions have keyboard/mouse equivalents

- Click task → Complete/Uncomplete
- Delete button → Delete task
- Space/Enter keys → Complete/Uncomplete
- Delete/Backspace keys → Delete task

## Technical Details

### Touch Event Handling

```javascript
// Touch start: Record initial position
onTouchStart={(e) => {
  const touch = e.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
}}

// Touch move: Update position and prevent scroll
onTouchMove={(e) => {
  const deltaX = touch.clientX - touchStartX;
  const deltaY = Math.abs(touch.clientY - touchStartY);

  // Prevent vertical scroll if horizontal swipe
  if (Math.abs(deltaX) > 10) {
    e.preventDefault();
  }

  setSwipeOffset(deltaX);
}}

// Touch end: Execute action if threshold met
onTouchEnd={() => {
  if (Math.abs(deltaX) >= threshold) {
    // Execute action
  }
  // Reset state
}}
```

### Visual Feedback Calculation

```javascript
const getSwipeBackgroundColor = () => {
  if (!isSwiping || swipeProgress === 0) return "transparent";

  if (swipeDirection === "left") {
    // Red for delete
    const opacity = Math.min(swipeProgress * 0.3, 0.3);
    return `rgba(239, 68, 68, ${opacity})`;
  } else if (swipeDirection === "right") {
    // Green for complete
    const opacity = Math.min(swipeProgress * 0.3, 0.3);
    return `rgba(34, 197, 94, ${opacity})`;
  }

  return "transparent";
};
```

### Transform & Transition

```javascript
style={{
  transform: isSwiping
    ? `translateX(${swipeOffset}px)`
    : "translateX(0)",
  transition: isSwiping
    ? "none"  // No transition during swipe
    : "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",  // Spring back
  backgroundColor: getSwipeBackgroundColor()
}}
```

## Browser Compatibility

**Touch Events**: Supported in all modern mobile browsers

- iOS Safari 13+
- Chrome Mobile 90+
- Firefox Mobile 88+
- Samsung Internet 14+

**Desktop**: Swipe actions don't interfere with mouse/click interactions

- Mouse click still works for completion toggle
- Delete button still accessible on hover

## Testing

### Manual Testing (Mobile Device)

1. Open app on mobile device: `http://localhost:3000/`
2. Find a task in the list
3. **Test Swipe Right**:
   - Swipe task from left to right
   - Verify green background appears
   - Continue to 80px, see ✓ icon
   - Release and verify task completes
   - Feel haptic vibration
4. **Test Swipe Left**:
   - Swipe task from right to left
   - Verify red background appears
   - Continue to 80px, see 🗑️ icon
   - Release and verify task deletes
   - Feel haptic vibration
5. **Test Partial Swipe**:
   - Swipe task but don't reach 80px
   - Release and verify task springs back
   - No action should execute

### Chrome DevTools Testing

1. Open Chrome DevTools
2. Toggle device emulation (Cmd+Shift+M / Ctrl+Shift+M)
3. Select mobile device (iPhone, Pixel, etc.)
4. Use touch simulation to test swipes
5. Verify visual feedback and action execution

### Automated Testing (Future)

```javascript
describe("Swipe Actions", () => {
  it("should complete task on swipe right", () => {
    // Simulate swipe right > 80px
    // Assert task moved to completed section
  });

  it("should delete task on swipe left", () => {
    // Simulate swipe left > 80px
    // Assert task removed from list
  });

  it("should spring back on partial swipe", () => {
    // Simulate swipe < 80px
    // Assert task returned to original position
    // Assert no action executed
  });
});
```

## Performance Considerations

**Touch Event Throttling**: None needed - native events are already optimized

**Animation Performance**: Uses CSS transforms (GPU-accelerated)

- `transform: translateX()` instead of `left`/`right`
- `opacity` changes are hardware-accelerated
- 60fps smooth animations

**Memory**: Minimal overhead

- Single hook instance per task
- No event listeners on scroll
- Cleanup on component unmount

## Future Enhancements

1. **Customizable Thresholds**: Allow users to adjust swipe sensitivity
2. **More Actions**: Add swipe down for archive, swipe up for priority
3. **Swipe Gestures on Desktop**: Mouse drag equivalent for desktop users
4. **Undo Toast**: Show undo option after swipe delete (like Gmail)
5. **Swipe Training**: First-time user tutorial showing swipe actions
6. **Swipe Analytics**: Track which actions users prefer (swipe vs click)

## Troubleshooting

**Issue**: Swipe not working

- **Check**: Touch events enabled in browser
- **Fix**: Test on actual mobile device (some desktop browsers don't support touch)

**Issue**: Vertical scroll interferes with swipe

- **Check**: `MAX_VERTICAL_DEVIATION` constant
- **Fix**: Increase threshold or adjust swipe detection logic

**Issue**: Swipe too sensitive

- **Check**: `SWIPE_THRESHOLD` constant (default 80px)
- **Fix**: Increase threshold value for less sensitivity

**Issue**: No haptic feedback

- **Check**: Device supports vibration API
- **Fix**: Haptic feedback is optional, feature works without it

## References

- [Touch Events Spec](https://www.w3.org/TR/touch-events/)
- [Preact Hooks](https://preactjs.com/guide/v10/hooks/)
- [Mobile Touch Best Practices](https://developers.google.com/web/fundamentals/design-and-ux/input/touch)
