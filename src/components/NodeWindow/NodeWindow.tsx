import React, { FC, useState } from "react";
import { ResizableWindow } from "../Resize/ResizableWindow";
import styles from "./NodeWindow.module.scss";
import { SearchList } from "./SearchList";
import { useMouseRelease } from "../MouseUtils/UseMouseClick";
import { useMouseMove } from "../MouseUtils/UseMouseMove";
import { ControlElement, DefaultControls, NodeControl } from "./NodeControl";
import { NodeHandle } from "../../App";
import { SquareXIcon } from "../SVG/SquareXIcon";
import { WindowPlusIcon } from "../SVG/WindowPlusIcon";

export interface NodeWindowProps {
	renderPosition: { x: number; y: number };
	setRenderPosition: (newPos: { x: number; y: number }) => void;
	title?: string;
	controls?: NodeControl[];
	addControl: (control: NodeControl) => void;
	updateControl: (index: number, newControl: NodeControl) => void;
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
	const [showAddMenu, setShowAddMenu] = useState(false);
	const [searchText, setSearchText] = useState("");

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

	const combinedControlHeight =
		props.controls
			?.map((c) => c.renderHeight)
			.reduce((prev, cur) => {
				return prev + cur;
			}, 0) ?? 0;

	return (
		<ResizableWindow
			allowOutOfBounds={true}
			allowVerticalResize={false}
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
						props.updateControl(control.index, newControl);
					}}
					setValue={(newValue) => {
						const newControl = { ...control };
						newControl.content = newValue;
						props.updateControl(control.index, newControl);
					}}
					pickUpControl={() => props.pickUpControl(control)}
					deleteControl={() => props.removeControl(control.uuid)}
					setSelectedField={props.setSelectedField}
				/>
			))}
			<div className={styles.addButtonField}>
				{showAddMenu ? (
					<>
						<input
							autoFocus={true}
							className={styles.searchBar}
							onBlur={() => {
								setShowAddMenu(false);
								setSearchText("");
								// todo: it might be necessary to include the node uuid here
								props.setSelectedField('', '#addControlSearchField')
							}}
							onChange={(e) => setSearchText(e.target.value)}
							onFocus={() => {
								props.setSelectedField('#addControlSearchField')
							}}
						/>
						<SearchList
							currentIdx={props.controls?.length ?? 0}
							addControl={(c) => {
								setShowAddMenu(false);
								setSearchText("");
								props.addControl(c);
							}}
							searchText={searchText}
							controlCandidates={DefaultControls}
						/>
					</>
				) : (
					<button
						className={styles.addButton}
						onClick={() => setShowAddMenu(true)}
					>
						+ Add Field
					</button>
				)}
			</div>
		</ResizableWindow>
	);
};
