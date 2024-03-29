import { FC, Fragment } from "react";
import { ControlElement, NodeControl } from "../NodeControl";
import { NodeHandle, deepCopy } from "../../../App";
import styles from "./Controls.module.scss";
import { MinusIcon } from "../../SVG/MinusIcon";
import { extractArguments } from "./Sanitize";

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
	blockEdit?: boolean;
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
	blockEdit = false,
}) => {
	const children = (node.content ?? []) as { [uuid: string]: NodeControl };

	const args = extractArguments(node.restrictionIdentifier);

	const allowEdit = args["disabled"] !== "true";

	return (
		<>
			<div
				className={styles.controlContainer}
				style={{
					marginLeft: `${leftPad}px`,
					width: `${windowWidth - leftPad}px`,
				}}
			>
				{!blockEdit && deleteControl && (
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
							blockEdit={blockEdit || !allowEdit}
							key={uuid}
							controlCandidates={controlCandidates}
							leftPad={32 + leftPad}
							node={children[uuid]}
							nodeTable={nodeTable}
							windowWidth={windowWidth}
							setValueAndHeight={(newValue, newHeight) => {
								const newControl = deepCopy(children[uuid]);
								newControl.content = newValue;
								newControl.renderHeight =
									newHeight ?? children[uuid].renderHeight;
								const newChildren = deepCopy(children);
								newChildren[uuid] = newControl;
								setValue(newChildren);
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
