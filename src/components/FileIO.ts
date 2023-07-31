// You might think this file is ugly.
// The old way this was done was much, much uglier.
// It also used to be located entirely within the App.

import { NodeHandle } from "../App";

export interface FilesystemState {
	workspaceHandle?: FileSystemDirectoryHandle;
	screenDirectoryHandle?: FileSystemDirectoryHandle;

	currentScreenFile?: FileSystemFileHandle;
	screenFileList?: FileSystemFileHandle[];
}

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

async function loadScreenDirectory(IOState: Readonly<FilesystemState>) {
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

async function generateFileList(IOState: Readonly<FilesystemState>) {
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

export async function renameScreen(
	IOState: Readonly<FilesystemState>,
	oldName: string,
	newName: string
): Promise<FilesystemState> {
	// ensure we're not using a name that already exists
	if (IOState.screenFileList?.find((f) => f.name === newName)) {
		return IOState;
	}

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

	return newState;
}

export async function saveScreen(
	IOState: Readonly<FilesystemState>,
	screen: NodeHandle[],
	defaultFilename: string
) {
	let newState = { ...IOState };
	let neededInit = false;
	if (!newState.workspaceHandle) {
		newState = await initWorkspace(newState);
		neededInit = true;
	}

	if (!newState.screenDirectoryHandle) {
		newState = await loadScreenDirectory(newState);
		newState = await generateFileList(newState);
		neededInit = true;
	}

	if (!newState.currentScreenFile) {
		newState.currentScreenFile =
			await newState.screenDirectoryHandle!.getFileHandle(defaultFilename, {
				create: true,
			});
		
		neededInit = true;
	}

	const writer = await newState.currentScreenFile!.createWritable();
	await writer.write(JSON.stringify(screen));
	await writer.close();

	return neededInit ? newState : IOState;
}
