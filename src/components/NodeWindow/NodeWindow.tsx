import React, { FC, useState } from "react";
import { ResizableWindow } from "../Resize/ResizableWindow";
import styles from "./NodeWindow.module.scss";
import { SearchList } from "./SearchList";
import { useMouseRelease } from "../MouseUtils/UseMouseClick";
import { useMouseMove } from "../MouseUtils/UseMouseMove";
import {
	NodeControl,
	PrimitiveControls,
	primitiveElement,
} from "./NodeControl";

export interface NodeWindowProps {
	renderPosition: { x: number; y: number };
	setRenderPosition: (newPos: { x: number; y: number }) => void;
	title?: string;
	controls?: NodeControl[];
	addControl: (control: NodeControl) => void;
	updateControl: (index: number, newControl: NodeControl) => void;
	removeControl: (uuid: string) => void;
	setTitle: (title: string) => void;
}

export const NodeWindow: FC<NodeWindowProps> = (props) => {
	const [showAddMenu, setShowAddMenu] = useState(false);
	const [searchText, setSearchText] = useState("");

	const [grabbingFrom, setGrabbingFrom] = useState<number | undefined>(undefined);
	const [sliderPos, setSliderPos] = useState(0);
	const [reqSliderPos, setReqSliderPos] = useState(0);

	const [windowWidth, setWindowWidth] = useState(400);

	useMouseRelease((e) => {
		if (grabbingFrom !== undefined && e.button === 0) {
			setGrabbingFrom(undefined);
			setReqSliderPos(sliderPos);
		}
	});

	useMouseMove((e) => {
		if (grabbingFrom !== undefined) {
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
			minWidth={200}
			defaultWidth={400}
			forcedHeight={combinedControlHeight + 96}
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
				setWindowWidth(newSize.x);
			}}
		>
			{props.controls?.map((control) =>
				primitiveElement(control)(
					control.uuid,
					control.label,
					(newLabel) => {
						const newControl = { ...control };
						newControl.label = newLabel;
						props.updateControl(control.index, newControl);
					},
					control.content,
					(newContent) => {
						const newControl = { ...control };
						newControl.content = newContent;
						props.updateControl(control.index, newControl);
					},
					(e: React.MouseEvent) => setGrabbingFrom(e.clientX),
					sliderPos,
					windowWidth
				)
			)}
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
							controlCandidates={PrimitiveControls}
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
