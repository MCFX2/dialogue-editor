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
	saveComposite: (composite: Composite) => void;
	controlCandidates: NodeControl[];
	existingComposites: Composite[];
}

export const CompositeModal: FC<CompositeModalProps> = ({
	setSelectedField,
	saveComposite,
	controlCandidates,
	existingComposites,
}) => {
	const [currentComposite, setCurrentComposite] = useState<Composite>({
		name: {
			...DefaultTextControl,
			label: "Composite Name",
			uuid: "#newCompositeControl",
			restrictionIdentifier: "regex:/^(?!\\s)[a-zA-Z0-9_ .-]+(?<![\\s.])$/g//,",
		},
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
		198;

	let valid =
		currentComposite.name.content !== "" &&
		controlArray.length > 0 &&
		!existingComposites.find(
			(c) => c.name.content === currentComposite.name.content
		);

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
				controlCandidates={controlCandidates}
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
				invalid={!valid}
			/>
			{Object.keys(currentComposite.fields).map((key) => {
				const isInvalid =
					currentComposite.fields[key].label === "" ||
					controlArray.find(
						(c) =>
							c.label === currentComposite.fields[key].label &&
							c.uuid !== currentComposite.fields[key].uuid
					) !== undefined;

				if (isInvalid) {
					valid = false;
				}

				return (
					<Fragment key={key}>
						<ControlElement
							controlCandidates={controlCandidates}
							restrict
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
							invalid={isInvalid}
						/>
						<CompositeRestrictionControl
							controlCandidates={controlCandidates}
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
				controlCandidates={controlCandidates}
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
			<div className={styles.saveButtonContainer}>
				<button
					className={styles.saveButton}
					disabled={!valid}
					onClick={() => saveComposite(currentComposite)}
				>
					Save Composite
				</button>
			</div>
		</ResizableWindow>
	);
};
