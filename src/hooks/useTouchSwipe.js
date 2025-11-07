/**
 * useTouchSwipe Hook
 * Detects touch swipe gestures for mobile interactions
 *
 * Returns swipe state and handlers for touch events
 */

import { useState, useRef, useCallback } from "preact/hooks";

const SWIPE_THRESHOLD = 80; // Minimum swipe distance to trigger action (px)
const SWIPE_VELOCITY_THRESHOLD = 0.3; // Minimum swipe velocity (px/ms)
const MAX_VERTICAL_DEVIATION = 50; // Maximum vertical movement to still count as horizontal swipe (px)

/**
 * Custom hook for detecting horizontal swipe gestures
 * @param {Object} options - Configuration options
 * @param {Function} options.onSwipeLeft - Callback when swiping left (delete action)
 * @param {Function} options.onSwipeRight - Callback when swiping right (complete action)
 * @param {number} options.threshold - Distance threshold for triggering action (default: 80px)
 * @returns {Object} Swipe state and event handlers
 */
export function useTouchSwipe({
  onSwipeLeft,
  onSwipeRight,
  threshold = SWIPE_THRESHOLD,
} = {}) {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState(null); // 'left' or 'right'

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchStartTime = useRef(0);
  const lastTouchX = useRef(0);

  /**
   * Handle touch start event
   */
  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
    touchStartTime.current = Date.now();
    lastTouchX.current = touch.clientX;
    setIsSwiping(true);
  }, []);

  /**
   * Handle touch move event
   */
  const handleTouchMove = useCallback(
    (e) => {
      if (!isSwiping) return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartX.current;
      const deltaY = Math.abs(touch.clientY - touchStartY.current);

      // If vertical movement is too large, this isn't a horizontal swipe
      if (deltaY > MAX_VERTICAL_DEVIATION && Math.abs(deltaX) < 20) {
        handleTouchEnd();
        return;
      }

      // Prevent vertical scrolling when swiping horizontally
      if (Math.abs(deltaX) > 10) {
        e.preventDefault();
      }

      lastTouchX.current = touch.clientX;
      setSwipeOffset(deltaX);

      // Determine swipe direction
      if (deltaX < -10) {
        setSwipeDirection("left");
      } else if (deltaX > 10) {
        setSwipeDirection("right");
      }
    },
    [isSwiping]
  );

  /**
   * Handle touch end event
   */
  const handleTouchEnd = useCallback(() => {
    if (!isSwiping) return;

    const deltaX = lastTouchX.current - touchStartX.current;
    const deltaTime = Date.now() - touchStartTime.current;
    const velocity = Math.abs(deltaX) / deltaTime;

    // Check if swipe threshold is met
    const thresholdMet =
      Math.abs(deltaX) >= threshold || velocity >= SWIPE_VELOCITY_THRESHOLD;

    if (thresholdMet) {
      if (deltaX < 0 && onSwipeLeft) {
        // Swipe left - Delete
        onSwipeLeft();
      } else if (deltaX > 0 && onSwipeRight) {
        // Swipe right - Complete/Uncomplete
        onSwipeRight();
      }
    }

    // Reset state
    setSwipeOffset(0);
    setIsSwiping(false);
    setSwipeDirection(null);
    touchStartX.current = 0;
    touchStartY.current = 0;
    lastTouchX.current = 0;
  }, [isSwiping, onSwipeLeft, onSwipeRight, threshold]);

  /**
   * Handle touch cancel event
   */
  const handleTouchCancel = useCallback(() => {
    setSwipeOffset(0);
    setIsSwiping(false);
    setSwipeDirection(null);
    touchStartX.current = 0;
    touchStartY.current = 0;
    lastTouchX.current = 0;
  }, []);

  /**
   * Calculate swipe progress (0 to 1)
   */
  const swipeProgress = Math.min(Math.abs(swipeOffset) / threshold, 1);

  /**
   * Check if threshold is met
   */
  const isThresholdMet = Math.abs(swipeOffset) >= threshold;

  return {
    // State
    swipeOffset,
    isSwiping,
    swipeDirection,
    swipeProgress,
    isThresholdMet,

    // Event handlers
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onTouchCancel: handleTouchCancel,
    },
  };
}
