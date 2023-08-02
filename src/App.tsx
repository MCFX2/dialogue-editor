import { useEffect, useState } from "react";
import { AppSidebar } from "./sidebar/Sidebar";
import styles from "./App.module.scss";
import { useMouseMove } from "./components/MouseUtils/UseMouseMove";
import { useMouseRelease } from "./components/MouseUtils/UseMouseClick";
import { NodeWindow, recursiveCalculateHeight } from "./components/NodeWindow/NodeWindow";
import { NodeControl } from "./components/NodeWindow/NodeControl";
import * as uuid from "uuid";
import { Canvas } from "./components/Canvas/Canvas";
import {
	FilesystemState,
	initWorkspace,
	renameScreen,
	saveScreen,
} from "./components/FileIO";
import { Modal } from "./components/Modals/Modal";
import { Background } from "./components/Background/Background";

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

	const [IOState, setIOState] = useState<FilesystemState>({});

	const [unsaved, setUnsaved] = useState(false);

	// keep track of whether the user is typing in a text field
	// so we can disable keyboard shortcuts
	const [selectedField, setSelectedField] = useState("");

	// click and drag to move the background
	// we also hijack these hooks for parts of the node drag and drop feature
	useMouseMove((e) => {
		if (draggingControl !== undefined) {
			e.preventDefault();
			const mousePos = { x: e.clientX, y: e.clientY };
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
				const calculatedHeight = recursiveCalculateHeight(n.controls, 9999) + 96;

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
					!unsaved && setUnsaved(true);
				} else {
					draggingControl.content = undefined;
					updateScreen([...screen]);
					!unsaved && setUnsaved(true);
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

	const makeNode = (screenPosition: {x: number, y: number}) => {
		!unsaved && setUnsaved(true);
		updateScreen([
			...screen,
			{
				name: "Empty Node",
				worldPosition: {
					x: -cameraPosition.x + screenPosition.x,
					y: -cameraPosition.y + screenPosition.y,
				},
				controls: [],
				uuid: uuid.v4(),
				width: 400,
			},
		]);
	};

	const createScreen = async (filename: string) => {
		if (IOState.screenFileList?.find((f) => f.name === filename)) {
			return;
		}

		setIOState(await saveScreen(IOState, [], filename, true));
	};

	const loadScreen = (filename: string) => {
		if (IOState.screenDirectoryHandle) {
			IOState.screenDirectoryHandle
				.getFileHandle(filename)
				.then((fileHandle) => {
					fileHandle.getFile().then((file) => {
						file.text().then((text) => {
							updateScreen(JSON.parse(text));
							setIOState((old) => {
								old.currentScreenFile = fileHandle;
								return old;
							});
							setCameraPosition({ x: 0, y: 0 });
							unsaved && setUnsaved(false);
						});
					});
				})
				.catch((e) => {
					console.log(e);
				});
		}
	};

	const saveAction = async () => {
		try {
			setIOState(await saveScreen(IOState, screen, "untitled.json"));
			unsaved && setUnsaved(false);
		} catch (e) {
			console.log(e);
		}
	};

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// keyboard shortcuts
			if (selectedField !== "") {
				return;
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
				initWorkspace(IOState)
					.then((newState) => {
						setIOState(newState);
					})
					.catch((e) => {
						console.log(e);
					});
			}
		};
		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	});

	// warn the user if they try to close the window with unsaved changes

	useEffect(() => {
		const handleBeforeUnload = (e: BeforeUnloadEvent) => {
			if (unsaved) {
				e.preventDefault();
				e.returnValue = "";
			}
		};
		window.addEventListener("beforeunload", handleBeforeUnload);
		return () => {
			window.removeEventListener("beforeunload", handleBeforeUnload);
		};
	});

	const nodeTable = screen.reduce<{ [uuid: string]: NodeHandle }>(
		(prev, cur) => {
			prev[cur.uuid] = cur; // this is not particularly efficient but i don't care
			return prev;
		},
		{}
	);

	const getArrayNodeControls: (node: NodeControl) => NodeControl[] = (
		node: NodeControl
	) => {
		if (node.type === "node") return [node];

		if (node.type !== "array") return [];

		return (node.content as NodeControl[]).reduce<NodeControl[]>(
			(prev, cur) => {
				return [...prev, ...getArrayNodeControls(cur)];
			},
			[]
		);
	};

	const getAllDraggableNodeControls = (node: NodeHandle) => {
		return node.controls.reduce<NodeControl[]>((prev, cur) => {
			if (cur.type === "array") {
				return [...prev, ...getArrayNodeControls(cur)];
			} else if (cur.type === "node") {
				return [...prev, cur];
			} else {
				return prev;
			}
		}, []);
	};

	const recursiveCalculateIndices = (node: NodeControl, startIdx: number) => {
		if (node.type === "array") {
			for (const control of node.content as NodeControl[]) {
				control.index = startIdx++;
				if (control.type === "array") {
					startIdx = recursiveCalculateIndices(control, startIdx);
				}
			}
		}
		return startIdx;
	};

	const recalculateIndices = (node: NodeHandle) => {
		let idx = 0;
		for (const control of node.controls) {
			control.index = idx++;
			if (control.type === "array") {
				idx = recursiveCalculateIndices(control, idx);
			}
		}
	};

	const isNodeVisible = (node: NodeHandle) => {
		const calculatedHeight = recursiveCalculateHeight(node.controls, 9999) + 96;
		return (
			node.worldPosition.x + cameraPosition.x + node.width > 0 &&
			node.worldPosition.x + cameraPosition.x < window.innerWidth &&
			node.worldPosition.y + cameraPosition.y + calculatedHeight > 0 &&
			node.worldPosition.y + cameraPosition.y < window.innerHeight
		);
	};

	const allNodeConnections = screen.reduce<NodeControl[]>((prev, cur) => {
		return [...prev, ...getAllDraggableNodeControls(cur)];
	}, []);

	return (
		<>
			<title>
				{IOState.currentScreenFile
					? IOState.currentScreenFile.name + (unsaved ? "*" : "")
					: unsaved
					? "Untitled Screen*"
					: "Nodedit"}
			</title>
			<Background cameraPos={cameraPosition} />
			<div className={styles.wholeAppContainer}>
				<AppSidebar
					createScreen={createScreen}
					createNewNode={makeNode}
					loadWorkspace={async () => {
						try {
							setIOState(await initWorkspace(IOState));
						} catch (e) {
							console.log(e);
						}
					}}
					saveWorkspace={() => {
						saveAction();
					}}
					screenFiles={IOState.screenFileList?.map((f) => f.name) ?? []}
					currentScreen={IOState.currentScreenFile?.name ?? "Untitled"}
					unsaved={unsaved}
					loadScreen={(filename) => {
						loadScreen(filename);
					}}
					setSelectedField={(uuid, oldUuid) => {
						if (oldUuid !== undefined) {
							// we're done typing
							if (selectedField === oldUuid) {
								setSelectedField("");
							}
						} else {
							setSelectedField(uuid);
						}
					}}
					renameScreen={async (oldName, newName) => {
						setIOState(await renameScreen(IOState, oldName, newName));
					}}
					suppressKeyboardShortcuts={selectedField !== ""}
				/>
				<Canvas
					cameraPosition={cameraPosition}
					nodes={nodeTable}
					nodeConnections={allNodeConnections}
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
						isNodeVisible(node) && <NodeWindow
							key={node.uuid}
							addControl={(control) => {
								const newControl = { ...control };
								newControl.uuid = uuid.v4();
								newControl.parent = node.uuid;
								node.controls.push(newControl);
								recalculateIndices(node);
								!unsaved && setUnsaved(true);
								updateScreen([...screen]);
							}}
							updateControl={(uuid, newControl) => {
								node.controls[node.controls.findIndex((e) => e.uuid === uuid)] =
									newControl;
								recalculateIndices(node);
								!unsaved && setUnsaved(true);
								updateScreen([...screen]);
							}}
							removeControl={(uuid) => {
								node.controls = node.controls.filter((c) => c.uuid !== uuid);
								// recalculate indices
								recalculateIndices(node);
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
								// break all connections to this node
								for (const field of allNodeConnections) {
									if (field.content === node.uuid) {
										field.content = undefined;
									}
								}
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
										setSelectedField("");
									}
								} else {
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
