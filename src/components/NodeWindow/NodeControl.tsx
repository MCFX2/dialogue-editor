import { FC } from "react";
import styles from "./NodeControl.module.scss";
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
	DefaultIntegerControl,
	DefaultNumberControl,
	NumberNodeControl,
} from "./Controls/NumberNodeControl";
import { MinusIcon } from "../SVG/MinusIcon";
import { ArrayControl, DefaultArrayControl } from "./Controls/ArrayControl";

export interface NodeControl {
	type:
		| "number"
		| "dropdown" // <- cut feature, doing it properly requires a lot of infrastructure we don't have
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
	deleteControl: () => void;
	setSelectedField: (selected: boolean) => void;
	leftPad?: number;
	windowWidth: number;
	index?: number;
	children: any;
}

const ControlHolder: FC<ControlHolderProps> = ({
	onSliderGrab,
	sliderOffset,
	setText,
	text,
	deleteControl,
	setSelectedField,
	leftPad = 0,
	index,
	windowWidth,
	children,
}) => {
	return (
		<div
			className={styles.controlContainer}
			style={{
				marginLeft: leftPad,
				width: `${windowWidth - leftPad}px`,
			}}
		>
			<div className={styles.deleteControlButton} onClick={deleteControl}>
				<MinusIcon size={32} />
			</div>
			{index !== undefined ? (
				<div
					className={styles.controlIndex}
					style={{
						width: `${16 + sliderOffset}px`,
					}}
				>
					{index}
				</div>
			) : (
				<input
					className={styles.controlLabelEditable}
					placeholder="(label)"
					type="text"
					value={text}
					onChange={(e) => setText(e.target.value)}
					style={{
						width: `${100 + sliderOffset}px`,
					}}
					onFocus={() => {
						setSelectedField(true);
					}}
					onBlur={() => {
						setSelectedField(false);
					}}
				/>
			)}
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
	setValueAndHeight: (value: any, height?: number) => void;
	sliderOffset: number;
	onSliderGrab: (e: React.MouseEvent) => void;
	windowWidth: number;
	nodeTable: { [uuid: string]: NodeHandle };
	pickUpControl: (node: NodeControl) => void;
	deleteControl: () => void;
	setSelectedField: (uuid: string, oldUuid?: string) => void;
	leftPad?: number;
	index?: number;
}

// generates a JSX element for a primitive control
export const ControlElement: FC<ControlElementProps> = ({
	node,
	setLabel,
	setValueAndHeight,
	sliderOffset,
	onSliderGrab,
	windowWidth,
	nodeTable,
	pickUpControl,
	deleteControl,
	setSelectedField,
	leftPad = 0,
	index,
}) => {
	const controlWidth =
		windowWidth - 172 - sliderOffset - leftPad + (index !== undefined ? 84 : 0);

	return node.type === "array" ? (
		<ArrayControl
			node={node}
			setLabel={setLabel}
			deleteControl={deleteControl}
			setSelectedField={setSelectedField}
			controlWidth={controlWidth}
			nodeTable={nodeTable}
			pickUpControl={pickUpControl}
			setValue={setValueAndHeight}
			windowWidth={windowWidth}
			leftPad={leftPad}
			index={index}
		/>
	) : (
		<ControlHolder
			index={index}
			leftPad={leftPad}
			onSliderGrab={onSliderGrab}
			sliderOffset={sliderOffset}
			setText={setLabel}
			text={node.label}
			deleteControl={deleteControl}
			windowWidth={windowWidth}
			setSelectedField={(selected) => {
				setSelectedField(
					selected ? node.uuid + "#label" : "",
					selected ? undefined : node.uuid + "#label"
				);
			}}
		>
			{node.type === "boolean" ? (
				<BooleanNodeControl
					controlWidth={controlWidth}
					setValue={setValueAndHeight}
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
					setValue={setValueAndHeight}
					controlWidth={controlWidth}
					setSelectedField={(selected) => {
						setSelectedField(
							selected ? node.uuid : "",
							selected ? undefined : node.uuid
						);
					}}
				/>
			) : node.type === "number" ? (
				<NumberNodeControl
					value={node.content}
					setValue={setValueAndHeight}
					controlWidth={controlWidth}
					restriction={node.restrictionIdentifier}
					setSelectedField={(selected) => {
						setSelectedField(
							selected ? node.uuid : "",
							selected ? undefined : node.uuid
						);
					}}
				/>
			) : (
				<p>UNKNOWN CONTROL TYPE "{node.type}"!</p>
			)}
		</ControlHolder>
	);
};

export const DefaultControls: NodeControl[] = [
	DefaultNumberControl,
	DefaultIntegerControl,
	DefaultTextControl,
	DefaultBooleanControl,
	DefaultDraggableNodeControl,
	DefaultArrayControl,
];
