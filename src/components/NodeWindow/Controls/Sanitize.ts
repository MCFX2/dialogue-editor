// returns a formatted number (as a string) if it's a valid number, returns empty string if it's not
export const sanitizeNumber = (value: string) => {
	if (value === "-") {
		return "";
	} else if (value === undefined) {
		return "";
	} else {
		// floats need special cleanup
		let newValue = value;
		if (newValue.startsWith(".")) {
			newValue = "0" + value;
		}

		const negative = newValue.startsWith("-");
		if (negative) {
			newValue = newValue.slice(1);
		}
		// remove leading zeroes
		const leadingZeroRegex = /^0\d/;
		while (leadingZeroRegex.test(newValue)) {
			newValue = newValue.slice(1);
		}

		if (negative) {
			newValue = "-" + newValue;
		}

		// remove trailing zeroes and (if applicable) the decimal point
		if (newValue.includes(".")) {
			while (newValue.endsWith("0")) {
				newValue = newValue.slice(0, newValue.length - 1);
			}

			if (newValue.endsWith(".")) {
				newValue = newValue.slice(0, -1);
			}
		}

		return newValue;
	}
};

export const restrictNumber = (
	value: string,
	allowNegative: boolean,
	allowDecimal: boolean
) => {
	if (!allowNegative || !value.startsWith("-")) {
		value = value.replaceAll("-", "");
	} else {
		value = "-" + value.replaceAll("-", "");
	}

	if (!allowDecimal) {
		value = value.replace(".", "");
	}

	return value.replace(/[^0-9.-]/g, "");
};

export const extractArguments = (restrictionId?: string) => {
	let args: { [arg: string]: string } = {};

	if (restrictionId === undefined) {
		return args;
	}

	// oh the misery

	// regex arguments could contain any character (including our delimiter), so we need to find them first
	const regexArg: number = restrictionId.indexOf("regex:/") + 7;
	let regexEnd = Infinity;
	if (regexArg !== 6) {
		// regex argument found
		regexEnd = restrictionId.indexOf("/g//,", regexArg);
		args["regex"] = restrictionId.slice(regexArg, regexEnd);
	}

	// first the stuff before the regex (if any)
	if (regexArg > 7) {
		const firstSplit = restrictionId.slice(0, regexArg - 7).split(",");
		for (const arg of firstSplit) {
			if (arg.length > 0) {
				const splitArg = arg.split(":");
				args[splitArg[0]] = splitArg[1];
			}
		}
	}

	// then the stuff after the regex (if any)
	if (regexEnd !== Infinity && regexEnd + 5 < restrictionId.length) {
		const secondSplit = restrictionId.slice(regexEnd + 5).split(",");
		for (const arg of secondSplit) {
			if (arg.length > 0) {
				const splitArg = arg.split(":");
				args[splitArg[0]] = splitArg[1];
			}
		}
	} else if (regexEnd === Infinity && regexArg === 6) {
		// no regex argument, parse the whole thing as normal
		const split = restrictionId.split(",");
		for (const arg of split) {
			if (arg.length > 0) {
				const splitArg = arg.split(":");
				args[splitArg[0]] = splitArg[1];
			}
		}
	}

	return args;
};

export const packArguments = (args: { [arg: string]: string }) => {
	let argString = "";
	for (const arg in args) {
		if (arg === "regex") {
			argString += `${arg}:/${args[arg]}/g//,`;
		} else {
			argString += `${arg}:${args[arg]},`;
		}
	}

	return argString;
};
