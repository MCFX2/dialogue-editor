import { FC, useState } from "react";
import { MenuItem, SubMenu } from "react-pro-sidebar";
import { WindowIcon } from "../SVG/WindowIcon";
import styles from "./Sidebar.module.scss";
import { MinusIcon } from "../SVG/MinusIcon";

export interface ScreensMenuProps {
	setSelectedField: (uuid: string, oldUuid?: string) => void;

	screenFiles: string[];
	createScreen: (filename: string) => void;
	loadScreen: (filename: string) => void;
	renameScreen: (oldName: string, newName: string) => void;
	deleteScreen: (name: string) => void;
	currentScreen: string;

	collapsed: boolean;
	unsaved: boolean;
}

export const ScreensMenu: FC<ScreensMenuProps> = ({
	setSelectedField,
	screenFiles,
	createScreen,
	loadScreen,
	renameScreen,
	deleteScreen,
	currentScreen,
	collapsed,
	unsaved,
}) => {
	const [editedFilename, setEditedFilename] = useState<string | undefined>(
		undefined
	);
	const [filenameSelected, setFilenameSelected] = useState(-2);

	return (
		<>
			{screenFiles.length > 0 && (
				<SubMenu
					icon={<WindowIcon size={28} />}
					label="Screens"
					className={`${styles.submenuBox} ${styles.mainMenuButton}`}
				>
					{screenFiles.map((file, idx) => {
						let fileDisplay = file ?? "";

						if (filenameSelected === idx && editedFilename !== undefined) {
							fileDisplay = editedFilename;
						} else {
							fileDisplay = file.replace(/\.(json)$/, "");
							if (filenameSelected !== idx) {
								if (file === currentScreen) {
									fileDisplay = "> " + fileDisplay;
									if (unsaved) fileDisplay += "*";
								}
							}
						}

						return (
							<MenuItem
								className={styles.submenuEntry}
								key={file}
								onClick={() => loadScreen(file)}
							>
								<div className={styles.screenEntryContainer}>
									{collapsed ? (
										<p className={styles.filenameFieldNonEditable}>
											{fileDisplay}
										</p>
									) : (
										<>
											<MinusIcon
												size={16}
												className={styles.deleteButton}
													onClick={(e) => {
														e.preventDefault();
														e.stopPropagation();
														deleteScreen(file);
												}}
											/>
											<input
												onClick={(e) => e.stopPropagation()}
												onFocus={() => {
													setSelectedField(idx + "#screenNameField");
													setFilenameSelected(idx);
												}}
												onBlur={() => {
													setSelectedField("", idx + "#screenNameField");
													setFilenameSelected(-2);

													if (
														editedFilename !== undefined &&
														editedFilename !== ""
													) {
														renameScreen(file, editedFilename + ".json");
													}

													setEditedFilename(undefined);
												}}
												className={styles.filenameField}
												value={fileDisplay}
												onChange={(e) => {
													setEditedFilename(e.target.value);
												}}
											/>
										</>
									)}
								</div>
							</MenuItem>
						);
					})}
					{!collapsed && (
						<MenuItem className={styles.submenuEntry}>
							<input
								className={styles.filenameField}
								autoFocus={true}
								onFocus={() => {
									setSelectedField("#newScreenField");
									setFilenameSelected(-1);
								}}
								onBlur={() => {
									if (editedFilename !== undefined && editedFilename !== "") {
										createScreen(editedFilename + ".json");
									}
									setSelectedField("", "#newScreenField");
									setEditedFilename(undefined);
									setFilenameSelected(-2);
								}}
								value={filenameSelected === -1 ? editedFilename : "" ?? ""}
								onChange={(e) => {
									setEditedFilename(e.target.value);
								}}
								placeholder="+ New Screen"
							/>
						</MenuItem>
					)}
				</SubMenu>
			)}
		</>
	);
};
