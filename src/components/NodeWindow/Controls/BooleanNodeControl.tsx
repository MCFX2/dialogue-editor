import { FC } from "react";
import { NodeControl } from "../NodeControl";
import styles from './Controls.module.scss';
import { extractArguments } from "./Sanitize";

export const DefaultBooleanControl: NodeControl = {
	type: "boolean",
	humanName: "Checkbox",
	renderHeight: 48,

	index: -1,
	uuid: "",
	label: "",
	parent: "",
	content: "",
};

export interface BooleanNodeControlProps {
	value: boolean;
	setValue: (newValue: boolean) => void;
	restriction?: string;
	controlWidth: number;
}

export const BooleanNodeControl: FC<BooleanNodeControlProps> = ({
	value,
	setValue,
	controlWidth,
	restriction,
 }) => {
	const args = extractArguments(restriction);
	const allowEdit = args["disabled"] !== "true";

	return <div
		className={styles.boolCheckboxContainer}
		style={{
			width: `${controlWidth}px`,
		}}
	>
		<input
			disabled={!allowEdit}
			checked={value ?? false}
			onChange={(e) => setValue(e.target.checked)}
			type="checkbox"
			className={styles.boolCheckbox}
		/>
	</div>;
}