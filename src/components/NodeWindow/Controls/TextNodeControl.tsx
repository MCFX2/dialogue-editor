import { FC } from "react";
import { NodeControl } from "../NodeControl";
import styles from "./Controls.module.scss";
import { extractArguments } from "./Sanitize";

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
	restrictionId?: string;
	forceInvalid?: boolean;
	blockEdit?: boolean;
}

export const TextNodeControl: FC<TextNodeControlProps> = ({
	value,
	setValue,
	controlWidth,
	setSelectedField,
	restrictionId,
	forceInvalid = false,
	blockEdit = false,
}) => {
	const args = extractArguments(restrictionId);

	let valid = !forceInvalid;
	if (args["regex"] !== undefined) {
		const regex = new RegExp(args["regex"]);

		if (!regex.test(value)) {
			valid = false;
		}
	}

	const allowEdit = args["disabled"] !== "true";

	return (!blockEdit && allowEdit) ? (
		<input
			className={valid ? styles.textField : styles.textFieldInvalid}
			placeholder='""'
			value={value ?? ""}
			onChange={(e) => {
				let newValue = e.target.value;
				if (args["maxLength"] !== undefined) {
					if (newValue.length > parseInt(args["maxLength"])) {
						return;
					}
				}

				setValue(newValue);
			}}
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
	) : (
		<p
			className={styles.textFieldUneditable}
			style={{
				width: `${controlWidth - 16}px`,
			}}
		>
			{value}
		</p>
	);
};
