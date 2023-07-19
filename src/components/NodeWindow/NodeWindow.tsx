import React, { FC, useState } from "react";
import { ResizableWindow } from "../Resize/ResizableWindow";
import styles from "./NodeWindow.module.scss";
import { SearchList } from "./SearchList";

export interface NodeWindowProps {
	worldPosition: { x: number; y: number };
	title?: string;
	controls?: NodeControl[];
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

	element: JSX.Element;
}

export const PrimitiveControls: NodeControl[] = [
	{
		type: "number",
		humanName: "Number",
		element: (
			<div>
				<input type="text"></input>
				<input type="number" />
			</div>
		),
	},
	{
		type: "string",
		humanName: "Text",
		element: (
			<div>
				<input type="text"></input>
				<input type="text" />
			</div>
		),
	},
	{
		type: "boolean",
		humanName: "Checkbox",
		element: (
			<div>
				<input type="text"></input>
				<input type="checkbox" />
			</div>
		),
	},
	{
		type: "node",
		humanName: "Node",
		element: (
			<div>
				<input type="text"></input>
				<input type="text" />
			</div>
		),
	},
];

export const NodeWindow: FC<NodeWindowProps> = (props) => {
	const [showAddMenu, setShowAddMenu] = useState(false);
	const [searchText, setSearchText] = useState("");

	return (
		<ResizableWindow
			allowCollapse={false}
			allowOutOfBounds={true}
			allowHorizontalResize={false}
			allowVerticalResize={false}
			forcedOffsetX={props.worldPosition.x}
			forcedOffsetY={props.worldPosition.y}
			ignoreWindowResize={true}
			titlebarChildren={
				props.title === undefined ? undefined : (
					<p className={styles.nodeWindowTitle}>{props.title}</p>
				)
			}
		>
			{props.controls?.map((control) => control.element)}
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
