import { useEffect } from "react";

/**
 * Function that calls handler(event) whenever a mouse click occurs
 */
export function useMouseMove(handler: (this: Document, ev: MouseEvent) => any) {
  useEffect(() => {
    // Bind the event listener
    document.addEventListener("mousemove", handler);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousemove", handler);
    };
  }, [handler]);
}
