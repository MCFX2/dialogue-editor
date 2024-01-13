// You might think this file is ugly.
// The old way this was done was much, much uglier.
// It also used to be located entirely within the App.

import { NodeHandle } from "../App";
import { Composite } from "./Modals/Composite/CompositeModal";
import { NodeControl } from "./NodeWindow/NodeControl";

export interface FilesystemState {
	workspaceHandle?: FileSystemDirectoryHandle;
	screenDirectoryHandle?: FileSystemDirectoryHandle;
	compositeDirectoryHandle?: FileSystemDirectoryHandle;

	currentScreenFile?: FileSystemFileHandle;
	screenFileList?: FileSystemFileHandle[];
	compositeFileList?: FileSystemFileHandle[];
	compositeList?: Composite[];

	autosaveDirectory?: FileSystemDirectoryHandle;
}

// Initializes the workspace if it's not initialized already.
async function ensureWorkspaceInitialized(IOState: Readonly<FilesystemState>) {
	if (!IOState.workspaceHandle) {
		return await initWorkspace(IOState);
	}

	return IOState;
}

async function ensureAutosaveDirectoryInitialized(
	IOState: Readonly<FilesystemState>
) {
	let newState = await ensureScreenDirectoryInitialized(IOState);

	if (!newState.autosaveDirectory) {
		newState = await loadAutosaveDirectory(newState);
	}

	return newState;
}

// Initializes the screen directory if it's not initialized already. Initializes the workspace too if necessary.
async function ensureScreenDirectoryInitialized(
	IOState: Readonly<FilesystemState>
) {
	let newState = IOState;
	newState = await ensureWorkspaceInitialized(newState);

	if (!newState.screenDirectoryHandle) {
		newState = await loadScreenDirectory(newState);
		newState = await generateFileList(newState);
	}

	return newState;
}

async function ensureCompositeDirectoryInitialized(
	IOState: Readonly<FilesystemState>
) {
	let newState = IOState;
	newState = await ensureWorkspaceInitialized(newState);

	if (!newState.compositeDirectoryHandle) {
		newState = await loadCompositeDirectory(newState);
	}

	return newState;
}

// Moves a file by copying it and then deleting the old one.
// This is necessary because the Filesystem API doesn't broadly support moving files yet,
// and discussions on the spec have been going on for years with no end in sight.
async function moveViaHandle(
	directory: FileSystemDirectoryHandle,
	handle: FileSystemFileHandle,
	newName: string
) {
	try {
		const file = await handle.getFile();
		const text = await file.text();
		const newHandle = await directory.getFileHandle(newName, {
			create: true,
		});
		const writer = await newHandle.createWritable();

		await writer.write(text);
		await writer.close();
		// delete old file
		return directory.removeEntry(handle.name);
	} catch (e) {
		console.log(e);
	}

	return Promise.reject("Failed to move file");
}

// Loads the autosave directory. Does not initialize anything else,
// and will fail silently if the screen directory isn't initialized.
async function loadAutosaveDirectory(IOState: Readonly<FilesystemState>) {
	console.assert(
		IOState.screenDirectoryHandle,
		"Tried to load autosave directory when screen directory not initialized"
	);
	if (!IOState.screenDirectoryHandle) {
		return IOState;
	}

	const newState = { ...IOState };

	newState.autosaveDirectory =
		await IOState.screenDirectoryHandle.getDirectoryHandle("autosave", {
			create: true,
		});

	return newState;
}

// Loads the screen directory. Does not initialize anything else,
// and will fail silently if the workspace isn't initialized.
async function loadScreenDirectory(IOState: Readonly<FilesystemState>) {
	console.assert(
		IOState.workspaceHandle,
		"Tried to load screen directory when workspace handle not initialized"
	);
	if (!IOState.workspaceHandle) {
		return IOState;
	}

	const newState = { ...IOState };

	newState.screenDirectoryHandle =
		await IOState.workspaceHandle.getDirectoryHandle("screens", {
			create: true,
		});

	return newState;
}

