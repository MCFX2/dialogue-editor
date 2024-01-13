import { useEffect, useRef } from "react";
import { AppSidebar } from "./components/Sidebar/Sidebar";
import styles from "./App.module.scss";
import { useMouseMove } from "./components/MouseUtils/UseMouseMove";
import { useMouseRelease } from "./components/MouseUtils/UseMouseClick";
import {
	NodeWindow,
	recursiveCalculateHeight,
} from "./components/NodeWindow/NodeWindow";
import {
	DefaultControls,
	NodeControl,
} from "./components/NodeWindow/NodeControl";
import * as uuid from "uuid";
import { Canvas } from "./components/Canvas/Canvas";
import {
	FilesystemState,
	autosave,
	deleteScreen,
	exportScreen,
	initWorkspace,
	renameScreen,
	saveComposite,
	saveScreen,
} from "./components/FileIO";
import { Modal } from "./components/Modals/Modal";
import { Background } from "./components/Background/Background";
import { CompositeModal } from "./components/Modals/Composite/CompositeModal";
import { DefaultCompositeControl } from "./components/NodeWindow/Controls/CompositeControl";
import { UnsavedModal } from "./components/Modals/Unsaved/UnsavedModal";
import { useState } from "./components/SafeUseState";

export interface NodeHandle {
	name: string;
	worldPosition: { x: number; y: number };
	controls: NodeControl[];
	uuid: string;
	width: number;
}

export const deepCopy = (obj: any): any => {
	return JSON.parse(JSON.stringify(obj));
};

