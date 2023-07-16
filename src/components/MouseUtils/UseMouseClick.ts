import { useEffect } from "react";

/**
 * Function that calls handler(event) whenever a mouse click occurs
 */
export function useMouseClick(handler: (this: Document, ev: MouseEvent) => any) {
  useEffect(() => {
    // Bind the event listener
    document.addEventListener("mousedown", handler);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handler);
    };
  }, [handler]);
}

/**
 * Function that calls handler(event) whenever a mouse click is released
 */
export function useMouseRelease(handler: (this: Document, ev: MouseEvent) => any) {
  useEffect(() => {
    // Bind the event listener
    document.addEventListener("mouseup", handler);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mouseup", handler);
    };
  }, [handler]);
}