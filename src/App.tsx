import { useEffect, useState } from "react";
import { AppSidebar } from "./sidebar/Sidebar";
import styles from "./App.module.scss";
import { useMouseMove } from "./components/MouseUtils/UseMouseMove";
import { useMouseRelease } from "./components/MouseUtils/UseMouseClick";
import { NodeWindow } from "./components/NodeWindow/NodeWindow";
import { NodeControl } from "./components/NodeWindow/NodeControl";
import * as uuid from "uuid";
import { Canvas } from "./components/Canvas/Canvas";

export interface NodeHandle {
	name: string;
	worldPosition: { x: number; y: number };
	controls: NodeControl[];
	uuid: string;
	width: number;
}

function App() {
	const [cameraPosition, setCameraPosition] = useState({ x: 0, y: 0 });
	const [grabbing, setGrabbing] = useState(false);
	const worldSize = { width: 2160, height: 1528 };
	const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

	const [workspaceHandle, setWorkspaceHandle] = useState<
		FileSystemDirectoryHandle | undefined
	>(undefined);

	const [screenDirectoryHandle, setScreenDirectoryHandle] = useState<
		FileSystemDirectoryHandle | undefined
	>(undefined);

	const [screenHandle, setScreenHandle] = useState<
		FileSystemFileHandle | undefined
	>(undefined);

	const [screenFileList, setScreenFileList] = useState<
		FileSystemHandle[] | undefined
		>(undefined);
	
	const [unsaved, setUnsaved] = useState(false);

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

	const [screen, updateScreen] = useState<NodeHandle[]>([]);

	const makeNode = () => {
		!unsaved && setUnsaved(true);
		updateScreen([
			...screen,
			{
				name: "Empty Node",
				worldPosition: {
					x: -cameraPosition.x + mousePos.x,
					y: -cameraPosition.y + mousePos.y,
				},
				controls: [],
				uuid: uuid.v4(),
				width: 400,
			},
		]);
	};

	const saveScreen = (handle?: FileSystemFileHandle) => {
		const usedHandle = handle ?? screenHandle;
		if (usedHandle) {
			usedHandle.createWritable().then((writer) => {
				writer.write(JSON.stringify(screen));
				writer.close();
			});
		}
	};

	const initializeWorkspaceDirectory = async () => {
		setScreenDirectoryHandle(undefined);
		setScreenHandle(undefined);
		setScreenFileList(undefined);

		try {
			const handle = await showDirectoryPicker();
			setWorkspaceHandle(handle);
			return handle;
		} catch (e) {
			console.log(e);
			return undefined;
		}
	};

	const initializeScreenDirectory = async (
		handle?: FileSystemDirectoryHandle
	) => {
		const usedHandle = handle ?? workspaceHandle;
		if (usedHandle) {
			try {
				const handle = await usedHandle.getDirectoryHandle("screens", {
					create: true,
				});
				setScreenDirectoryHandle(handle);
				// also initialize file listing

				const files = [];
				for await (const entry of handle.values()) {
					if (entry.kind === "file") {
						files.push(entry);
					}
				}

				setScreenFileList(files);

				return handle;
			} catch (e) {
				console.log(e);
				return undefined;
			}
		}
	};

	const initializeScreenFile = async (handle?: FileSystemDirectoryHandle) => {
		const usedHandle = handle ?? screenDirectoryHandle;
		if (usedHandle) {
			try {
				// todo: show a modal to prompt for filename
				const handle = await usedHandle.getFileHandle("1.json", {
					create: true,
				});

				setScreenHandle(handle);
				return handle;
			} catch (e) {
				console.log(e);
				return undefined;
			}
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
							updateScreen(JSON.parse(text));
							unsaved && setUnsaved(false);
						});
					});
				})
				.catch((e) => {
					console.log(e);
				});
		}
	};

	const loadScreen = (filename: string) => {
		if (screenDirectoryHandle) {
			screenDirectoryHandle
				.getFileHandle(filename)
				.then((fileHandle) => {
					fileHandle.getFile().then((file) => {
						file.text().then((text) => {
							updateScreen(JSON.parse(text));
							setScreenHandle(fileHandle);
							unsaved && setUnsaved(false);
						});
					});
				})
				.catch((e) => {
					console.log(e);
				});
		}
	};

	const saveAction = () => {
		// go down the chain of "do we have a handle for this file?"
		// workspace first
		if (!workspaceHandle) {
			initializeWorkspaceDirectory().then((h) => {
				initializeScreenDirectory(h).then((h) => {
					initializeScreenFile(h).then((h) => {
						saveScreen(h);
					});
				});
			});
		} else if (!screenDirectoryHandle) {
			initializeScreenDirectory().then((h) => {
				initializeScreenFile(h).then((h) => {
					saveScreen(h);
				});
			});
		} else if (!screenHandle) {
			initializeScreenFile().then((h) => {
				saveScreen(h);
			});
		} else {
			saveScreen();
		}

		unsaved && setUnsaved(false);
	};

	const loadFolder = () => {
		initializeWorkspaceDirectory().then((h) => {
			initializeScreenDirectory(h);
		});
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
				saveAction();
			}

			// load
			if (e.ctrlKey && e.key.toLowerCase() === "o") {
				e.preventDefault(); // suppress browser open dialog
				// load workspace
				if (workspaceHandle) {
					loadWorkspace();
				} else {
					initializeWorkspaceDirectory().then((h) => {
						initializeScreenDirectory(h);
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
						loadFolder();
					}}
					saveWorkspace={() => {
						saveAction();
					}}
					screenFiles={screenFileList?.map((f) => f.name) ?? []}
					currentScreen={screenHandle?.name ?? "Untitled"}
					unsaved={unsaved}
					loadScreen={(filename) => {
						loadScreen(filename);
					}}
				/>
				<Canvas
					cameraPosition={cameraPosition}
					nodes={screen.reduce<{ [uuid: string]: NodeHandle }>(
						(prev, cur) => {
							prev[cur.uuid] = cur; // this is not particularly efficient but i don't care
							return prev;
						},
						{}
					)}
					nodeConnections={screen.reduce<NodeControl[]>((prev, cur) => {
						return [...prev, ...cur.controls.filter((c) => c.type === "node")];
					}, [])}
				/>
				<div
					className={styles.mainContainer}
					onMouseDown={(e) => {
						if (e.target === e.currentTarget && e.button === 0)
							setGrabbing(true);
					}}
				>
					{screen.map((node) => (
						<NodeWindow
							key={node.uuid}
							addControl={(control) => {
								const newControl = { ...control };
								newControl.uuid = uuid.v4();
								newControl.parent = node.uuid;
								newControl.index = node.controls.length;
								node.controls.push(newControl);
								!unsaved && setUnsaved(true);
								updateScreen([...screen]);
							}}
							updateControl={(index, newControl) => {
								node.controls[index] = newControl;
								!unsaved && setUnsaved(true);
								updateScreen([...screen]);
							}}
							removeControl={(uuid) => {
								node.controls = node.controls.filter((c) => c.uuid !== uuid);
								!unsaved && setUnsaved(true);
								updateScreen([...screen]);
							}}
							setTitle={(title) => {
								node.name = title;
								!unsaved && setUnsaved(true);
								updateScreen([...screen]);
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
								!unsaved && setUnsaved(true);
								updateScreen([...screen]);
							}}
							width={node.width}
							setWidth={(newWidth) => {
								node.width = newWidth;
								!unsaved && setUnsaved(true);
								updateScreen([...screen]);
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
