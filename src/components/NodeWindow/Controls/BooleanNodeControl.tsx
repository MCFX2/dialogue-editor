import { FC } from "react";
import { NodeControl } from "../NodeControl";
import styles from './Controls.module.scss';

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
	controlWidth: number;
}

export const BooleanNodeControl: FC<BooleanNodeControlProps> = ({
	value,
	setValue,
	controlWidth,
 }) => {


	return <div
		className={styles.boolCheckboxContainer}
		style={{
			width: `${controlWidth}px`,
		}}
	>
		<input
			checked={value ?? false}
			onChange={(e) => setValue(e.target.checked)}
			type="checkbox"
			className={styles.boolCheckbox}
		/>
	</div>;
}