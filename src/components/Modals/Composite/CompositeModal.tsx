import { FC, Fragment, useState } from "react";
import { ResizableWindow } from "../../Resize/ResizableWindow";
import styles from "./CompositeModal.module.scss";
import { ControlElement, NodeControl } from "../../NodeWindow/NodeControl";
import { DefaultTextControl } from "../../NodeWindow/Controls/TextNodeControl";
import { useMouseMove } from "../../MouseUtils/UseMouseMove";
import { useMouseRelease } from "../../MouseUtils/UseMouseClick";
import { recursiveCalculateHeight } from "../../NodeWindow/NodeWindow";
import { AddControlButton } from "../../NodeWindow/AddControlButton";
import { v4 } from "uuid";
import {
	CompositeRestrictionControl,
	recursiveCalculateRestrictorHeight,
} from "./CompositeRestrictionControl";

export interface Composite {
	name: NodeControl;
	fields: { [uuid: string]: NodeControl };
}

export interface CompositeModalProps {
	setSelectedField: (uuid: string, oldUuid?: string) => void;
}

export const CompositeModal: FC<CompositeModalProps> = ({
	setSelectedField,
}) => {
	const [currentComposite, setCurrentComposite] = useState<Composite>({
		name: { ...DefaultTextControl, label: "Composite Name" },
		fields: {},
	});

	const [windowWidth, setWindowWidth] = useState(600);

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
			if (newSliderPos > -36 && newSliderPos < windowWidth - 260) {
				setSliderPos(newSliderPos);
			}
		}
	});

	const controlArray = Object.keys(currentComposite.fields).map(
		(key) => currentComposite.fields[key]
	);

	const height =
		recursiveCalculateRestrictorHeight(controlArray, 9999) +
		recursiveCalculateHeight(controlArray, 9999) +
		148;

	return (
		<ResizableWindow
			defaultXPos={window.innerWidth / 2 - 300}
			defaultYPos={window.innerHeight / 2 - 300}
			titlebarChildren={
				<div className={styles.compositeModalTitle}>New Composite</div>
			}
			minWidth={600}
			onSizeChange={(newWidth) => {
				setWindowWidth(newWidth.x);
			}}
			defaultWidth={600}
			forcedHeight={height}
		>
			<ControlElement
				windowWidth={windowWidth}
				nodeTable={{}}
				node={currentComposite.name}
				onSliderGrab={(e) => setGrabbingFrom(e.clientX)}
				sliderOffset={sliderPos}
				pickUpControl={() => {}}
				setSelectedField={setSelectedField}
				setValueAndHeight={(value) => {
					setCurrentComposite({
						...currentComposite,
						name: {
							...currentComposite.name,
							content: value,
						},
					});
				}}
			/>
			{Object.keys(currentComposite.fields).map((key) => {
				return (
					<Fragment key={key}>
						<ControlElement
							windowWidth={windowWidth}
							nodeTable={{}}
							onSliderGrab={(e) => setGrabbingFrom(e.clientX)}
							sliderOffset={sliderPos}
							pickUpControl={() => {}}
							setSelectedField={setSelectedField}
							deleteControl={() => {
								const newFields = { ...currentComposite.fields };
								delete newFields[key];
								setCurrentComposite({
									...currentComposite,
									fields: newFields,
								});
							}}
							setValueAndHeight={(value) => {
								setCurrentComposite({
									...currentComposite,
									fields: {
										...currentComposite.fields,
										[key]: {
											...currentComposite.fields[key],
											content: value,
										},
									},
								});
							}}
							setLabel={(label) => {
								setCurrentComposite({
									...currentComposite,
									fields: {
										...currentComposite.fields,
										[key]: {
											...currentComposite.fields[key],
											label: label,
										},
									},
								});
							}}
							node={currentComposite.fields[key]}
							invalid={
								currentComposite.fields[key].label === "" ||
								controlArray.find(
									(c) =>
										c.label === currentComposite.fields[key].label &&
										c.uuid !== currentComposite.fields[key].uuid
								) !== undefined
							}
						/>
						<CompositeRestrictionControl
							node={currentComposite.fields[key]}
							updateNode={(node) => {
								setCurrentComposite({
									...currentComposite,
									fields: {
										...currentComposite.fields,
										[key]: node,
									},
								});
							}}
						/>
					</Fragment>
				);
			})}
			<AddControlButton
				setSelectedField={setSelectedField}
				controls={controlArray}
				addControl={(control) => {
					control.uuid = v4();

					setCurrentComposite({
						...currentComposite,
						fields: {
							...currentComposite.fields,
							[control.uuid]: control,
						},
					});
				}}
			/>
		</ResizableWindow>
	);
};