function App() {
	// some people might say "this is a lot of state for one component"
	// to which i say "yes, yes it is"
	// unfortunately most of this stuff can't be broken up any further
	// without adding a lot of complexity

	const [cameraPosition, setCameraPosition] = useState({ x: 0, y: 0 });
	const grabbing = useRef(false);
	const [draggingControl, setDraggingControl] = useState<
		NodeControl | undefined
	>(undefined);
	const [targetNode, setTargetNode] = useState<NodeHandle | undefined>(
		undefined
	);

	const [IOState, setIOState] = useState<FilesystemState>({});

	const [unsaved, setUnsaved] = useState<Readonly<boolean>>(false);
	const [lastSavedScreen, setLastSavedScreen] = useState<NodeHandle[]>([]); // so if we undo back to the last saved screen, it's no longer unsaved
	const autoUnsaved = useRef(false);

	const [currentModal, setCurrentModal] = useState<"composite" | undefined>(
		undefined
	);

	const [unsavedModal, setUnsavedModal] = useState(false);
	const unsavedModalConfirmAction = useRef<() => void>(() => {});
	const unsavedModalName = useRef("");

	const [screen, updateScreen] = useState<NodeHandle[]>([]);
	const undoStack = useRef<NodeHandle[][]>([]);
	const redoStack = useRef<NodeHandle[][]>([]);

	// keep track of whether the user is typing in a text field
	// so we can disable keyboard shortcuts
	const [selectedField, setSelectedField] = useState("");

	const timeOut = useRef<NodeJS.Timeout | undefined>(undefined);

	const applyChange = (oldScreen: NodeHandle[], newScreen: NodeHandle[]) => {
		undoStack.current.push(oldScreen);
		!unsaved && setUnsaved(true);
		autoUnsaved.current = true;
		updateScreen(newScreen);
		redoStack.current = [];
	};

	const undo = () => {
		if (undoStack.current.length > 0) {
			const last = undoStack.current.pop();
			if (last !== undefined) {
				redoStack.current.push(deepCopy(screen));
				updateScreen(last);
				if (JSON.stringify(last) === JSON.stringify(lastSavedScreen)) {
					setUnsaved(false);
				} else {
					setUnsaved(true);
				}
			}
		}
	};

	const redo = () => {
		if (redoStack.current.length > 0) {
			const last = redoStack.current.pop();
			if (last !== undefined) {
				undoStack.current.push(deepCopy(screen));
				updateScreen(last);
				if (JSON.stringify(last) === JSON.stringify(lastSavedScreen)) {
					setUnsaved(false);
				} else {
					setUnsaved(true);
				}
			}
		}
	};

	// autosave every 2 minutes
	useEffect(() => {
		timeOut.current = setInterval(async () => {
			const filename = IOState.currentScreenFile?.name ?? "untitled.json";
			if (autoUnsaved.current) {
				setIOState(await autosave(IOState, screen, filename));
				autoUnsaved.current = false;
			}
		}, 1000 * 60 * 2);
		return () => {
			if (timeOut.current !== undefined) {
				clearInterval(timeOut.current);
			}
		};
	});

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
				const calculatedHeight =
					recursiveCalculateHeight(n.controls, 9999) + 96;

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
		} else if (grabbing.current) {
			e.preventDefault();
			setCameraPosition((prev) => ({
				x: prev.x + e.movementX,
				y: prev.y + e.movementY,
			}));
		}
	});

	useMouseRelease((e) => {
		if (e.button === 0) {
			grabbing.current = false;
			if (draggingControl !== undefined) {
				const oldScreen = deepCopy(screen);
				if (
					targetNode !== undefined &&
					targetNode.uuid !== draggingControl.parent
				) {
					// configure the control
					draggingControl.content = targetNode.uuid;
					applyChange(oldScreen, screen);
				} else {
					draggingControl.content = undefined;
					applyChange(oldScreen, screen);
				}
				setDraggingControl(undefined);
			}
		}
	});

	const pickUpControl = (node: NodeControl) => {
		setDraggingControl(node);
		grabbing.current = false;
	};

	const makeNode = (screenPosition: { x: number; y: number }) => {
		const oldScreen = deepCopy(screen);
		applyChange(oldScreen, [
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
							const scr = JSON.parse(text);
							undoStack.current = [];
							redoStack.current = [];
							updateScreen(scr);
							setUnsaved(false);
							autoUnsaved.current = false;
							setLastSavedScreen(deepCopy(scr));

							setIOState((old) => {
								old.currentScreenFile = fileHandle;
								return old;
							});
							setCameraPosition({ x: 0, y: 0 });
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
			setLastSavedScreen(screen);
			autoUnsaved.current = false;
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

			if (e.ctrlKey && e.key.toLowerCase() === "z") {
				e.preventDefault();
				undo();
			}

			if (e.ctrlKey && e.key.toLowerCase() === "y") {
				e.preventDefault();
				redo();
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

	const getDraggableNodeControls: (node: NodeControl) => NodeControl[] = (
		node: NodeControl
	) => {
		if (node.type === "node") return [node];

		if (node.type === "array") {
			return (node.content as NodeControl[]).reduce<NodeControl[]>(
				(prev, cur) => {
					return [...prev, ...getDraggableNodeControls(cur)];
				},
				[]
			);
		}

		if (node.type === "composite") {
			return Object.values(
				node.content as { [key: string]: NodeControl }
			).reduce<NodeControl[]>((prev, cur) => {
				return [...prev, ...getDraggableNodeControls(cur)];
			}, []);
		}

		return [];
	};
	const getAllDraggableNodeControls = (node: NodeHandle) => {
		return node.controls.reduce<NodeControl[]>((prev, cur) => {
			if (cur.type === "array" || cur.type === "composite") {
				return [...prev, ...getDraggableNodeControls(cur)];
			} else if (cur.type === "node") {
				return [...prev, cur];
			} else {
				return prev;
			}
		}, []);
	};

	const recursiveSetParent = (node: NodeControl, parent: string) => {
		node.parent = parent;
		if (node.type === "array") {
			for (const control of node.content as NodeControl[]) {
				recursiveSetParent(control, parent);
			}
		} else if (node.type === "composite") {
			const fields = node.content as { [key: string]: NodeControl };
			for (const key of Object.keys(fields)) {
				const control = fields[key];
				recursiveSetParent(control, parent);
			}
		}
	};

	const recursiveCalculateIndices = (node: NodeControl, startIdx: number) => {
		if (node.type === "array") {
			for (const control of node.content as NodeControl[]) {
				control.index = startIdx++;
				if (control.type === "array" || control.type === "composite") {
					startIdx = recursiveCalculateIndices(control, startIdx);
				}
			}
		} else if (node.type === "composite") {
			const fields = node.content as { [key: string]: NodeControl };
			for (const control of Object.values(fields)) {
				control.index = startIdx++;
				if (control.type === "array" || control.type === "composite") {
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
			if (control.type === "array" || control.type === "composite") {
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

	const fieldRef = useRef<HTMLDivElement>(null);

	const updateSelectedField = (uuid: string, oldUuid?: string) => {
		if (oldUuid !== undefined) {
			// we're done typing
			if (selectedField === oldUuid) {
				setSelectedField("");
			}
		} else {
			setSelectedField(uuid);
		}
	};

	const controlCandidates = [
		...DefaultControls,
		...(IOState.compositeList?.map((c) => {
			return {
				...DefaultCompositeControl,
				content: c.fields,
				humanName: c.name.content,
			} as NodeControl;
		}) ?? []),
	];

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
					deleteScreen={async (file) => {
						if (unsavedModal) {
							return;
						}

						const screenWasOpen = IOState.currentScreenFile !== undefined;
						unsavedModalName.current = `Deleting ${file} cannot be undone.${
							IOState.currentScreenFile &&
							IOState.currentScreenFile?.name === file
								? " You will lose everything in the currently open screen."
								: ""
						}`;
						unsavedModalConfirmAction.current = async () => {
							const newState = await deleteScreen(IOState, file);
							if (screenWasOpen && newState.currentScreenFile === undefined) {
								updateScreen([]);
								undoStack.current = [];
								setLastSavedScreen([]);
								setUnsaved(false);
								autoUnsaved.current = false;
							}
							setIOState(newState);
						};
						setUnsavedModal(true);
					}}
					createScreen={createScreen}
					createNewNode={makeNode}
					openCompositeModal={() => {
						!currentModal && setCurrentModal("composite");
					}}
					openExportModal={() => {
						exportScreen(IOState, screen, {
							mode: "pretty",
							allowEmptyLabels: false,
							trimEmptyFields: false,
							trimEmptyNodes: true,
						});
					}}
					loadWorkspace={async () => {
						if (unsavedModal) {
							return;
						}
						if (unsaved && IOState.currentScreenFile !== undefined) {
							unsavedModalName.current =
								"Loading a new workspace will discard unsaved changes to the current workspace.";
							unsavedModalConfirmAction.current = async () => {
								try {
									setIOState(await initWorkspace(IOState));
								} catch (e) {
									console.log(e);
								}
							};
							setUnsavedModal(true);
						} else {
							try {
								setIOState(await initWorkspace(IOState));
							} catch (e) {
								console.log(e);
							}
						}
					}}
					saveWorkspace={() => {
						saveAction();
					}}
					screenFiles={IOState.screenFileList?.map((f) => f.name) ?? []}
					currentScreen={IOState.currentScreenFile?.name ?? "Untitled"}
					unsaved={unsaved}
					loadScreen={(filename) => {
						if (unsavedModal) {
							return;
						}
						if (unsaved) {
							unsavedModalName.current = `Loading '${filename}' will discard unsaved changes to '${
								IOState.currentScreenFile?.name ?? "untitled screen"
							}'.`;
							unsavedModalConfirmAction.current = () => {
								loadScreen(filename);
							};
							setUnsavedModal(true);
						} else {
							loadScreen(filename);
						}
					}}
					setSelectedField={updateSelectedField}
					renameScreen={async (oldName, newName) => {
						setIOState(await renameScreen(IOState, oldName, newName));
					}}
					suppressKeyboardShortcuts={
						currentModal !== undefined || selectedField !== ""
					}
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
							grabbing.current = true;
					}}
					onScroll={() => {
						if (fieldRef.current) {
							fieldRef.current.scrollLeft = 0;
							fieldRef.current.scrollTop = 0;
						}
					}}
					ref={fieldRef}
				>
					{screen.map(
						(node) =>
							isNodeVisible(node) && (
								<NodeWindow
									controlCandidates={controlCandidates}
									key={node.uuid}
									addControl={(control) => {
										const oldScreen = deepCopy(screen);
										const newControl = deepCopy(control);
										newControl.uuid = uuid.v4();
										recursiveSetParent(newControl, node.uuid);
										node.controls.push(newControl);
										recalculateIndices(node);
										applyChange(oldScreen, [...screen]);
									}}
									updateControl={(uuid, newControl) => {
										const oldScreen = deepCopy(screen);
										node.controls[
											node.controls.findIndex((e) => e.uuid === uuid)
										] = newControl;
										recalculateIndices(node);
										applyChange(oldScreen, [...screen]);
									}}
									removeControl={(uuid) => {
										const oldScreen = deepCopy(screen);
										node.controls = node.controls.filter(
											(c) => c.uuid !== uuid
										);
										// recalculate indices
										recalculateIndices(node);
										applyChange(oldScreen, [...screen]);
									}}
									setTitle={(title) => {
										const oldScreen = deepCopy(screen);
										node.name = title;
										applyChange(oldScreen, [...screen]);
									}}
									controls={node.controls}
									renderPosition={{
										x: cameraPosition.x + node.worldPosition.x,
										y: cameraPosition.y + node.worldPosition.y,
									}}
									setRenderPosition={(newPos) => {
										const oldScreen = deepCopy(screen);
										node.worldPosition = {
											x: newPos.x - cameraPosition.x,
											y: newPos.y - cameraPosition.y,
										};
										applyChange(oldScreen, [...screen]);
									}}
									deleteNode={() => {
										const oldScreen = deepCopy(screen);
										// break all connections to this node
										for (const field of allNodeConnections) {
											if (field.content === node.uuid) {
												field.content = undefined;
											}
										}
										applyChange(
											oldScreen,
											screen.filter((n) => n.uuid !== node.uuid)
										);
									}}
									width={node.width}
									setWidth={(newWidth) => {
										const oldScreen = deepCopy(screen);
										node.width = newWidth;
										applyChange(oldScreen, [...screen]);
									}}
									pickUpControl={pickUpControl}
									title={node.name}
									nodeTable={nodeTable}
									isSelected={
										draggingControl !== undefined &&
										targetNode?.uuid === node.uuid &&
										draggingControl.parent !== node.uuid
									}
									setSelectedField={updateSelectedField}
								/>
							)
					)}
				</div>
				{currentModal && (
					<Modal
						closeModal={() => {
							if (unsavedModal) {
								return;
							}

							unsavedModalConfirmAction.current = () => {
								setCurrentModal(undefined);
							};
							unsavedModalName.current =
								"Closing this modal will discard the composite without saving it.";
							setUnsavedModal(true);
						}}
					>
						{currentModal === "composite" ? (
							<CompositeModal
								existingComposites={IOState.compositeList ?? []}
								controlCandidates={controlCandidates}
								setSelectedField={updateSelectedField}
								saveComposite={async (c) => {
									setIOState(
										await saveComposite(IOState, c.name.content + ".json", c)
									);
									setCurrentModal(undefined);
								}}
							/>
						) : undefined}
					</Modal>
				)}
				{unsavedModal && (
					<Modal
						closeModal={() => {
							setUnsavedModal(false);
							unsavedModalConfirmAction.current = () => {};
							unsavedModalName.current = "";
						}}
					>
						<UnsavedModal
							onCancel={() => {
								setUnsavedModal(false);
								unsavedModalConfirmAction.current = () => {};
								unsavedModalName.current = "";
							}}
							onConfirm={() => {
								setUnsavedModal(false);
								unsavedModalConfirmAction.current();
								unsavedModalConfirmAction.current = () => {};
								unsavedModalName.current = "";
							}}
							unsavedTarget={unsavedModalName.current}
						/>
					</Modal>
				)}
			</div>
		</>
	);
}

export default App;
