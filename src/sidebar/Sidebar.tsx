import React, { FC } from "react";
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

export interface SidebarProps {
	createNewNode: () => void;
	loadWorkspace: () => void;
	saveWorkspace: () => void;

	unsaved: boolean;

	screenFiles: string[];
	currentScreen: string;
	loadScreen: (filename: string) => void;
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

export const AppSidebar: React.FC<SidebarProps> = (props: SidebarProps) => {
	const [collapsed, setCollapsed] = React.useState(false);

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
						<Menu>
							<MenuItem
								icon={<SaveIcon size={24} />}
								onClick={props.saveWorkspace}
								className={styles.mainMenuButton}
							>
								Save Screen (Ctrl+S)
							</MenuItem>
							<MenuItem
								icon={<LoadIcon size={28} />}
								onClick={props.loadWorkspace}
								className={styles.mainMenuButton}
							>
								Load Folder (Ctrl+O)
							</MenuItem>
							{props.screenFiles.length > 0 && (
								<SubMenu
									icon={<WindowIcon size={28} />}
									label="Screens"
									className={`${styles.submenuBox} ${styles.mainMenuButton}`}
								>
									{props.screenFiles.map((file) => (
										<MenuItem
											className={styles.submenuEntry}
											key={file}
											onClick={() => props.loadScreen(file)}
										>
											{(file === props.currentScreen
												? "> " + file + (props.unsaved ? "*" : "")
												: file
											).replace(".json", "")}
										</MenuItem>
									))}
								</SubMenu>
							)}
						</Menu>

						<SidebarHeading collapsed={collapsed} text="Edit" />

						<Menu>
							<MenuItem
								icon={<PlusIcon2 size={32} />}
								onClick={props.createNewNode}
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
							v0.3a
							<p>EVALUATION</p>
						</div>
					) : (
						<div className={styles.legalText}>
							v0.3-alpha (c) 2023 Rozalily
							<p>For evaluation purposes only.</p>
						</div>
					)}
				</div>
			</Sidebar>
		</div>
	);
};