// Loads the composite directory. Does not initialize anything else,
// and will fail silently if the workspace isn't initialized.
async function loadCompositeDirectory(IOState: Readonly<FilesystemState>) {
	console.assert(IOState.workspaceHandle, "Workspace handle not initialized");
	if (!IOState.workspaceHandle) {
		return IOState;
	}

	const newState = { ...IOState };

	newState.compositeDirectoryHandle =
		await IOState.workspaceHandle.getDirectoryHandle("composites", {
			create: true,
		});

	return newState;
}

// Loads/refreshes the screen file list. Does not initialize anything else,
// and will fail silently if the screen directory isn't initialized.
async function generateFileList(IOState: Readonly<FilesystemState>) {
	console.assert(
		IOState.screenDirectoryHandle,
		"Tried to load file list when screen directory not initialized"
	);
	if (!IOState.screenDirectoryHandle) {
		return IOState;
	}

	const files: FileSystemFileHandle[] = [];
	for await (const entry of IOState.screenDirectoryHandle.values()) {
		if (entry.kind === "file") {
			files.push(entry);
		}
	}

	const newState = { ...IOState };

	newState.screenFileList = files.sort((a, b) => a.name.localeCompare(b.name));

	return newState;
}

// Loads/refreshes the composite file list. Does not initialize anything else,
// and will fail silently if the composite directory isn't initialized.
async function generateCompositeFileList(IOState: Readonly<FilesystemState>) {
	console.assert(
		IOState.compositeDirectoryHandle,
		"Tried to load file list when composite directory not initialized"
	);

	if (!IOState.compositeDirectoryHandle) {
		return IOState;
	}

	const files: FileSystemFileHandle[] = [];
	for await (const entry of IOState.compositeDirectoryHandle.values()) {
		if (entry.kind === "file") {
			files.push(entry);
		}
	}

	const newState = { ...IOState };

	newState.compositeFileList = files.sort((a, b) =>
		a.name.localeCompare(b.name)
	);

	return newState;
}

async function generateCompositeList(IOState: Readonly<FilesystemState>) {
	console.assert(
		IOState.compositeDirectoryHandle,
		"Composite directory not initialized"
	);

	if (!IOState.compositeDirectoryHandle) {
		return IOState;
	}

	const composites: Composite[] = [];
	for await (const entry of IOState.compositeDirectoryHandle.values()) {
		if (entry.kind === "file") {
			const file = await entry.getFile();
			const text = await file.text();
			composites.push(JSON.parse(text));
		}
	}

	const newState = { ...IOState };

	newState.compositeList = composites;

	return newState;
}

// Renames a screen. Does not initialize anything else,
// and will fail silently if the screen directory isn't initialized.
// Also fails silently if the new name is already in use.
// Also fails silently if the old screen doesn't exist.
export async function renameScreen(
	IOState: Readonly<FilesystemState>,
	oldName: string,
	newName: string
): Promise<FilesystemState> {
	// ensure we're not using a name that already exists
	if (IOState.screenFileList?.find((f) => f.name === newName)) {
		return IOState;
	}

	console.assert(
		IOState.screenDirectoryHandle,
		"Tried to rename when screen directory not initialized"
	);
	if (!IOState.screenDirectoryHandle) {
		return IOState;
	}

	// we're definitely updating the IO state by this point
	const newState = { ...IOState };

	if (IOState.currentScreenFile?.name === oldName) {
		await moveViaHandle(
			IOState.screenDirectoryHandle,
			IOState.currentScreenFile,
			newName
		);

		// update current screen handle
		newState.currentScreenFile =
			await IOState.screenDirectoryHandle.getFileHandle(newName);
	} else {
		const oldHandle = await IOState.screenDirectoryHandle.getFileHandle(
			oldName
		);
		await moveViaHandle(IOState.screenDirectoryHandle, oldHandle, newName);
	}

	// refresh the screen file list and return
	return await generateFileList(newState);
}

