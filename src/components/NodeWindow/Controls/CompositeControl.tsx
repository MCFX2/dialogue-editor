import { FC, Fragment } from "react";
import { ControlElement, NodeControl } from "../NodeControl";
import { NodeHandle } from "../../../App";
import styles from "./Controls.module.scss";
import { MinusIcon } from "../../SVG/MinusIcon";

export const DefaultCompositeControl: NodeControl = {
	type: "composite",
	humanName: "##UNDEFINED##",
	renderHeight: 48,

	index: -1,
	uuid: "",
	label: "",
	parent: "",
	content: undefined,
};

export interface CompositeControlProps {
	node: NodeControl;
	setLabel: (label: string) => void;
	setValue: (value: any) => void;
	//sliderOffset: number;
	//onSliderGrab: (e: React.MouseEvent) => void;
	windowWidth: number;
	nodeTable: { [uuid: string]: NodeHandle };
	pickUpControl: (node: NodeControl) => void;
	deleteControl?: () => void;
	setSelectedField: (uuid: string, oldUuid?: string) => void;

	controlCandidates: NodeControl[];

	controlWidth: number;
	leftPad: number;
	index?: number;
	invalid?: boolean;
}

export const CompositeControl: FC<CompositeControlProps> = ({
	node,
	setLabel,
	setValue,

	windowWidth,
	nodeTable,
	pickUpControl,
	deleteControl,
	setSelectedField,

	controlCandidates,

	leftPad,
	index,
	invalid = false,
}) => {
	const children = (node.content ?? []) as { [uuid: string]: NodeControl };

	// const args = extractArguments(node.restrictionIdentifier);

	return (
		<>
			<div
				className={styles.controlContainer}
				style={{
					marginLeft: `${leftPad}px`,
					width: `${windowWidth - leftPad}px`,
				}}
			>
				{deleteControl && (
					<div className={styles.deleteControlButton} onClick={deleteControl}>
						<MinusIcon size={32} />
					</div>
				)}
				{index === undefined ? (
					<input
						className={invalid ? styles.arrayTitleInvalid : styles.arrayTitle}
						placeholder="(label)"
						value={node.label ?? ""}
						onChange={(e) => setLabel(e.target.value)}
						type={"text"}
						style={{
							width: `${
								windowWidth - leftPad / 2 - 48 + (deleteControl ? 0 : 32)
							}px`,
						}}
						onFocus={() => {
							setSelectedField(node.uuid);
						}}
						onBlur={() => {
							setSelectedField("", node.uuid);
						}}
					/>
				) : (
					<div
						className={styles.arrayIndex}
						style={{
							width: `${
								(index === undefined
									? windowWidth - 300 - leftPad / 2 - 48
									: 16) + (deleteControl ? 0 : 32)
							}px`,
						}}
					>
						{index}
					</div>
				)}
			</div>
			<div className={styles.arrayContainer}>
				{Object.keys(children).map((uuid) => {
					return (
						<ControlElement
							key={uuid}
							controlCandidates={controlCandidates}
							leftPad={32 + leftPad}
							node={children[uuid]}
							nodeTable={nodeTable}
							windowWidth={windowWidth}
							setValueAndHeight={(newValue, newHeight) => {
								const newControl = { ...children[uuid] };
								newControl.content = newValue;
								newControl.renderHeight =
									newHeight ?? children[uuid].renderHeight;
								children[uuid] = newControl;
								setValue(children);
							}}
							pickUpControl={pickUpControl}
							setSelectedField={setSelectedField}
							sliderOffset={0}
							onSliderGrab={() => {}}
						/>
					);
				})}
			</div>
		</>
	);
};
