import React, { FC, useEffect, useRef, useState } from "react";
import {
	Menu,
	MenuItem,
	Sidebar,
	//	Sidebar,
	SubMenu,
	// import sidebar library to make life easier. end up having to rip out half the functionality and do it myself anyway. classic
} from "react-pro-sidebar";
import styles from "./Sidebar.module.scss";
import { PlusIcon2 } from "../components/SVG/PlusIcon";
import { SaveIcon } from "../components/SVG/SaveIcon";
import { LoadIcon } from "../components/SVG/LoadIcon";
import { WindowIcon } from "../components/SVG/WindowIcon";
import { useMouseMove } from "../components/MouseUtils/UseMouseMove";

export interface SidebarProps {
	createNewNode: (pos: { x: number; y: number }) => void;
	loadWorkspace: () => void;
	saveWorkspace: () => void;

	unsaved: boolean;

	screenFiles: string[];
	currentScreen: string;
	loadScreen: (filename: string) => void;
	createScreen: (filename: string) => void;

	setSelectedField: (uuid: string, oldUuid?: string) => void;

	renameScreen: (oldName: string, newName: string) => void;

	suppressKeyboardShortcuts: boolean;
}

interface SidebarHeadingProps {
	first?: boolean;
	collapsed: boolean;
	text: string;
}

const SidebarHeading: FC<SidebarHeadingProps> = ({
	first = false,
	collapsed,
	text,
}) => {
	return (
		<div
			style={{
				padding: "0 24px",
				marginBottom: "8px",
				marginTop: first ? undefined : "32px",
			}}
		>
			<p
				className={styles.bodyText}
				style={{ opacity: collapsed ? 0 : 0.7, letterSpacing: "0.5px" }}
			>
				{text}
			</p>
		</div>
	);
};

export const AppSidebar: FC<SidebarProps> = ({
	createNewNode,
	loadWorkspace,
	saveWorkspace,
	unsaved,
	screenFiles,
	currentScreen,
	loadScreen,
	createScreen,
	setSelectedField,
	renameScreen,
	suppressKeyboardShortcuts,
}) => {
	const [collapsed, setCollapsed] = useState(false);
	const [filenameSelected, setFilenameSelected] = useState(-2);

	const [editedFilename, setEditedFilename] = useState<string | undefined>(
		undefined
	);

	const mousePos = useRef({ x: 0, y: 0 });

	useMouseMove((ev) => {
		mousePos.current = { x: ev.clientX, y: ev.clientY };
	});

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (suppressKeyboardShortcuts) return;

			if (e.key.toLocaleLowerCase() === "e" && e.shiftKey) {
				createNewNode(mousePos.current);
			}
		};

		window.addEventListener("keydown", handleKeyDown);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [createNewNode, mousePos, suppressKeyboardShortcuts]);

	return (
		<div style={{ display: "flex", height: "100%" }}>
			<Sidebar
				collapsed={collapsed}
				style={{ borderRight: "2px solid #00254b" }} // very annoyed i have to do this btw
				className={styles.sidebarObject}
				toggled={false}
			>
				<div className={styles.sidebarContainer}>
					<div className={styles.sidebarHeader}>
						<div style={{ display: "flex", alignItems: "center" }}>
							<div className={styles.headerLogo}>O/</div>
							<p className={styles.subtitle} color="#0098e5">
								Nodedit
							</p>
						</div>
					</div>
					<div className={styles.sidebarMainSection}>
						<SidebarHeading first collapsed={collapsed} text="File" />
						<Menu
							menuItemStyles={{
								button: {
									":hover": {
										backgroundColor: "#00254b",
									},
								},
							}}
						>
							<MenuItem
								icon={<SaveIcon size={24} />}
								onClick={saveWorkspace}
								className={styles.mainMenuButton}
							>
								Save Screen (Ctrl+S)
							</MenuItem>
							<MenuItem
								icon={<LoadIcon size={28} />}
								onClick={loadWorkspace}
								className={styles.mainMenuButton}
							>
								Load Folder (Ctrl+O)
							</MenuItem>
							{screenFiles.length > 0 && (
								<SubMenu
									icon={<WindowIcon size={28} />}
									label="Screens"
									className={`${styles.submenuBox} ${styles.mainMenuButton}`}
								>
									{screenFiles.map((file, idx) => {
										let fileDisplay = file ?? "";

										if (
											filenameSelected === idx &&
											editedFilename !== undefined
										) {
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
												{collapsed ? (
													<p className={styles.filenameFieldNonEditable}>
														{fileDisplay}
													</p>
												) : (
													<input
														onClick={(e) => e.stopPropagation()}
														onFocus={(e) => {
															setSelectedField(idx + "#screenNameField");
															setFilenameSelected(idx);
														}}
														onBlur={(e) => {
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
												)}
											</MenuItem>
										);
									})}
									{!collapsed && (
										<MenuItem className={styles.submenuEntry}>
											<input
												className={styles.filenameField}
												autoFocus={true}
												onFocus={(e) => {
													setSelectedField("#newScreenField");
													setFilenameSelected(-1);
												}}
												onBlur={(e) => {
													if (
														editedFilename !== undefined &&
														editedFilename !== ""
													) {
														createScreen(editedFilename + ".json");
													}
													setSelectedField("", "#newScreenField");
													setEditedFilename(undefined);
													setFilenameSelected(-2);
												}}
												value={
													filenameSelected === -1 ? editedFilename : "" ?? ""
												}
												onChange={(e) => {
													setEditedFilename(e.target.value);
												}}
												placeholder="+ New Screen"
											/>
										</MenuItem>
									)}
								</SubMenu>
							)}
						</Menu>

						<SidebarHeading collapsed={collapsed} text="Edit" />

						<Menu>
							<MenuItem
								icon={<PlusIcon2 size={32} />}
								onClick={() => {
									createNewNode(mousePos.current);
								}}
								className={styles.mainMenuButton}
							>
								New Node (Shift+E)
							</MenuItem>
							<MenuItem>Random Button That Does Nothing</MenuItem>
						</Menu>
					</div>
					<div
						style={{
							display: "flex",
							justifyContent: "center",
							paddingBottom: "20px",
						}}
					>
						{collapsed ? (
							<button
								className={styles.sidebarFooter}
								onClick={() => setCollapsed(false)}
							>
								<p className={styles.bodyText}>&gt;&gt;</p>
							</button>
						) : (
							<button
								className={styles.sidebarFooter}
								onClick={() => setCollapsed(true)}
							>
								<p className={styles.bodyText}>&lt;&lt;</p>
							</button>
						)}
					</div>
					{collapsed ? (
						<div className={styles.legalText}>
							v0.4
							<p>EVALUATION</p>
						</div>
					) : (
						<div className={styles.legalText}>
							v0.4 (c) 2023 Rozalily
							<p>For evaluation purposes only.</p>
						</div>
					)}
				</div>
			</Sidebar>
		</div>
	);
};
