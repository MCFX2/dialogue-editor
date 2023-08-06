import { FC, useState } from "react";
import {
	extractArguments,
	packArguments,
	restrictNumber,
	sanitizeNumber,
} from "../../../NodeWindow/Controls/Sanitize";
import styles from "../CompositeModal.module.scss";
import { GeneralRestrictionControl } from "./GeneralRestrictionControl";
import { RestrictionControlProps } from "../CompositeRestrictionControl";

export const TextRestrictionControl: FC<RestrictionControlProps> = ({
	node,
	updateNode,
	controlCandidates,
}) => {
	const [maxLength, setMaxLength] = useState("");
	const [regex, setRegex] = useState("");

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
					placeholder="(Infinity)"
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
					placeholder=".*"
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
							setRegex("");
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
				node={node}
				updateNode={updateNode}
				controlCandidates={controlCandidates}
			/>
		</>
	);
};
