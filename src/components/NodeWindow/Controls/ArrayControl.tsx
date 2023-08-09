import { FC, Fragment } from "react";
import { ControlElement, NodeControl } from "../NodeControl";
import { NodeHandle } from "../../../App";
import styles from "./Controls.module.scss";
import { MinusIcon } from "../../SVG/MinusIcon";
import { AddControlButton } from "../AddControlButton";
import { v4 } from "uuid";
import { CompositeRestrictionControl } from "../../Modals/Composite/CompositeRestrictionControl";
import { extractArguments } from "./Sanitize";

export const recursivelySetParent = (node: NodeControl, parent: string) => {
	node.parent = parent;
	if (node.content) {
		if (node.type === "array") {
			for (let i = 0; i < node.content.length; i++) {
				recursivelySetParent(node.content[i], parent);
			}
		} else if(node.type === "composite") {
			for (const child of Object.values(node.content)) {
				recursivelySetParent(child as NodeControl, parent);
			}
		}
	}
}

export const DefaultArrayControl: NodeControl = {
	type: "array",
	humanName: "Array",
	renderHeight: 48,

	index: -1,
	uuid: "",
	label: "",
	parent: "",
	content: [],
};

export interface ArrayControlProps {
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
	restrict?: boolean;
}

export const ArrayControl: FC<ArrayControlProps> = ({
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
	restrict = false,
}) => {
	const children = (node.content ?? []) as NodeControl[];

	const args = extractArguments(node.restrictionIdentifier);

	const maxLengthArg = args["maxLength"];
	const maxLength = maxLengthArg ? parseInt(maxLengthArg) : undefined;

	const restrictTypeArg = args["type"];
	const restrictType = restrictTypeArg
		? controlCandidates.find((c) => {
				if (c.type === "number") {
					if (
						restrictTypeArg === "number|float" &&
						(c.restrictionIdentifier === "" ||
							c.restrictionIdentifier === undefined)
					) {
						return true;
					} else if (
						restrictTypeArg === "number|int" &&
						c.restrictionIdentifier !== "" &&
						c.restrictionIdentifier !== undefined
					) {
						return true;
					}
					return false;
				}
				if (c.type === "composite") {
					return c.humanName === restrictTypeArg;
				}
				return c.type === restrictTypeArg;
		  })
		: undefined;

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
								windowWidth - 300 - leftPad / 2 - 48 + (deleteControl ? 0 : 32)
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
				<AddControlButton
					disabled={maxLength !== undefined && children.length >= maxLength}
					addControl={(c) => {
						const newControl = { ...c };
						newControl.index = children.length;
						recursivelySetParent(newControl, node.parent);
						newControl.uuid = v4();
						children.push(newControl); // this is immediately overwritten by the setValue call, but it's necessary for the height calculation
						setValue(children);
					}}
					setSelectedField={(uuid, oldUuid) => {
						setSelectedField(uuid, oldUuid);
					}}
					controls={children}
					style={{
						width: `${
							index === undefined
								? 300 - leftPad / 2
								: windowWidth - leftPad - 64
						}px`,
					}}
					buttonStyle={{
						width: `${
							index === undefined
								? 200 - leftPad / 2
								: windowWidth - leftPad - 164
						}px`,
						marginTop: "0px",
					}}
					labelOverride={
						"+ Add" +
						(restrictType ? ` ${restrictType.humanName}` : "") +
						(maxLength ? ` (${children.length}/${maxLength})` : "")
					}
					forcedControl={restrictType}
					controlCandidates={controlCandidates}
				/>
			</div>
			<div className={styles.arrayContainer}>
				{children.map((child, idx) => {
					return (
						<Fragment key={child.uuid}>
							<ControlElement
								controlCandidates={controlCandidates}
								restrict={restrict}
								index={idx}
								leftPad={32 + leftPad}
								deleteControl={() => {
									const updatedChildren = children.filter(
										(c) => c.uuid !== child.uuid
									);
									setValue(updatedChildren);
								}}
								node={child}
								nodeTable={nodeTable}
								windowWidth={windowWidth}
								setLabel={(newLabel) => {
									const newControl = { ...child };
									newControl.label = newLabel;
									children[idx] = newControl;
									setValue(children);
								}}
								setValueAndHeight={(newValue, newHeight) => {
									const newControl = { ...child };
									newControl.content = newValue;
									newControl.renderHeight = newHeight ?? child.renderHeight;
									children[idx] = newControl;
									setValue(children);
								}}
								pickUpControl={pickUpControl}
								setSelectedField={setSelectedField}
								sliderOffset={0}
								onSliderGrab={() => {}}
							/>
							{restrict && (
								<CompositeRestrictionControl
									controlCandidates={controlCandidates}
									node={child}
									updateNode={(newNode) => {
										const newControl = { ...child };
										newControl.restrictionIdentifier =
											newNode.restrictionIdentifier;
										children[idx] = newControl;
										setValue(children);
									}}
									padding={leftPad + 32}
								/>
							)}
						</Fragment>
					);
				})}
			</div>
		</>
	);
};
