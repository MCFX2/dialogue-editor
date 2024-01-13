import React from "react";
import { Dispatch, SetStateAction } from "react";

/**
 * Returns a stateful value, and a function to update it.
 * Safely prevents mutating the state object.
 */
export function useState<S>(
	initialState: S | (() => S)
): [S, Dispatch<SetStateAction<S>>] {
	return React.useState<Readonly<S>>(initialState);
}