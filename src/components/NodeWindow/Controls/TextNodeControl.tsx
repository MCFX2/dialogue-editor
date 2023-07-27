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
	setSelectedField: (selected: boolean) => void;
}

export const TextNodeControl: FC<TextNodeControlProps> = ({
	value,
	setValue,
	controlWidth,
	setSelectedField,
}) => {
	return (
		<input
			className={styles.textField}
			placeholder='""'
			value={value ?? ""}
			onChange={(e) => setValue(e.target.value)}
			type={"text"}
			style={{
				width: `${controlWidth - 16}px`,
			}}
			onFocus={() => {
				setSelectedField(true);
			}}
			onBlur={() => {
				setSelectedField(false);
			}}
		/>
	);
};
