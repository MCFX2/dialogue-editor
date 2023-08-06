import { FC } from "react";
import { NodeControl } from "../../NodeWindow/NodeControl";
import styles from "./CompositeModal.module.scss";
import { GeneralRestrictionControl } from "./RestrictionControls/GeneralRestrictionControl";
import { TextRestrictionControl } from "./RestrictionControls/TextRestrictionControl";
import { NumberRestrictionControl } from "./RestrictionControls/NumberRestrictionControl";
import { ArrayRestrictionControl } from "./RestrictionControls/ArrayRestrictionControl";

export interface CompositeRestrictionControlProps {
	node: NodeControl;
	updateNode: (node: NodeControl) => void;
	padding?: number;
	controlCandidates: NodeControl[];
}

export interface RestrictionControlProps {
	node: NodeControl;
	updateNode: (node: NodeControl) => void;
	controlCandidates: NodeControl[];
}

const restrictionTable: { [type: string]: FC<RestrictionControlProps> } = {
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

const generalRestrictionHeight = 40;

const restrictionHeightTable: { [type: string]: number } = {
	string: generalRestrictionHeight + 64,
	number: generalRestrictionHeight + 32,
	array: 74,
	boolean: generalRestrictionHeight,
	node: 0,
	composite: generalRestrictionHeight,
};

export const CompositeRestrictionControl: FC<
	CompositeRestrictionControlProps
> = ({ node, updateNode, padding = 0, controlCandidates }) => {
	if (node.type === "node") return <></>;

	return (
		<div
			className={styles.restrictionContainer}
			style={{ marginLeft: `${32 + padding}px` }}
		>
			{restrictionTable.hasOwnProperty(node.type)
				? restrictionTable[node.type]({ node, updateNode, controlCandidates })
				: "UNKNOWN NODE TYPE: " + node.type}
		</div>
	);
};
