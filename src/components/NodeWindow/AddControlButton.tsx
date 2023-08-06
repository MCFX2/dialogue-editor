import { FC, useState } from "react";
import { SearchList } from "./SearchList";
import { NodeControl } from "./NodeControl";
import styles from "./NodeWindow.module.scss";

export interface AddControlButtonProps {
	addControl: (control: NodeControl) => void;
	setSelectedField: (uuid: string, oldUuid?: string) => void;
	controlCandidates: NodeControl[];
	controls?: NodeControl[];

	style?: React.CSSProperties;
	buttonStyle?: React.CSSProperties;

	disabled?: boolean;
	labelOverride?: string;
	forcedControl?: NodeControl;
}

export const AddControlButton: FC<AddControlButtonProps> = ({
	addControl,
	setSelectedField,
	controlCandidates,
	controls,
	style,
	buttonStyle,
	disabled = false,
	labelOverride,
	forcedControl,
}) => {
	const [showAddMenu, setShowAddMenu] = useState(false);
	const [searchText, setSearchText] = useState("");

	const clearSelection = () => {
		setShowAddMenu(false);
		setSearchText("");
		// todo: it might be necessary to include the node uuid here
		setSelectedField("", "#addControlSearchField");
	};

	const submitControl = (control: NodeControl) => {
		const newControl = JSON.parse(JSON.stringify(control));
		addControl(newControl);
	};

	return (
		<div className={styles.addButtonField} style={style}>
			{showAddMenu ? (
				<>
					<input
						autoFocus={true}
						className={styles.searchBar}
						onBlur={clearSelection}
						onChange={(e) => setSearchText(e.target.value)}
						onFocus={() => {
							setSelectedField("#addControlSearchField");
						}}
						style={buttonStyle}
					/>
					<SearchList
						currentIdx={controls?.length ?? 0}
						addControl={(c) => {
							clearSelection();
							submitControl(c);
						}}
						searchText={searchText}
						controlCandidates={controlCandidates}
					/>
				</>
			) : (
				<button
					disabled={disabled}
					className={styles.addButton}
					onClick={() => {
						if (!forcedControl) {
							setShowAddMenu(true);
						} else {
							submitControl(forcedControl);
						}
					}}
					style={buttonStyle}
				>
					{labelOverride ?? "+ Add Field"}
				</button>
			)}
		</div>
	);
};
