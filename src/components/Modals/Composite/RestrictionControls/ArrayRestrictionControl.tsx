import { FC, useState } from "react";
import {
	extractArguments,
	packArguments,
	restrictNumber,
	sanitizeNumber,
} from "../../../NodeWindow/Controls/Sanitize";
import { RestrictionControlProps } from "../CompositeRestrictionControl";
import styles from "../CompositeModal.module.scss";

export const ArrayRestrictionControl: FC<RestrictionControlProps> = ({
	node,
	updateNode,
	controlCandidates,
}) => {
	const [maxLength, setMaxLength] = useState("");

	const args = extractArguments(node.restrictionIdentifier);

	const updateMaxLength = (value: string) => {
		if (value === "") {
			delete args["maxLength"];
		} else {
			args["maxLength"] = value;
		}

		node.restrictionIdentifier = packArguments(args);

		updateNode(node);
	};

	return (
		<>
			<div className={styles.generalRestriction}>
				<p>Type:</p>
				<select
					className={styles.arrayDropdownField}
					value={args["type"] ?? ""}
					onChange={(e) => {
						if (e.target.value === "") {
							delete args["type"];
						} else {
							args["type"] = e.target.value;
						}
						node.restrictionIdentifier = packArguments(args);
						updateNode(node);
					}}
				>
					<option value="">(Any)</option>
					{controlCandidates.map((control) => {
						const id =
							control.type === "number"
								? "number|" + (control.restrictionIdentifier ? "int" : "float")
								: control.type === "composite"
								? control.humanName
								: control.type;
						return (
							<option key={id} value={id}>
								{control.humanName}
							</option>
						);
					})}
				</select>
			</div>
			<div className={styles.generalRestriction}>
				<p>Max Length:</p>
				<input
					type="text"
					className={styles.generalRestrictionField}
					value={maxLength}
					onChange={(e) => {
						const value = restrictNumber(e.target.value, false, false);
						setMaxLength(value);
					}}
					onBlur={() => {
						updateMaxLength(sanitizeNumber(maxLength));
					}}
					placeholder="(Infinity)"
					style={{
						color: node.content
							? node.content.length > parseInt(args["maxLength"])
								? "red"
								: undefined
							: undefined,
					}}
				/>
			</div>
		</>
	);
};
