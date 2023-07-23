import { useEffect, useState } from "react";
import { AppSidebar } from "./sidebar/Sidebar";
import styles from "./App.module.scss";
import { useMouseMove } from "./components/MouseUtils/UseMouseMove";
import { useMouseRelease } from "./components/MouseUtils/UseMouseClick";
import { NodeWindow } from "./components/NodeWindow/NodeWindow";
import { NodeControl } from "./components/NodeWindow/NodeControl";
import * as uuid from "uuid";

interface NodeHandle {
	name: string;
	worldPosition: { x: number; y: number };
	controls: NodeControl[];
	uuid: string;
}

function App() {
	const [cameraPosition, setCameraPosition] = useState({ x: 0, y: 0 });
	const [grabbing, setGrabbing] = useState(false);
	const worldSize = { width: 2160, height: 1528 };
	const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

	const [workspaceHandle, setWorkspaceHandle] = useState<
		FileSystemDirectoryHandle | undefined
	>(undefined);

	const clampBgPosition = (x: number, y: number) => {
		const { width, height } = worldSize;
		while (x < -width) x += width;
		while (x > width) x -= width;
		while (y < -height) y += height;
		while (y > height) y -= height;
		return { x, y };
	};

	// click and drag to move the background
	useMouseMove((e) => {
		if (grabbing) {
			setCameraPosition((prev) => ({
				x: prev.x + e.movementX,
				y: prev.y + e.movementY,
			}));
		}

		setMousePos({ x: e.clientX, y: e.clientY });
	});

	useMouseRelease((e) => {
		if (grabbing && e.button === 0) {
			setGrabbing(false);
		}
	});

	const [workspace, updateWorkspace] = useState<NodeHandle[]>([]);

	const makeNode = () => {
		updateWorkspace([
			...workspace,
			{
				name: "Empty Node",
				worldPosition: {
					x: -cameraPosition.x + mousePos.x,
					y: -cameraPosition.y + mousePos.y,
				},
				controls: [],
				uuid: uuid.v4(),
			},
		]);
	};

	const saveWorkspace = (handle?: FileSystemDirectoryHandle) => {
		const usedHandle = handle ?? workspaceHandle;
		if (usedHandle) {
			usedHandle
				.getFileHandle("workspace.json", { create: true })
				.then((fileHandle) => {
					fileHandle.createWritable().then((writer) => {
						writer.write(JSON.stringify(workspace));
						writer.close();
					});
				})
				.catch((e) => {
					console.log(e);
				});
		}
	};

	const initializeWorkspaceFile = async () => {
		try {
			const handle = await showDirectoryPicker();
			setWorkspaceHandle(handle);
			return handle;
		} catch (e) {
			console.log(e);
			return undefined;
		}
	};

	const loadWorkspace = (handle?: FileSystemDirectoryHandle) => {
		const usedHandle = handle ?? workspaceHandle;
		if (usedHandle) {
			usedHandle
				.getFileHandle("workspace.json")
				.then((fileHandle) => {
					fileHandle.getFile().then((file) => {
						file.text().then((text) => {
							updateWorkspace(JSON.parse(text));
						});
					});
				})
				.catch((e) => {
					console.log(e);
				});
		}
	};

	const bgPos = clampBgPosition(cameraPosition.x, cameraPosition.y);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// keyboard shortcuts

			// make node
			if (e.shiftKey && e.key.toLowerCase() === "e") {
				makeNode();
			}

			// save
			if (e.ctrlKey && e.key.toLowerCase() === "s") {
				e.preventDefault(); // suppress browser save dialog
				// save workspace
				if (workspaceHandle) {
					saveWorkspace();
				} else {
					// initialize workspace file and save
					initializeWorkspaceFile().then((h) => {
						saveWorkspace(h);
					});
				}
			}

			// load
			if (e.ctrlKey && e.key.toLowerCase() === "o") {
				e.preventDefault(); // suppress browser open dialog
				// load workspace
				if (workspaceHandle) {
					loadWorkspace();
				} else {
					initializeWorkspaceFile().then((h) => {
						loadWorkspace(h);
					});
				}
			}
		};
		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	});

	return (
		<>
			<div className={styles.appBgContainer}>
				<div
					className={styles.wholeAppBg}
					style={{
						transform: `translate(${bgPos.x}px, ${bgPos.y}px)`,
						backgroundSize: `${worldSize.width}px ${worldSize.height}px`,
					}}
				/>
			</div>
			<div className={styles.wholeAppContainer}>
				<AppSidebar
					createNewNode={makeNode}
					loadWorkspace={() => {
						if (workspaceHandle) {
							loadWorkspace();
						} else {
							initializeWorkspaceFile().then((h) => {
								loadWorkspace(h);
							});
						}
					}}
				/>
				<div
					className={styles.mainContainer}
					onMouseDown={(e) => {
						if (e.target === e.currentTarget && e.button === 0)
							setGrabbing(true);
					}}
				>
					{workspace.map((node) => (
						<NodeWindow
							key={node.uuid}
							addControl={(control) => {
								const newControl = { ...control };
								newControl.uuid = uuid.v4();
								newControl.index = node.controls.length;
								node.controls.push(newControl);
								updateWorkspace([...workspace]);
							}}
							updateControl={(index, newControl) => {
								node.controls[index] = newControl;
								updateWorkspace([...workspace]);
							}}
							removeControl={(uuid) => {
								node.controls = node.controls.filter((c) => c.uuid !== uuid);
								updateWorkspace([...workspace]);
							}}
							setTitle={(title) => {
								node.name = title;
								updateWorkspace([...workspace]);
							}}
							controls={node.controls}
							renderPosition={{
								x: cameraPosition.x + node.worldPosition.x,
								y: cameraPosition.y + node.worldPosition.y,
							}}
							setRenderPosition={(newPos) => {
								node.worldPosition = {
									x: newPos.x - cameraPosition.x,
									y: newPos.y - cameraPosition.y,
								};

								updateWorkspace([...workspace]);
							}}
							title={node.name}
						/>
					))}
				</div>
			</div>
		</>
	);
}

export default App;
