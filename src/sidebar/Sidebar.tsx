import React from "react";
import {
	Menu,
	MenuItem,
	Sidebar,
	SubMenu,
	// import sidebar library to make life easier. end up having to rip out half the functionality and do it myself anyway. classic
} from "react-pro-sidebar";
import styles from "./Sidebar.module.scss";

export interface SidebarProps {
	createNewNode: () => void;
}

export const AppSidebar: React.FC<SidebarProps> = (props: SidebarProps) => {
	const [collapsed, setCollapsed] = React.useState(false);
	const [toggled, setToggled] = React.useState(false);

	return (
		<div style={{ display: "flex", height: "100%" }}>
			<Sidebar
				collapsed={collapsed}
				toggled={toggled}
				onBackdropClick={() => setToggled(false)}
				style={{ borderRight: "2px solid #00254b" }} // very annoyed i have to do this btw
				className={styles.sidebarObject}
			>
				<img
					src="/tex_bg_sb.png"
					alt="sidebar background"
					draggable={false}
					className={styles.sidebarBackground}
				/>
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
						<div style={{ padding: "0 24px", marginBottom: "8px" }}>
							<p
								className={styles.bodyText}
								style={{ opacity: collapsed ? 0 : 0.7, letterSpacing: "0.5px" }}
							>
								Category 1 (Submenus)
							</p>
						</div>
						<Menu>
							<SubMenu
								label="pinged by @everyone"
								suffix={<div className={styles.badge}>:D</div>}
							>
								<MenuItem>Option 1</MenuItem>
								<MenuItem>Option B</MenuItem>
								<MenuItem>Squirrel</MenuItem>
							</SubMenu>
							<SubMenu
								rootStyles={{ backgroundColor: "clear" }}
								className={styles.subMenuHeader}
								label="Nodes"
							>
								<MenuItem
									className={styles.subMenu1}
									onClick={props.createNewNode}
								>
									New Node (Ctrl+E)
								</MenuItem>
								<MenuItem>Find a bite to eat?</MenuItem>
							</SubMenu>
							<SubMenu label="Useless buttons">
								<MenuItem>A</MenuItem>
								<MenuItem>B</MenuItem>
							</SubMenu>
							<SubMenu label="Pointless Bbuttons">
								<MenuItem>#1</MenuItem>
								<MenuItem>#2</MenuItem>
								<SubMenu label="Submenu">
									<MenuItem>Gaming</MenuItem>
									<MenuItem>Groaning</MenuItem>
									<SubMenu label="Nested submenu">
										<MenuItem>Kiki</MenuItem>
										<MenuItem>Boba</MenuItem>
									</SubMenu>
								</SubMenu>
							</SubMenu>
						</Menu>

						<div
							style={{
								padding: "0 24px",
								marginBottom: "8px",
								marginTop: "32px",
							}}
						>
							<p
								className={styles.bodyText}
								style={{ opacity: collapsed ? 0 : 0.7, letterSpacing: "0.5px" }}
							>
								Category 2 (glorified links)
							</p>
						</div>

						<Menu>
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
							Nodedit v0.1a
							<p>EVALUATION</p>
						</div>
					) : (
						<div className={styles.legalText}>
							Nodedit v0.1-alpha (c) 2023 Rozalily
							<p>This software for evaluation purposes only.</p>
						</div>
					)}
				</div>
			</Sidebar>
		</div>
	);
};