// Initializes the workspace, and all the directories within it.
// Basically loads everything.
// If the workspace is already initialized, this will still prompt the user to select a new workspace.
export async function initWorkspace(
	IOState: Readonly<FilesystemState>
): Promise<FilesystemState> {
	let newState = { ...IOState };

	newState.workspaceHandle = await window.showDirectoryPicker();
	newState.currentScreenFile = undefined;
	newState.screenDirectoryHandle = undefined;
	newState.screenFileList = undefined;

	newState = await loadScreenDirectory(newState);
	newState = await generateFileList(newState);

	newState = await loadCompositeDirectory(newState);
	newState = await generateCompositeFileList(newState);
	newState = await generateCompositeList(newState);

	return newState;
}

// Saves a screen to a given file.
// if the user doesn't currently have a screen loaded, we'll also
// automatically create a new file and switch the user's current screen to it.
export async function saveScreen(
	IOState: Readonly<FilesystemState>,
	screen: NodeHandle[],
	defaultFilename: string,
	newFile?: boolean
) {
	let newState = await ensureScreenDirectoryInitialized(IOState);

	if (!newState.currentScreenFile) {
		newState = {
			...newState,
			currentScreenFile: await newState.screenDirectoryHandle!.getFileHandle(
				defaultFilename,
				{
					create: true,
				}
			),
		};

		newState = await generateFileList(newState);
	} else if (newFile) {
		const newHandle = await newState.screenDirectoryHandle?.getFileHandle(
			defaultFilename,
			{
				create: true,
			}
		);

		newState = await generateFileList(newState);

		const writer = await newHandle?.createWritable();
		await writer?.write(JSON.stringify(screen));
		await writer?.close();

		return newState;
	}

	const writer = await newState.currentScreenFile!.createWritable();
	await writer.write(JSON.stringify(screen));
	await writer.close();

	return newState;
}

// Deletes a screen.
// If the user has the screen loaded, we'll also de-initialize the screen file.
// Keep in mind, in this case, you'll need to delete the screen contents from the UI yourself.
// Silently fails if the screen isn't in our file list.
export async function deleteScreen(
	IOState: Readonly<FilesystemState>,
	name: string
) {
	const handle = IOState.screenFileList?.find((f) => f.name === name);
	console.assert(handle, "Tried to delete screen that doesn't exist");

	if (!handle) {
		return IOState;
	}

	let newState = { ...IOState };

	if (newState.currentScreenFile?.name === name) {
		newState.currentScreenFile = undefined;
	}

	await newState.screenDirectoryHandle?.removeEntry(name);

	return await generateFileList(newState);
}

export async function saveComposite(
	IOState: Readonly<FilesystemState>,
	name: string,
	composite: Composite
) {
	let newState = await ensureCompositeDirectoryInitialized(IOState);

	const newHandle = await newState.compositeDirectoryHandle?.getFileHandle(
		name,
		{
			create: true,
		}
	);

	if (!newHandle) {
		return newState;
	}

	const writer = await newHandle.createWritable();
	await writer.write(JSON.stringify(composite));
	await writer.close();

	newState = await generateCompositeFileList(newState);
	return await generateCompositeList(newState);
}

export async function autosave(
	IOState: Readonly<FilesystemState>,
	screen: NodeHandle[],
	screenName: string
) {
	// don't autosave if the workspace wasn't initialized
	// (this avoids prompting the user seemingly at random when they first open the app)
	if (!IOState.workspaceHandle) {
		return IOState;
	}

	let newState = await ensureAutosaveDirectoryInitialized(IOState);

	const dateFilename = Date.now().toString();

	const newHandle = await newState.autosaveDirectory?.getFileHandle(
		`${dateFilename}-${screenName}`,
		{
			create: true,
		}
	);

	if (!newHandle) {
		return newState;
	}

	const writer = await newHandle.createWritable();
	await writer.write(JSON.stringify(screen));
	await writer.close();

	return newState;
}

export async function deleteComposite(
	IOState: Readonly<FilesystemState>,
	name: string
) {
	const handle = IOState.compositeFileList?.find((f) => f.name === name);
	console.assert(handle, "Tried to delete composite that doesn't exist");

	if (!handle) {
		return IOState;
	}

	let newState = { ...IOState };

	await newState.compositeDirectoryHandle?.removeEntry(name);

	return await generateCompositeFileList(newState);
}

