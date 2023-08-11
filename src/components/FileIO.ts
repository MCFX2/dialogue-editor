// You might think this file is ugly.
// The old way this was done was much, much uglier.
// It also used to be located entirely within the App.

import { NodeHandle } from "../App";
import { Composite } from "./Modals/Composite/CompositeModal";

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
