import { FC, useEffect, useState } from "react";
import styles from "./NodeWindow.module.scss";
import { NodeControl } from "./NodeWindow";

export interface SearchListProps {
	searchText: string;

	controlCandidates: NodeControl[];

	addControl: (control: NodeControl) => void;

	currentIdx: number;
}

interface ElementNodeBinding {
	element: JSX.Element;
	node?: NodeControl;
}

export const SearchList: FC<SearchListProps> = ({
	searchText,
	controlCandidates,
	addControl,
	currentIdx
}: SearchListProps) => {
	const [selectedIdx, setSelectedIdx] = useState(0);

	const list: ElementNodeBinding[] = [];
	let firstValid = false;
	for (const control of controlCandidates) {
		if (
			control.humanName.toUpperCase().includes(searchText.toUpperCase()) ||
			control.type.toUpperCase().includes(searchText.toUpperCase())
		) {
			const idx = list.length;
			list.push({
				element: (
					<li
						key={idx}
						className={
							selectedIdx === idx
								? styles.selectedMenuOption
								: styles.menuOption
						}
						onMouseOver={() => {
							setSelectedIdx(idx);
						}}
						onMouseDown={() => {
							const newNode = { ...control };
							newNode.index = currentIdx;
							addControl(newNode);
						}}
						onMouseLeave={() => {
							if (selectedIdx === idx) {
								setSelectedIdx(0);
							}
						}}
					>
						<p className={styles.menuOptionText}>{control.humanName}</p>
					</li>
				),
				node: control,
			});
			if (!firstValid) {
				firstValid = true;
			}
		}
	}

	if (list.length === 0) {
		list.push({
			element: (
				<li key={-1} className={styles.menuOption}>
					<p className={styles.menuOptionText}>
						<i>No results found</i>
					</p>
				</li>
			),
			node: undefined,
		});
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
				const node = list[selectedIdx].node;
				if (list.length > 0 && node !== undefined) {
					// add the selected control to the node
					const newNode = { ...node };
					newNode.index = currentIdx;
					addControl(newNode);
				}
			}
		};

		window.addEventListener("keydown", handleKeyboardSearch);

		return () => {
			window.removeEventListener("keydown", handleKeyboardSearch);
		};
	});

	return (
		<div className={styles.addMenu}>
			<ul className={styles.addMenuList}>{list.map((l) => l.element)}</ul>
		</div>
	);
};