export interface ExportOptions {
	// compact mode minimizes the space taken up, pretty is more human-readable
	mode?: "compact" | "pretty";
	// if true, nodes with no fields will be excluded.
	// by default, nodes with no content are excluded (true).
	trimEmptyNodes?: boolean;

	// if true, fields left with default values will be excluded.
	// by default, empty fields are included with default values (false).

	// note that when this is true, we trim empty fields recursively.
	// if you have an array containing only empty fields, the array itself will be excluded.
	// this will break any assumptions you make about the structure of the exported data, but it can be significantly
	// more compact. I recommend handling this case in your json handling code rather than disabling this option,
	// but it's left disabled by default because this optimization can be surprising.
	trimEmptyFields?: boolean;
	// if true, fields that don't have labels will be included (they'll be given a label of "").
	// by default, fields without labels are excluded (false).
	allowEmptyLabels?: boolean;
}

function recursiveExportControl(node: NodeControl, options: ExportOptions) {
	if (node.type === "composite") {
		const composite: { [key: string]: any } = {};
		for (const [, value] of Object.entries(node.content)) {
			const result = recursiveExportControl(value as NodeControl, options);
			if (options.trimEmptyFields && result === undefined) {
				continue;
			} else {
				// don't check for empty labels here, it's not possible for composite fields to be missing labels
				composite[(value as NodeControl).label] = result;
			}
		}
		if (Object.keys(composite).length === 0 && options.trimEmptyFields) {
			return undefined;
		}
		return composite;
	} else if (node.type === "array") {
		const output: any[] = node.content.map((v: NodeControl) =>
			recursiveExportControl(v, options)
		);
		if (options.trimEmptyFields) {
			const filtered = output.filter((v) => v !== undefined);
			if (filtered.length === 0) {
				return undefined;
			}
			return filtered;
		}
		return output;
	} else if (node.type === "boolean") {
		if (node.content === "" || node.content === false) {
			return false;
		}
		return true;
	} else if (node.type === "number") {
		if (node.content === "") {
			return options.trimEmptyFields ? undefined : 0;
		}

		return parseFloat(node.content);
	} else {
		// node type is text-based
		if (node.content === "" && options.trimEmptyFields) {
			return undefined;
		}

		return node.content;
	}
}

// if you want to change the export behavior,
// change the options structure that gets passed here from App.tsx.
export async function exportScreen(
	IOState: Readonly<FilesystemState>,
	screen: NodeHandle[],
	options: ExportOptions = {
		mode: "pretty",
		trimEmptyNodes: true,
		trimEmptyFields: false,
		allowEmptyLabels: false,
	}
): Promise<void> {
	// prompt user for save location
	const fileHandle = await window
		.showSaveFilePicker({
			suggestedName: "screen.json",
			types: [
				{
					description: "JSON",
					accept: {
						"application/json": [".json"],
					},
				},
			],
		})
		.catch(() => {
			// user cancelled
			return undefined;
		});

	if (!fileHandle) {
		return;
	}

	const writer = await fileHandle.createWritable();
	// convert screen to the export format
	const exportScreen: { [uuid: string]: any } = {};

	for (const node of screen) {
		if (!node.controls) {
			if (!options.trimEmptyNodes) {
				exportScreen[node.uuid] = {};
			}
			continue;
		}

		const exportNode: { [uuid: string]: any } = {};

		if (options.trimEmptyNodes && node.controls.length === 0) {
			continue;
		}

		for (const control of node.controls) {
			if (!options.allowEmptyLabels && control.label === "") {
				continue;
			}

			const recursiveExport = recursiveExportControl(control, options);
			if (options.trimEmptyFields && recursiveExport === undefined) {
				continue;
			}
			exportNode[control.label] = recursiveExport;
		}

		if (Object.keys(exportNode).length === 0 && options.trimEmptyNodes) {
			continue;
		}

		exportScreen[node.uuid] = exportNode;
	}

	await writer.write(
		JSON.stringify(
			exportScreen,
			undefined,
			options.mode === "compact" ? undefined : "\t"
		)
	);
	await writer.close();
}
