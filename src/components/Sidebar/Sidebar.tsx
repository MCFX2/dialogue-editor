import React, { FC, useEffect, useRef, useState } from "react";
import {
	Menu,
	MenuItem,
	Sidebar,
	// import sidebar library to make life easier. end up having to rip out half the functionality and do it myself anyway. classic
} from "react-pro-sidebar";
import styles from "./Sidebar.module.scss";
import { PlusIcon1, PlusIcon2 } from "../SVG/PlusIcon";
import { SaveIcon } from "../SVG/SaveIcon";
import { LoadIcon } from "../SVG/LoadIcon";
import { useMouseMove } from "../MouseUtils/UseMouseMove";
import { ScreensMenu } from "./ScreensMenu";

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

	openCompositeModal: () => void;
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
	openCompositeModal,
}) => {
	const [collapsed, setCollapsed] = useState(false);

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
							<p className={styles.subtitle}>Nodedit</p>
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
								Load Workspace (Ctrl+O)
							</MenuItem>
							<ScreensMenu
								collapsed={collapsed}
								createScreen={createScreen}
								currentScreen={currentScreen}
								loadScreen={loadScreen}
								renameScreen={renameScreen}
								screenFiles={screenFiles}
								setSelectedField={setSelectedField}
								unsaved={unsaved}
							/>
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
							<MenuItem
								icon={<PlusIcon1 size={32} />}
								onClick={openCompositeModal}
								className={styles.mainMenuButton}
							>
								New Composite
							</MenuItem>
						</Menu>
					</div>
					<div
						style={{
							display: "flex",
							justifyContent: "center",
							paddingBottom: "20px",
						}}
					>
						<button
							className={styles.sidebarFooter}
							onClick={() => setCollapsed(!collapsed)}
						>
							<p className={styles.bodyText}>{collapsed ? ">>" : "<<"}</p>
						</button>
					</div>
					<div className={styles.legalText}>
						{"v0.5-beta" + (collapsed ? "" : " (c) 2023 Rozalily")}
						<p>{collapsed ? "EVALUATION" : "For evaluation purposes only."}</p>
					</div>
				</div>
			</Sidebar>
		</div>
	);
};
