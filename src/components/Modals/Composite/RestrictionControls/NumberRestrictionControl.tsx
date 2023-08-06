import { FC, useState } from "react";
import { RestrictionControlProps } from "../CompositeRestrictionControl";
import {
	extractArguments,
	packArguments,
	restrictNumber,
	sanitizeNumber,
} from "../../../NodeWindow/Controls/Sanitize";
import { GeneralRestrictionControl } from "./GeneralRestrictionControl";
import styles from "../CompositeModal.module.scss";

export const NumberRestrictionControl: FC<RestrictionControlProps> = ({
	node,
	updateNode,
	controlCandidates,
}) => {
	const args = extractArguments(node.restrictionIdentifier);
	const isInteger = args["preset"] === "int";

	const [minValue, setMinValue] = useState("");
	let tempMinValue = minValue;
	const [maxValue, setMaxValue] = useState("");
	let tempMaxValue = maxValue;

	const updateMinValue = (value: string) => {
		setMinValue(value);
		tempMinValue = value;

		if (value === "") {
			delete args["minValue"];
		} else {
			args["minValue"] = value;
		}

		node.restrictionIdentifier = packArguments(args);
	};

	const updateMaxValue = (value: string) => {
		setMaxValue(value);
		tempMaxValue = value;

		if (value === "") {
			delete args["maxValue"];
		} else {
			args["maxValue"] = value;
		}

		node.restrictionIdentifier = packArguments(args);
	};

	const finalizeNode = () => {
		if (node.content) {
			if (
				tempMinValue !== "" &&
				parseFloat(node.content) < parseFloat(tempMinValue)
			) {
				node.content = tempMinValue;
			}

			if (
				tempMaxValue !== "" &&
				parseFloat(node.content) > parseFloat(tempMaxValue)
			) {
				node.content = tempMaxValue;
			}
		}

		updateNode(node);
	};

	return (
		<>
			<div className={styles.generalRestriction}>
				<p>Range:</p>
				<input
					className={styles.numberRestrictionField}
					value={minValue ?? ""}
					placeholder="(-Infinity)"
					onChange={(e) => {
						setMinValue(restrictNumber(e.target.value, true, !isInteger));
					}}
					type="text"
					style={{
						textAlign: "right",
					}}
					onBlur={(e) => {
						let num = sanitizeNumber(e.target.value);
						let numNumber = parseFloat(num);

						if (maxValue !== "" && numNumber > parseFloat(maxValue)) {
							updateMaxValue(num);
						}

						updateMinValue(num);
						finalizeNode();
					}}
				/>
				<p
					style={{
						marginLeft: "4px",
						marginRight: "4px",
					}}
				>
					{" "}
					-&gt;{" "}
				</p>
				<input
					className={styles.numberRestrictionField}
					value={maxValue ?? ""}
					placeholder="(Infinity)"
					onChange={(e) => {
						setMaxValue(restrictNumber(e.target.value, true, !isInteger));
					}}
					type="text"
					onBlur={(e) => {
						let num = sanitizeNumber(e.target.value);
						let numNumber = parseFloat(num);

						if (minValue !== "" && numNumber < parseFloat(minValue)) {
							updateMinValue(num);
						}

						updateMaxValue(num);
						finalizeNode();
					}}
				/>
			</div>
			<GeneralRestrictionControl
				controlCandidates={controlCandidates}
				node={node}
				updateNode={updateNode}
			/>
		</>
	);
};
