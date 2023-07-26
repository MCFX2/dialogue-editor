import { FC } from "react";
import { NodeControl } from "../NodeControl";
import styles from "./Controls.module.scss";

export const DefaultTextControl: NodeControl = {
	type: "string",
	humanName: "Text",
	renderHeight: 48,

	index: -1,
	uuid: "",
	label: "",
	parent: "",
	content: "",
};

export interface TextNodeControlProps {
	value: string;
	setValue: (newValue: string) => void;
	controlWidth: number;
}

export const TextNodeControl: FC<TextNodeControlProps> = ({
	value,
	setValue,
	controlWidth,
}) => {
	return (
		<input
			className={styles.textField}
			placeholder="(value)"
			value={value ?? ""}
			onChange={(e) => setValue(e.target.value)}
			type={"text"}
			style={{
				width: `${controlWidth - 16}px`,
			}}
		/>
	);
};
