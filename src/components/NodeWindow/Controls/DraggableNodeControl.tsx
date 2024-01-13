import { FC } from "react";
import { NodeHandle } from "../../../App";
import styles from "./Controls.module.scss";
import { NodeControl } from "../NodeControl";

export const DefaultDraggableNodeControl: NodeControl = {
	type: "node",
	humanName: "Node",
	renderHeight: 48,

	index: -1,
	uuid: "",
	label: "",
	parent: "",
	content: "",
};

export interface DraggableNodeControlProps {
	nodeTable: { [uuid: string]: NodeHandle };
	pickUpControl: () => void;
	width: number;
	value: any;
}

export const DraggableNodeControl: FC<DraggableNodeControlProps> = ({
	value,
	width,
	nodeTable,
	pickUpControl,
}) => {
	const hasTarget = nodeTable[value] !== undefined;
	const label = nodeTable[value]?.name ?? '""';
	return (
		<div
			className={styles.nodeControlContainer}
			style={{
				width: `${width}px`,
			}}
		>
			<div
				className={styles.nodeLabel}
				style={{
					color: hasTarget ? undefined : "#888",
				}}
			>
				{label}
			</div>
			<div
				className={
					hasTarget ? styles.nodeDragSelectorFull : styles.nodeDragSelectorEmpty
				}
				onMouseDown={pickUpControl}
			/>
		</div>
	);
};
