import { FC, useState } from "react";
import { SearchList } from "./SearchList";
import { DefaultControls, NodeControl } from "./NodeControl";
import styles from "./NodeWindow.module.scss";

export interface AddControlButtonProps {
	addControl: (control: NodeControl) => void;
	setSelectedField: (uuid: string, oldUuid?: string) => void;
	controls?: NodeControl[];

	style?: React.CSSProperties;
	buttonStyle?: React.CSSProperties;
}

export const AddControlButton: FC<AddControlButtonProps> = ({
	addControl,
	setSelectedField,
	controls,
	style,
	buttonStyle,
}) => {
	const [showAddMenu, setShowAddMenu] = useState(false);
	const [searchText, setSearchText] = useState("");

	return (
		<div className={styles.addButtonField} style={style}>
			{showAddMenu ? (
				<>
					<input
						autoFocus={true}
						className={styles.searchBar}
						onBlur={() => {
							setShowAddMenu(false);
							setSearchText("");
							// todo: it might be necessary to include the node uuid here
							setSelectedField("", "#addControlSearchField");
						}}
						onChange={(e) => setSearchText(e.target.value)}
						onFocus={() => {
							setSelectedField("#addControlSearchField");
						}}
						style={buttonStyle}
					/>
					<SearchList
						currentIdx={controls?.length ?? 0}
						addControl={(c) => {
							setShowAddMenu(false);
							setSearchText("");
							const newControl = { ...c };
							if (newControl.type === 'array') {
								newControl.content = [];
							}
							setSelectedField('', '#addControlSearchField');
							addControl(newControl);
						}}
						searchText={searchText}
						controlCandidates={DefaultControls}
					/>
				</>
			) : (
				<button
					className={styles.addButton}
					onClick={() => setShowAddMenu(true)}
					style={buttonStyle}
				>
					+ Add Field
				</button>
			)}
		</div>
	);
};
