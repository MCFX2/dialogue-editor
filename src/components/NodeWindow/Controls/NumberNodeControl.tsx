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

export interface NumberNodeControlProps {
	value: number;
	setValue: (newValue: number) => void;
	controlWidth: number;
}

export const NumberNodeControl: FC<NumberNodeControlProps> = ({
	value,
	setValue,
	controlWidth,
}) => {
	return (
		<input
			className={styles.textField}
			placeholder="(value)"
			value={value ?? ""}
			onChange={(e) => setValue(parseFloat(e.target.value))}
			type={"number"}
			style={{
				width: `${controlWidth}px`,
			}}
		/>
	);
};
