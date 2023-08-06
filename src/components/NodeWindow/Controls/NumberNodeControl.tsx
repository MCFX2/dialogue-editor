import { FC } from "react";
import { NodeControl } from "../NodeControl";
import styles from "./Controls.module.scss";
import { restrictNumber, sanitizeNumber } from "./Sanitize";

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
	restrictionIdentifier: "preset:int,",
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
				if (restriction?.includes("preset:int,")) {
					setValue(restrictNumber(e.target.value, true, false));
				} else {
					setValue(restrictNumber(e.target.value, true, true));
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
				setValue(sanitizeNumber(value));
				setSelectedField(false);
			}}
		/>
	);
};
