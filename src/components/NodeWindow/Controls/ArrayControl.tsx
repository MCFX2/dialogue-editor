import { FC } from "react";
import { ControlElement, NodeControl } from "../NodeControl";
import { NodeHandle } from "../../../App";
import styles from "./Controls.module.scss";
import { MinusIcon } from "../../SVG/MinusIcon";
import { AddControlButton } from "../AddControlButton";
import { v4 } from "uuid";

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
	deleteControl: () => void;
	setSelectedField: (uuid: string, oldUuid?: string) => void;

	controlWidth: number;
	leftPad: number;
	index?: number;
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
	leftPad,
	index,
}) => {
	const children = (node.content ?? []) as NodeControl[];

	return (
		<>
			<div
				className={styles.controlContainer}
				style={{
					marginLeft: `${leftPad}px`,
					width: `${windowWidth - leftPad}px`,
				}}
			>
				<div className={styles.deleteControlButton} onClick={deleteControl}>
					<MinusIcon size={32} />
				</div>
				{index === undefined ? (
					<input
						className={styles.arrayTitle}
						placeholder='""'
						value={node.label ?? ""}
						onChange={(e) => setLabel(e.target.value)}
						type={"text"}
						style={{
							width: `${windowWidth - 300 - leftPad / 2 - 48}px`,
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
								index === undefined ? windowWidth - 300 - leftPad / 2 - 48 : 16
							}px`,
						}}
					>
						{index}
					</div>
				)}
				<AddControlButton
					addControl={(c) => {
						const newControl = { ...c };
						newControl.index = children.length;
						newControl.parent = node.parent;
						newControl.uuid = v4();
						children.push(newControl); // this is immediately overwritten by the setValue call, but it's necessary for the height calculation
						setValue(children);
					}}
					setSelectedField={setSelectedField}
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
				/>
			</div>
			<div className={styles.arrayContainer}>
				{children.map((child, idx) => {
					return (
						<ControlElement
							key={child.uuid}
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
					);
				})}
			</div>
		</>
	);
};
