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
	// some people might say "this is a lot of state for one component"
	// to which i say "yes, yes it is"
	// unfortunately most of this stuff can't be broken up any further
	// without adding a lot of complexity

	const [cameraPosition, setCameraPosition] = useState({ x: 0, y: 0 });
	const [grabbing, setGrabbing] = useState(false);
	const [draggingControl, setDraggingControl] = useState<
		NodeControl | undefined
	>(undefined);
	const [targetNode, setTargetNode] = useState<NodeHandle | undefined>(
		undefined
	);

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

	// keep track of whether the user is typing in a text field
	// so we can disable keyboard shortcuts
	const [selectedField, setSelectedField] = useState('');

	const clampBgPosition = (x: number, y: number) => {
		const { width, height } = worldSize;
		while (x < -width) x += width;
		while (x > width) x -= width;
		while (y < -height) y += height;
		while (y > height) y -= height;
		return { x, y };
	};

	// click and drag to move the background
	// we also hijack these hooks for parts of the node drag and drop feature
	useMouseMove((e) => {
		if (draggingControl !== undefined) {
			e.preventDefault();
			// determine which node our mouse is over
			const candidateNodes = screen.filter((n) => {
				// check width first since that's cheaper
				if (
					mousePos.x < n.worldPosition.x + cameraPosition.x ||
					mousePos.x > n.worldPosition.x + cameraPosition.x + n.width
				) {
					return false;
				}
				// then height
				const calculatedHeight = n.controls.reduce<number>((prev, cur) => {
					return prev + cur.renderHeight;
				}, 96);

				return (
					mousePos.y > n.worldPosition.y + cameraPosition.y &&
					mousePos.y < n.worldPosition.y + cameraPosition.y + calculatedHeight
				);
			});

			if (candidateNodes.length === 0) {
				targetNode && setTargetNode(undefined);
			} else {
				// todo: have smarter logic for determining which node the user meant
				const topNode = candidateNodes[0];
				if (targetNode !== topNode) {
					setTargetNode(topNode);
				}
			}
		} else if (grabbing) {
			e.preventDefault();
			setCameraPosition((prev) => ({
				x: prev.x + e.movementX,
				y: prev.y + e.movementY,
			}));
		}

		setMousePos({ x: e.clientX, y: e.clientY });
	});

	useMouseRelease((e) => {
		if (e.button === 0) {
			grabbing && setGrabbing(false);
			if (draggingControl !== undefined) {
				if (
					targetNode !== undefined &&
					targetNode.uuid !== draggingControl.parent
				) {
					// configure the control
					draggingControl.content = targetNode.uuid;
					updateScreen([...screen]);
				} else {
					draggingControl.content = undefined;
					updateScreen([...screen]);
				}
				setDraggingControl(undefined);
			}
		}
	});

	const pickUpControl = (node: NodeControl) => {
		setDraggingControl(node);
		grabbing && setGrabbing(false);
	};

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
		try {
			const handle = await showDirectoryPicker();
			setWorkspaceHandle(handle);
			setScreenDirectoryHandle(undefined);
			setScreenHandle(undefined);
			setScreenFileList(undefined);
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
			if (selectedField !== '') return;

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
				initializeWorkspaceDirectory().then((h) => {
					initializeScreenDirectory(h);
				});
			}
		};
		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	});

	const nodeTable = screen.reduce<{ [uuid: string]: NodeHandle }>(
		(prev, cur) => {
			prev[cur.uuid] = cur; // this is not particularly efficient but i don't care
			return prev;
		},
		{}
	);

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
					nodes={nodeTable}
					nodeConnections={screen.reduce<NodeControl[]>((prev, cur) => {
						return [...prev, ...cur.controls.filter((c) => c.type === "node")];
					}, [])}
					mousePos={mousePos}
					newTargetFrom={draggingControl}
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
								// recalculate indices
								node.controls.forEach((c, i) => {
									c.index = i;
								});
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
							deleteNode={() => {
								!unsaved && setUnsaved(true);
								updateScreen([...screen.filter((n) => n.uuid !== node.uuid)]);
							}}
							width={node.width}
							setWidth={(newWidth) => {
								node.width = newWidth;
								!unsaved && setUnsaved(true);
								updateScreen([...screen]);
							}}
							pickUpControl={pickUpControl}
							title={node.name}
							nodeTable={nodeTable}
							isSelected={
								draggingControl !== undefined &&
								targetNode?.uuid === node.uuid &&
								draggingControl.parent !== node.uuid
							}
							setSelectedField={(uuid, oldUuid) => {
								if (oldUuid !== undefined) {
									// we're done typing
									if (selectedField === oldUuid) {
										setSelectedField('');
									}
								}
								else {
									setSelectedField(uuid);
								}
							}}
						/>
					))}
				</div>
			</div>
		</>
	);
}

export default App;
