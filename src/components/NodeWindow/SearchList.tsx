import { FC, useEffect, useState } from "react";
import styles from "./NodeWindow.module.scss";
import { NodeControl } from "./NodeWindow";

export interface SearchListProps {
	searchText: string;

	controlCandidates: NodeControl[];
}

export const SearchList: FC<SearchListProps> = ({
	searchText,
	controlCandidates,
}: SearchListProps) => {
	const [selectedIdx, setSelectedIdx] = useState(0);
	const [defaultIdx, setDefaultIdx] = useState(0);

	const list: JSX.Element[] = [];
	let firstValid = false;
	for (const control of controlCandidates) {
		if (
			control.humanName.toUpperCase().includes(searchText.toUpperCase()) ||
			control.type.toUpperCase().includes(searchText.toUpperCase())
		) {
			const idx = list.length;
			list.push(
				<li
					className={
						selectedIdx === idx ? styles.selectedMenuOption : styles.menuOption
					}
					onMouseOver={() => {
						setSelectedIdx(idx);
					}}
					onMouseLeave={() => {
						if(selectedIdx === idx) {
							setSelectedIdx(defaultIdx);
						}
					}}
				>
					<p className={styles.menuOptionText}>{control.humanName}</p>
				</li>
			);
			if (!firstValid) {
				firstValid = true;
			}
		}
	}

	if (list.length === 0) {
		list.push(
			<li className={styles.menuOption}>
				<p className={styles.menuOptionText}><i>No results found</i></p>
			</li>
		);
	}

	useEffect(() => {
		const handleKeyboardSearch = (e: KeyboardEvent) => {
			if (e.key === "ArrowDown") {
				if (selectedIdx < list.length - 1) {
					setSelectedIdx(selectedIdx + 1);
				}
			} else if (e.key === "ArrowUp") {
				if (selectedIdx > 0) {
					setSelectedIdx(selectedIdx - 1);
				}
			} else if (e.key === "Enter") {
				if (list.length > 0) {
					// add the selected control to the node
				}
			}
		};

		window.addEventListener("keydown", handleKeyboardSearch);

		return () => {
			window.removeEventListener("keydown", handleKeyboardSearch);
		}
	})

	return (
		<div className={styles.addMenu}>
			<ul className={styles.addMenuList}>{list}</ul>
		</div>
	);
};
