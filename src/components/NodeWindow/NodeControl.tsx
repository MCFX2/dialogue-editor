import { FC } from "react";
import styles from "./NodeWindow.module.scss";
import { NodeHandle } from "../../App";
import {
	DefaultDraggableNodeControl,
	DraggableNodeControl,
} from "./Controls/DraggableNodeControl";
import {
	BooleanNodeControl,
	DefaultBooleanControl,
} from "./Controls/BooleanNodeControl";
import {
	DefaultTextControl,
	TextNodeControl,
} from "./Controls/TextNodeControl";
import {
	DefaultNumberControl,
	NumberNodeControl,
} from "./Controls/NumberNodeControl";

export interface NodeControl {
	type:
		| "number"
		| "dropdown"
		| "node"
		| "string"
		| "boolean"
		| "composite"
		| "array";
	restrictionIdentifier?: string;

	humanName: string;

	index: number;
	uuid: string;

	renderHeight: number;

	label: string;

	// for primitives, this is the value
	// for composites and arrays, this is the children
	content?: any;

	// uuid of the parent node
	parent: string;
}

interface ControlHolderProps {
	onSliderGrab: (e: React.MouseEvent) => void;
	sliderOffset: number;
	setText: (text: string) => void;
	text: string;
	children: any;
}

const ControlHolder: FC<ControlHolderProps> = ({
	onSliderGrab,
	sliderOffset,
	setText,
	text,
	children,
}) => {
	return (
		<div className={styles.controlContainer}>
			<input
				className={styles.controlLabelEditable}
				autoFocus={true}
				placeholder="(label)"
				type="text"
				value={text}
				onChange={(e) => setText(e.target.value)}
				style={{
					width: `${100 + sliderOffset}px`,
				}}
			/>
			<p
				className={styles.controlSeparator}
				onMouseDown={(e) => onSliderGrab(e)}
			>
				:
			</p>
			{children}
		</div>
	);
};

export interface ControlElementProps {
	node: NodeControl;
	setLabel: (label: string) => void;
	setValue: (value: any) => void;
	sliderOffset: number;
	onSliderGrab: (e: React.MouseEvent) => void;
	windowWidth: number;
	nodeTable: { [uuid: string]: NodeHandle };
	pickUpControl: (control: NodeControl) => void;
}

// generates a JSX element for a primitive control
export const ControlElement: FC<ControlElementProps> = ({
	node,
	setLabel,
	setValue,
	sliderOffset,
	onSliderGrab,
	windowWidth,
	nodeTable,
	pickUpControl,
}) => {
	const controlWidth = windowWidth - 140 - sliderOffset;

	return (
		<ControlHolder
			onSliderGrab={onSliderGrab}
			sliderOffset={sliderOffset}
			setText={setLabel}
			text={node.label}
		>
			{node.type === "boolean" ? (
				<BooleanNodeControl
					controlWidth={controlWidth}
					setValue={setValue}
					value={node.content}
				/>
			) : node.type === "node" ? (
				<DraggableNodeControl
					nodeTable={nodeTable}
					width={controlWidth}
					value={node.content}
					pickUpControl={() => pickUpControl(node)}
				/>
			) : node.type === "string" ? (
				<TextNodeControl
					value={node.content}
					setValue={setValue}
					controlWidth={controlWidth}
				/>
			) : node.type === "number" ? (
				<NumberNodeControl
					value={node.content}
					setValue={setValue}
					controlWidth={controlWidth}
				/>
			) : (
				<p>UNKNOWN CONTROL TYPE "{node.type}"!</p>
			)}
		</ControlHolder>
	);
};

export const DefaultControls: NodeControl[] = [
	DefaultNumberControl,
	DefaultTextControl,
	DefaultBooleanControl,
	DefaultDraggableNodeControl,
];
