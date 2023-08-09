import { FC, useState } from "react";
import { NodeControl } from "../NodeControl";
import styles from "./Controls.module.scss";
import { extractArguments, restrictNumber, sanitizeNumber } from "./Sanitize";

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
	blockEdit?: boolean;
}

export const NumberNodeControl: FC<NumberNodeControlProps> = ({
	value,
	setValue,
	restriction,
	controlWidth,
	setSelectedField,
	blockEdit = false,
}) => {
	const [curValue, setCurValue] = useState<string | null>(value);

	const args = extractArguments(restriction);
	const allowEdit = args["disabled"] !== "true";
	const isInt = args["preset"] === "int";
	const minValue = args["minValue"];
	const maxValue = args["maxValue"];

	const trueMinValue = minValue ? parseFloat(minValue) : -Infinity;

	const allowNegative = minValue ? parseFloat(minValue) < 0 : true;


	return (!blockEdit && allowEdit) ? (
		<input
			className={styles.numberField}
			placeholder="0"
			value={curValue ?? value}
			onChange={(e) => {
				let newValue = restrictNumber(e.target.value, allowNegative, !isInt);
				setCurValue(newValue);
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
				if (curValue !== null && curValue !== '') {
					let newValue = sanitizeNumber(curValue);
					newValue = Math.max(parseFloat(newValue), trueMinValue).toString();
	
					if (maxValue) {
						newValue = Math.min(parseFloat(newValue), parseFloat(maxValue)).toString();
					}
					setValue(newValue);
				} else {
					setValue('');
				}

				setCurValue(null);
				setSelectedField(false);
			}}
		/>
	) : (
		<p
			className={styles.textFieldUneditable}
			style={{ width: `${controlWidth - 16}px` }}
		>
			{value}
		</p>
	);
};
