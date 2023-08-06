import { FC } from "react";
import styles from "../CompositeModal.module.scss";
import {
	extractArguments,
	packArguments,
} from "../../../NodeWindow/Controls/Sanitize";
import { RestrictionControlProps } from "../CompositeRestrictionControl";

export const GeneralRestrictionControl: FC<RestrictionControlProps> = ({
	node,
	updateNode,
}) => {
	const args = extractArguments(node.restrictionIdentifier);
	const allowEdit = args["disabled"] !== "true";

	return (
		<div className={styles.generalRestriction}>
			<p className={styles.generalRestrictionLabel}>
				Allow changing value: {allowEdit ? "Yes" : "No "}
			</p>
			<input
				className={styles.toggleCheckbox}
				checked={allowEdit}
				onChange={(e) => {
					args["disabled"] = e.target.checked ? "false" : "true";
					const newNode = { ...node };
					newNode.restrictionIdentifier = packArguments(args);
					updateNode(newNode);
				}}
				type="checkbox"
			/>
		</div>
	);
};
