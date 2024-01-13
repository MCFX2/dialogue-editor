import { FC, useState } from "react";
import { ResizableWindow } from "../Resize/ResizableWindow";
import styles from "./NodeWindow.module.scss";
import { useMouseRelease } from "../MouseUtils/UseMouseClick";
import { useMouseMove } from "../MouseUtils/UseMouseMove";
import { ControlElement, NodeControl } from "./NodeControl";
import { NodeHandle, deepCopy } from "../../App";
import { SquareXIcon } from "../SVG/SquareXIcon";
import { WindowPlusIcon } from "../SVG/WindowPlusIcon";
import { AddControlButton } from "./AddControlButton";

export const recursiveCalculateHeight = (
	control: NodeControl[],
	stopIndex: number
): number => {
	return control.reduce<number>((prev, cur) => {
		if (cur.index > stopIndex) return prev;
		if (cur.type === "array") {
			return (
				prev +
				cur.renderHeight +
				recursiveCalculateHeight(cur.content, stopIndex)
			);
		} else if (cur.type === "composite") {
			return (
				prev +
				cur.renderHeight +
				recursiveCalculateHeight(Object.values(cur.content), stopIndex)
			);
		}
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
	controlCandidates: NodeControl[];
}

export const NodeWindow: FC<NodeWindowProps> = ({
	renderPosition,
	setRenderPosition,

	title,
	setTitle,

	controls,
	controlCandidates,
	addControl,
	updateControl,
	removeControl,

	width,
	setWidth,

	nodeTable,
	pickUpControl,

	isSelected,

	deleteNode,

	setSelectedField,
}) => {
	const [grabbingFrom, setGrabbingFrom] = useState<number | undefined>(
		undefined
	);
	const [sliderPos, setSliderPos] = useState(0);
	const [reqSliderPos, setReqSliderPos] = useState(0);

	const [nodeTitle, setNodeTitle] = useState<string | undefined>(undefined);
	const [nodePosition, setNodePosition] = useState<
		{ x: number; y: number } | undefined
	>(undefined);

	useMouseRelease((e) => {
		if (e.button === 0) {
			if (grabbingFrom !== undefined) {
				setGrabbingFrom(undefined);
				setReqSliderPos(sliderPos);
			}
			if (nodePosition !== undefined) {
				setRenderPosition(nodePosition);
				setNodePosition(undefined);
			}
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
			if (newSliderPos > -36 && newSliderPos < width - 260) {
				setSliderPos(newSliderPos);
			}
		}
	});

	const combinedControlHeight = controls
		? recursiveCalculateHeight(controls, 9999)
		: 0;

	return (
		<ResizableWindow
			allowOutOfBounds={true}
			onWindowMoved={(newPos) => {
				setNodePosition(newPos);
			}}
			forcedPositionX={nodePosition?.x ?? renderPosition.x}
			forcedPositionY={nodePosition?.y ?? renderPosition.y}
			ignoreWindowResize={true}
			minWidth={400}
			defaultWidth={400}
			defaultXPos={renderPosition.x}
			defaultYPos={renderPosition.y}
			forcedHeight={combinedControlHeight + 96}
			forcedWidth={width}
			showHighlight={isSelected}
			titlebarChildren={
				title === undefined ? undefined : (
					<>
						<input
							className={styles.nodeWindowTitle}
							value={nodeTitle ?? title}
							onChange={(e) => setNodeTitle(e.target.value)}
							placeholder="(untitled)"
							onFocus={() => {
								setSelectedField("#nodeWindowTitleField");
								setNodeTitle(title);
							}}
							onBlur={() => {
								setSelectedField("", "#nodeWindowTitleField");
								setTitle(nodeTitle!);
								setNodeTitle(undefined);
							}}
						/>
						<div className={styles.nodeWindowSafeMiddle} />
						<div className={styles.compositeButton}>
							<WindowPlusIcon size={32} />
						</div>
						<div className={styles.deleteButton} onClick={deleteNode}>
							<SquareXIcon size={32} />
						</div>
					</>
				)
			}
			onSizeChange={(newSize) => {
				setWidth(newSize.x);
			}}
		>
			{controls?.map((control) => (
				<ControlElement
					controlCandidates={controlCandidates}
					key={control.uuid}
					node={control}
					nodeTable={nodeTable}
					windowWidth={width}
					sliderOffset={sliderPos}
					onSliderGrab={(e) => setGrabbingFrom(e.clientX)}
					setLabel={(newLabel) => {
						const newControl = deepCopy(control);
						newControl.label = newLabel;
						updateControl(control.uuid, newControl);
					}}
					setValueAndHeight={(newValue, newHeight) => {
						const newControl = deepCopy(control);
						newControl.content = newValue;
						newControl.renderHeight = newHeight ?? control.renderHeight;
						updateControl(control.uuid, newControl);
					}}
					pickUpControl={pickUpControl}
					deleteControl={() => removeControl(control.uuid)}
					setSelectedField={setSelectedField}
				/>
			))}
			<AddControlButton
				controlCandidates={controlCandidates}
				addControl={addControl}
				setSelectedField={setSelectedField}
				controls={controls}
			/>
		</ResizableWindow>
	);
};
