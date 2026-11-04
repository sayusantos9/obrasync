import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { Keyboard, Platform, ScrollView, TextInput } from 'react-native';

// The navigator makes room for the keyboard; scroll only the remaining overlap.
// Measuring the viewport also handles fields below headers and nested forms.
export const KeyboardScrollView = forwardRef(function KeyboardScrollView({ onFocus, onLayout, onScroll, ...props }, forwardedRef) {
  const scrollRef = useRef(null);
  const offset = useRef(0);
  const frame = useRef(null);
  useImperativeHandle(forwardedRef, () => scrollRef.current);
  function revealFocusedInput() {
    if (Platform.OS === 'web') return;
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      const scroll = scrollRef.current;
      const input = TextInput.State.currentlyFocusedInput();
      if (!scroll || !input?.measureInWindow) return;
      scroll.measureInWindow((_x, viewportY, _width, viewportHeight) => {
        if (scroll !== scrollRef.current) return;
        input.measureInWindow((_inputX, inputY, _inputWidth, inputHeight) => {
          if (input !== TextInput.State.currentlyFocusedInput()) return;
          const keyboardTop = Keyboard.metrics?.()?.screenY;
          const visibleBottom = Math.min(viewportY + viewportHeight, keyboardTop ?? Infinity);
          const overlap = inputY + inputHeight + 20 - visibleBottom;
          if (overlap > 0) scroll.scrollTo({ y: Math.max(0, offset.current + overlap), animated: false });
        });
      });
    });
  }
  useEffect(() => {
    const listener = Keyboard.addListener('keyboardDidShow', revealFocusedInput);
    return () => {
      listener.remove();
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, []);
  return <ScrollView {...props} ref={scrollRef} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" scrollEventThrottle={16}
    onFocus={event => { onFocus?.(event); revealFocusedInput(); }}
    onLayout={event => { onLayout?.(event); revealFocusedInput(); }}
    onScroll={event => { offset.current = event.nativeEvent.contentOffset.y; onScroll?.(event); }}/>;
});
