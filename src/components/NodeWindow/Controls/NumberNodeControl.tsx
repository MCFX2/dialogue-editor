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
	value: number;
	setValue: (newValue: any) => void;
	controlWidth: number;
}

export const NumberNodeControl: FC<NumberNodeControlProps> = ({
	value,
	setValue,
	restriction,
	controlWidth,
}) => {
	return (
		<input
			className={styles.numberField}
			placeholder="(value)"
			value={value ?? ""}
			onChange={(e) => {
				if (restriction === "int") {
					const filtered = e.target.value.replaceAll(/[^0-9]/g, "");
					setValue(parseInt(filtered, 10));
				} else {
					setValue(parseFloat(e.target.value));
				}
			}}
			type={"number"}
			style={{
				width: `${controlWidth - 16}px`,
			}}
		/>
	);
};
