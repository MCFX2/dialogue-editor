import { FC } from "react";
import { NodeControl } from "../NodeControl";
import styles from "./Controls.module.scss";

export const DefaultNumberControl: NodeControl = {
	type: "number",
	humanName: "Number",
	renderHeight: 48,

	index: -1,
	uuid: "",
	label: "",
	parent: "",
	content: "",
};

export const DefaultIntegerControl: NodeControl = {
	type: "number",
	humanName: "Integer",
	restrictionIdentifier: "int",
	renderHeight: 48,

	index: -1,
	uuid: "",
	label: "",
	parent: "",
	content: "",
};

export interface NumberNodeControlProps {
	restriction?: string;
	value: string;
	setValue: (newValue: any) => void;
	controlWidth: number;
	setSelectedField: (selected: boolean) => void;
}

export const NumberNodeControl: FC<NumberNodeControlProps> = ({
	value,
	setValue,
	restriction,
	controlWidth,
	setSelectedField,
}) => {
	return (
		<input
			className={styles.numberField}
			placeholder="0"
			value={value ?? ""}
			onChange={(e) => {
				if (restriction === "int") {
					// don't allow leading zeroes
					const intRegex = /^-?[1-9]\d*$/;
					if (
						e.target.value === "" ||
						e.target.value === "-" ||
						intRegex.test(e.target.value)
					) {
						setValue(e.target.value);
					}
				} else {
					// by default assume any valid float is fine
					const floatRegex = /^-?\d*(\.\d*)?$/;
					if (floatRegex.test(e.target.value)) {
						setValue(e.target.value);
					}
				}
				e.preventDefault();
			}}
			type={"text"}
			style={{
				width: `${controlWidth - 16}px`,
			}}
			onFocus={() => {
				setSelectedField(true);
			}}
			onBlur={() => {
				// clear out the value if it's just a dash
				if (value === "-") {
					setValue("");
				} else if (value === undefined) { 
					setValue("");
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
					if (newValue.includes('.')) {
						while (newValue.endsWith("0")) {
							newValue = newValue.slice(0, newValue.length - 1);
						}

						if (newValue.endsWith(".")) {
							newValue = newValue.slice(0, -1);
						}	
					}

					setValue(newValue);
				}
				setSelectedField(false);
			}}
		/>
	);
};
