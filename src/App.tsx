import React, { useState } from "react";
import { AppSidebar } from "./sidebar/Sidebar";
import styles from "./App.module.scss";
import { useMouseMove } from "./components/MouseUtils/UseMouseMove";
import { useMouseRelease } from "./components/MouseUtils/UseMouseClick";
import { NodeWindow } from "./components/NodeWindow/NodeWindow";

async function enumerateDirectories(dir: FileSystemDirectoryHandle) {
	const results = [];
	const dirs = dir.values();
	for await (const d of dirs) {
		results.push(d);
	}
	return results;
}

interface NodeHandle {
	name: string;
	worldPosition: { x: number; y: number };
}

function App() {
	const [worldPosition, setWorldPosition] = useState({ x: 0, y: 0 });
	const [grabbing, setGrabbing] = useState(false);
	const worldSize = { width: 2160, height: 1528 };
	const [zoomLevel, setZoomLevel] = useState(1);
	const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

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
			setWorldPosition((prev) => ({
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
					x: -worldPosition.x + mousePos.x,
					y: -worldPosition.y + mousePos.y,
				},
			},
		]);
	};

	const bgPos = clampBgPosition(worldPosition.x, worldPosition.y);

	return (
		<>
			<div className={styles.appBgContainer}>
				<div
					className={styles.wholeAppBg}
					style={{
						transform: `translate(${bgPos.x}px, ${bgPos.y}px)`,
						backgroundSize: `${worldSize.width * zoomLevel}px ${
							worldSize.height * zoomLevel
						}px`,
					}}
				/>
			</div>
			<div className={styles.wholeAppContainer}>
				<AppSidebar createNewNode={makeNode} />
				<div
					className={styles.mainContainer}
					onMouseDown={(e) => {
						if (e.target === e.currentTarget) setGrabbing(true);
					}}
				>
					{workspace.map((node) => (
						<NodeWindow
							worldPosition={{
								x: worldPosition.x + node.worldPosition.x,
								y: worldPosition.y + node.worldPosition.y,
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
