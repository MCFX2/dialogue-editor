import { FC } from "react";
import styles from "./NodeWindow.module.scss";

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

	index: number;
	uuid: string;

	renderHeight: number;

	label: string;

	// for primitives, this is the value
	// for composites and arrays, this is the children
	content?: any;
}

interface ControlHolderProps {
	onSliderGrab: (e: React.MouseEvent) => void;
	sliderOffset: number;
	setText: (text: string) => void;
	text: string;
	children: any;
}

const ControlHolder: FC<ControlHolderProps> = ({
	onSliderGrab,
	sliderOffset,
	setText,
	text,
	children,
}) => {
	return (
		<div className={styles.controlContainer}>
			<input
				className={styles.controlLabelEditable}
				autoFocus={true}
				placeholder="(label)"
				type="text"
				value={text}
				onChange={(e) => setText(e.target.value)}
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

// generates a JSX element for a primitive control
export function primitiveElement(
	node: NodeControl
): (
	uuid: string,
	label: string,
	setLabel: (label: string) => void,
	value: any,
	setValue: (value: any) => void,
	onSliderGrab: (e: React.MouseEvent) => void,
	sliderOffset: number,
	windowWidth: number
) => JSX.Element {
	return (
		uuid: string,
		label: string,
		setLabel: (label: string) => void,
		value: any,
		setValue: (value: any) => void,
		onSliderGrab: (e: React.MouseEvent) => void,
		sliderOffset: number,
		windowWidth: number
	) => (
		<ControlHolder
			key={uuid}
			onSliderGrab={onSliderGrab}
			sliderOffset={sliderOffset}
			setText={setLabel}
			text={label}
		>
			{node.type === "boolean" ? (
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
						checked={value ?? false}
						onChange={(e) => setValue(e.target.checked)}
						type="checkbox"
						style={{
							height: "32px",
							width: "32px",
							padding: "0",
						}}
					/>
				</div>
			) : (
				<input
					className={styles.controlFieldEditable}
					placeholder="(value)"
					value={value ?? ''}
					onChange={(e) => setValue(e.target.value)}
					type={node.type === "number" ? "number" : "text"}
					style={{
						width: `${windowWidth - 140 - sliderOffset}px`,
					}}
				/>
			)}
		</ControlHolder>
	);
}

export const PrimitiveControls: NodeControl[] = [
	{
		label: "",
		type: "number",
		humanName: "Number",
		index: -1,
		uuid: "",
		renderHeight: 48,
	},
	{
		label: "",
		type: "string",
		humanName: "Text",
		index: -1,
		uuid: "",
		renderHeight: 48,
	},
	{
		label: "",
		type: "boolean",
		humanName: "Checkbox",
		index: -1,
		uuid: "",
		renderHeight: 48,
	},
	{
		label: "",
		type: "node",
		humanName: "Node",
		index: -1,
		uuid: "",
		renderHeight: 48,
	},
];
