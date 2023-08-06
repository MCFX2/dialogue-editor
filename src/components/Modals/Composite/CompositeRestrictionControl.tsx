import { FC, useState } from "react";
import { NodeControl } from "../../NodeWindow/NodeControl";
import styles from "./CompositeModal.module.scss";
import {
	extractArguments,
	packArguments,
	restrictNumber,
	sanitizeNumber,
} from "../../NodeWindow/Controls/Sanitize";

export interface CompositeRestrictionControlProps {
	node: NodeControl;
	updateNode: (node: NodeControl) => void;
}

export interface GeneralRestrictionControlProps {
	setAllowEdit: (allowEdit: boolean) => void;
	allowEdit: boolean;
}

const GeneralRestrictionControl: FC<GeneralRestrictionControlProps> = ({
	setAllowEdit,
	allowEdit,
}) => {
	return (
		<div className={styles.generalRestriction}>
			<p className={styles.generalRestrictionLabel}>
				Allow changing value: {allowEdit ? "Yes" : "No "}
			</p>
			<input
				className={styles.toggleCheckbox}
				checked={allowEdit}
				onChange={(e) => {
					setAllowEdit(e.target.checked);
				}}
				type="checkbox"
			/>
		</div>
	);
};

export interface TextRestrictionControlProps {
	node: NodeControl;
	updateNode: (node: NodeControl) => void;
}

const TextRestrictionControl: FC<TextRestrictionControlProps> = ({
	node,
	updateNode,
}) => {
	const [allowEdit, setAllowEdit] = useState(true);
	const [maxLength, setMaxLength] = useState("");
	const [regex, setRegex] = useState(".*");

	const regexIsValid = (regex: string): boolean => {
		try {
			new RegExp(regex);
			return true;
		} catch (e) {
			return false;
		}
	};

	return (
		<>
			<div className={styles.generalRestriction}>
				<p>Max Length:</p>
				<input
					className={styles.generalRestrictionField}
					value={maxLength}
					onChange={(e) => {
						setMaxLength(restrictNumber(e.target.value, false, false));
					}}
					onBlur={(e) => {
						const num = sanitizeNumber(e.target.value);
						setMaxLength(num);
						const args = extractArguments(node.restrictionIdentifier);
						if (num === "") {
							delete args["maxLength"];
						} else {
							args["maxLength"] = num;
						}
						node.restrictionIdentifier = packArguments(args);
						updateNode(node);
					}}
					type="text"
				/>
			</div>
			<div className={styles.generalRestriction}>
				<p>Regex: /</p>
				<input
					className={
						regexIsValid(regex)
							? styles.generalRestrictionField
							: styles.generalRestrictionFieldInvalid
					}
					value={regex}
					onChange={(e) => {
						setRegex(e.target.value);
					}}
					onBlur={(e) => {
						if (regexIsValid(e.target.value) && e.target.value !== "") {
							setRegex(e.target.value);
							const args = extractArguments(node.restrictionIdentifier);
							args["regex"] = e.target.value;
							node.restrictionIdentifier = packArguments(args);
							updateNode(node);
						} else {
							setRegex(".*");
							const args = extractArguments(node.restrictionIdentifier);
							delete args["regex"];
							node.restrictionIdentifier = packArguments(args);
							updateNode(node);
						}
					}}
					type="text"
				/>
				<p>/g</p>
			</div>
			<GeneralRestrictionControl
				allowEdit={allowEdit}
				setAllowEdit={setAllowEdit}
			/>
		</>
	);
};

export interface NumberRestrictionControlProps {
	node: NodeControl;
}

const NumberRestrictionControl: FC<NumberRestrictionControlProps> = ({
	node,
}) => {
	const [allowEdit, setAllowEdit] = useState(true);

	return (
		<>
			<div></div>
			<GeneralRestrictionControl
				allowEdit={allowEdit}
				setAllowEdit={setAllowEdit}
			/>
		</>
	);
};

export interface ArrayRestrictionControlProps {
	node: NodeControl;
}

const ArrayRestrictionControl: FC<ArrayRestrictionControlProps> = ({
	node,
}) => {
	return (
		<>
			<div></div>
		</>
	);
};

const restrictionTable: { [type: string]: FC<any> } = {
	string: TextRestrictionControl,
	number: NumberRestrictionControl,
	array: ArrayRestrictionControl,
	boolean: GeneralRestrictionControl,
	node: () => <></>,
	composite: GeneralRestrictionControl,
};

export const recursiveCalculateRestrictorHeight = (
	control: NodeControl[],
	stopIndex: number
): number => {
	return control.reduce<number>((prev, cur) => {
		if (cur.index > stopIndex) return prev;
		if (cur.type === "array")
			return (
				prev +
				restrictionHeightTable[cur.type] +
				recursiveCalculateRestrictorHeight(cur.content, stopIndex)
			);
		return prev + restrictionHeightTable[cur.type];
	}, 0);
};

const generalRestrictionHeight = 50;

const restrictionHeightTable: { [type: string]: number } = {
	string: generalRestrictionHeight + 64,
	number: generalRestrictionHeight,
	array: 10,
	boolean: generalRestrictionHeight,
	node: 0,
	composite: generalRestrictionHeight,
};

export const CompositeRestrictionControl: FC<
	CompositeRestrictionControlProps
> = ({ node, updateNode }) => {
	if (node.type === "node") return <></>;

	return (
		<div className={styles.restrictionContainer}>
			{restrictionTable.hasOwnProperty(node.type)
				? restrictionTable[node.type]({ node, updateNode })
				: "UNKNOWN NODE TYPE: " + node.type}
		</div>
	);
};
