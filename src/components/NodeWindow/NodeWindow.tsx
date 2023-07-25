import React, { FC, useState } from "react";
import { ResizableWindow } from "../Resize/ResizableWindow";
import styles from "./NodeWindow.module.scss";
import { SearchList } from "./SearchList";
import { useMouseRelease } from "../MouseUtils/UseMouseClick";
import { useMouseMove } from "../MouseUtils/UseMouseMove";
import {
	ControlElement,
	DefaultControls,
	NodeControl,
} from "./NodeControl";
import { NodeHandle } from "../../App";

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
			if (newSliderPos > -36 && newSliderPos < 180) {
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
			minWidth={240}
			defaultWidth={400}
			defaultXPos={props.renderPosition.x}
			defaultYPos={props.renderPosition.y}
			forcedHeight={combinedControlHeight + 96}
			forcedWidth={props.width}
			titlebarChildren={
				props.title === undefined ? undefined : (
					<input
						className={styles.nodeWindowTitle}
						value={props.title}
						onChange={(e) => props.setTitle(e.target.value)}
						placeholder="(untitled)"
					/>
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
							}}
							onChange={(e) => setSearchText(e.target.value)}
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
