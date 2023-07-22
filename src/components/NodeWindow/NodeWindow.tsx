import React, { FC, useState } from "react";
import { ResizableWindow } from "../Resize/ResizableWindow";
import styles from "./NodeWindow.module.scss";
import { SearchList } from "./SearchList";
import { useMouseRelease } from "../MouseUtils/UseMouseClick";
import { useMouseMove } from "../MouseUtils/UseMouseMove";

export interface NodeWindowProps {
	worldPosition: { x: number; y: number };
	title?: string;
	controls?: NodeControl[];
	addControl: (control: NodeControl) => void;
	removeControl: (uuid: string) => void;
	setTitle: (title: string) => void;
}

export interface NodeControl {
	type:
		| "number"
		| "dropdown"
		| "node"
		| "string"
		| "boolean"
		| "composite"
		| "array";
	restrictionIdentifier?: string;

	humanName: string;

	element: (
		uuid: string,
		onSliderGrab: (e: React.MouseEvent) => void,
		sliderOffset: number,
		windowWidth: number
	) => JSX.Element;

	index: number;
	uuid: string;

	renderHeight: number;
}

interface ControlHolderProps {
	onSliderGrab: (e: React.MouseEvent) => void;
	sliderOffset: number;
	children: any;
}

const ControlHolder: FC<ControlHolderProps> = ({
	onSliderGrab,
	sliderOffset,
	children,
}) => {
	return (
		<div className={styles.controlContainer}>
			<input
				className={styles.controlLabelEditable}
				autoFocus={true}
				placeholder="(label)"
				type="text"
				style={{
					width: `${100 + sliderOffset}px`,
				}}
			/>
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

export const PrimitiveControls: NodeControl[] = [
	{
		type: "number",
		humanName: "Number",
		element: (id, onSliderGrab, sliderOffset, windowWidth) => (
			<ControlHolder
				key={id}
				onSliderGrab={onSliderGrab}
				sliderOffset={sliderOffset}
			>
				<input
					className={styles.controlFieldEditable}
					placeholder="(value)"
					type="number"
					style={{
						width: `${windowWidth - 140 - sliderOffset}px`,
					}}
				/>
			</ControlHolder>
		),
		index: -1,
		uuid: "",
		renderHeight: 48,
	},
	{
		type: "string",
		humanName: "Text",
		element: (id, onSliderGrab, sliderOffset, windowWidth) => (
			<ControlHolder
				key={id}
				onSliderGrab={onSliderGrab}
				sliderOffset={sliderOffset}
			>
				<input
					className={styles.controlFieldEditable}
					placeholder="(value)"
					type="text"
					style={{
						width: `${windowWidth - 140 - sliderOffset}px`,
					}}
				/>
			</ControlHolder>
		),
		index: -1,
		uuid: "",
		renderHeight: 48,
	},
	{
		type: "boolean",
		humanName: "Checkbox",
		element: (id, onSliderGrab, sliderOffset, windowWidth) => (
			<ControlHolder
				key={id}
				onSliderGrab={onSliderGrab}
				sliderOffset={sliderOffset}
			>
				<div
					style={{
						display: "flex",
						alignItems: "start",
						justifyContent: "start",
						padding: "1px 2px",
						height: "32px",
						width: `${windowWidth - 140 - sliderOffset}px`,
					}}
				>
					<input
						type="checkbox"
						style={{
							height: "32px",
							width: "32px",
							padding: "0",
						}}
					/>
				</div>
			</ControlHolder>
		),
		index: -1,
		uuid: "",
		renderHeight: 48,
	},
	{
		type: "node",
		humanName: "Node",
		element: (
			id, // todo: replace text with node selector
			onSliderGrab,
			sliderOffset,
			windowWidth
		) => (
			<ControlHolder
				key={id}
				onSliderGrab={onSliderGrab}
				sliderOffset={sliderOffset}
			>
				<input
					className={styles.controlFieldEditable}
					placeholder="(value)"
					type="text"
					style={{
						width: `${windowWidth - 140 - sliderOffset}px`,
					}}
				/>
			</ControlHolder>
		),
		index: -1,
		uuid: "",
		renderHeight: 48,
	},
];

export const NodeWindow: FC<NodeWindowProps> = (props) => {
	const [showAddMenu, setShowAddMenu] = useState(false);
	const [searchText, setSearchText] = useState("");

	const [grabbingFrom, setGrabbingFrom] = useState(-9999);
	const [sliderPos, setSliderPos] = useState(0);
	const [reqSliderPos, setReqSliderPos] = useState(0);

	const [windowWidth, setWindowWidth] = useState(400);

	useMouseRelease((e) => {
		if (grabbingFrom !== -9999 && e.button === 0) {
			setGrabbingFrom(-9999);
			setReqSliderPos(sliderPos);
		}
	});

	useMouseMove((e) => {
		if (grabbingFrom !== -9999) {
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

	return (
		<ResizableWindow
			allowOutOfBounds={true}
			allowVerticalResize={false}
			forcedOffsetX={props.worldPosition.x}
			forcedOffsetY={props.worldPosition.y}
			ignoreWindowResize={true}
			minWidth={200}
			defaultWidth={400}
			forcedHeight={
				(props.controls
					?.map((c) => c.renderHeight)
					.reduce((prev, cur) => {
						return prev + cur;
					}, 0) ?? 0) + 96
			}
			titlebarChildren={
				props.title === undefined ? undefined : (
					<input
						className={styles.nodeWindowTitle}
						value={props.title}
						onChange={(e) => props.setTitle(e.target.value)}
						placeholder="(untitled node)"
					/>
				)
			}
			onSizeChange={(newSize) => {
				setWindowWidth(newSize.x);
			}}
		>
			{props.controls?.map((control) =>
				control.element(
					control.uuid,
					(e) => setGrabbingFrom(e.clientX),
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
