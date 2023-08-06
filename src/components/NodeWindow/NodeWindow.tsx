import React, { FC, useState } from "react";
import { ResizableWindow } from "../Resize/ResizableWindow";
import styles from "./NodeWindow.module.scss";
import { useMouseRelease } from "../MouseUtils/UseMouseClick";
import { useMouseMove } from "../MouseUtils/UseMouseMove";
import { ControlElement, NodeControl } from "./NodeControl";
import { NodeHandle } from "../../App";
import { SquareXIcon } from "../SVG/SquareXIcon";
import { WindowPlusIcon } from "../SVG/WindowPlusIcon";
import { AddControlButton } from "./AddControlButton";

export const recursiveCalculateHeight = (
	control: NodeControl[],
	stopIndex: number
): number => {
	return control.reduce<number>((prev, cur) => {
		if (cur.index > stopIndex) return prev;
		if (cur.type === "array")
			return (
				prev +
				cur.renderHeight +
				recursiveCalculateHeight(cur.content, stopIndex)
			);
		return prev + cur.renderHeight;
	}, 0);
};

export interface NodeWindowProps {
	renderPosition: { x: number; y: number };
	setRenderPosition: (newPos: { x: number; y: number }) => void;
	title?: string;
	controls?: NodeControl[];
	addControl: (control: NodeControl) => void;
	updateControl: (uuid: string, newControl: NodeControl) => void;
	removeControl: (uuid: string) => void;
	width: number;
	setWidth: (newWidth: number) => void;
	setTitle: (title: string) => void;
	nodeTable: { [uuid: string]: NodeHandle };
	pickUpControl: (control: NodeControl) => void;
	isSelected: boolean;
	deleteNode: () => void;
	setSelectedField: (uuid: string, oldUuid?: string) => void;
}

export const NodeWindow: FC<NodeWindowProps> = (props) => {
	const [grabbingFrom, setGrabbingFrom] = useState<number | undefined>(
		undefined
	);
	const [sliderPos, setSliderPos] = useState(0);
	const [reqSliderPos, setReqSliderPos] = useState(0);

	useMouseRelease((e) => {
		if (grabbingFrom !== undefined && e.button === 0) {
			setGrabbingFrom(undefined);
			setReqSliderPos(sliderPos);
		}
	});

	useMouseMove((e) => {
		if (grabbingFrom !== undefined) {
			e.preventDefault(); // vain attempt at preventing text selection
			const newSliderPos = reqSliderPos + e.clientX - grabbingFrom;
			// why can't I just use e.movementX you may ask?
			// because it's broken in multiple browsers
			// yay
			setGrabbingFrom(e.clientX);
			setReqSliderPos(newSliderPos);
			if (newSliderPos > -36 && newSliderPos < (props.width - 260)) {
				setSliderPos(newSliderPos);
			}
		}
	});

	const combinedControlHeight = props.controls ? recursiveCalculateHeight(props.controls, 9999) : 0;
	
	return (
		<ResizableWindow
			allowOutOfBounds={true}
			onWindowMoved={(newPos) => {
				props.setRenderPosition(newPos);
			}}
			forcedPositionX={props.renderPosition.x}
			forcedPositionY={props.renderPosition.y}
			ignoreWindowResize={true}
			minWidth={400}
			defaultWidth={400}
			defaultXPos={props.renderPosition.x}
			defaultYPos={props.renderPosition.y}
			forcedHeight={combinedControlHeight + 96}
			forcedWidth={props.width}
			showHighlight={props.isSelected}
			titlebarChildren={
				props.title === undefined ? undefined : (
					<>
						<input
							className={styles.nodeWindowTitle}
							value={props.title}
							onChange={(e) => props.setTitle(e.target.value)}
							placeholder="(untitled)"
							onFocus={() => {
								props.setSelectedField('#nodeWindowTitleField');
							}}
							onBlur={() => {
								props.setSelectedField('', '#nodeWindowTitleField');
							}}
						/>
						<div className={styles.nodeWindowSafeMiddle} />
						<div className={styles.compositeButton}>
							<WindowPlusIcon size={32} />
						</div>
						<div className={styles.deleteButton} onClick={props.deleteNode}>
							<SquareXIcon size={32} />
						</div>
					</>
				)
			}
			onSizeChange={(newSize) => {
				props.setWidth(newSize.x);
			}}
		>
			{props.controls?.map((control) => (
				<ControlElement
					key={control.uuid}
					node={control}
					nodeTable={props.nodeTable}
					windowWidth={props.width}
					sliderOffset={sliderPos}
					onSliderGrab={(e) => setGrabbingFrom(e.clientX)}
					setLabel={(newLabel) => {
						const newControl = { ...control };
						newControl.label = newLabel;
						props.updateControl(control.uuid, newControl);
					}}
					setValueAndHeight={(newValue, newHeight) => {
						const newControl = { ...control };
						newControl.content = newValue;
						newControl.renderHeight = newHeight ?? control.renderHeight;
						props.updateControl(control.uuid, newControl);
					}}
					pickUpControl={props.pickUpControl}
					deleteControl={() => props.removeControl(control.uuid)}
					setSelectedField={props.setSelectedField}
				/>
			))}
			<AddControlButton
				addControl={props.addControl}
				setSelectedField={props.setSelectedField}
				controls={props.controls}
			/>
		</ResizableWindow>
	);
};
