import { useEffect } from 'react';

/**
 * Function that calls handler(window) whenever the window is resized
 */
export function useWindowSize(handler: (this: Window, ev: UIEvent) => any) {
	useEffect(() => {
	  // Bind the event listener
	  window.addEventListener("resize", handler);
	  return () => {
		// Unbind the event listener on clean up
		window.removeEventListener("resize", handler);
	  };
	}, [handler]);
  }
  