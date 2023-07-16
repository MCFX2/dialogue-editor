import { AppSidebar } from "./sidebar/Sidebar";
import styles from "./App.module.scss";
import { useEffect, useState } from "react";
import { ResizableWindow } from "./components/Resize/ResizableWindow";

async function enumerateDirectories(dir: FileSystemDirectoryHandle) {
	const results = [];
	const dirs = dir.values();
	for await (const d of dirs) {
		results.push(d);
	}
	return results;
}

function App() {
	const [worldPosition, setWorldPosition] = useState({ x: 0, y: 0 });
	const [grabbing, setGrabbing] = useState(false);
	const worldSize = { width: 2160, height: 1528 };
	const [zoomLevel, setZoomLevel] = useState(1);

	const clampBgPosition = (x: number, y: number) => {
		const { width, height } = worldSize;
		while (x < -width) x += width;
		while (x > width) x -= width;
		while (y < -height) y += height;
		while (y > height) y -= height;
		return { x, y };
	};

	// click and drag to move the background
	useEffect(() => {
		const onMouseMove = (e: MouseEvent) => {
			if (grabbing) {
				setWorldPosition((prev) => ({
					x: prev.x + e.movementX,
					y: prev.y + e.movementY,
				}));
			}
		};
		window.addEventListener("mousemove", onMouseMove);
		return () => window.removeEventListener("mousemove", onMouseMove);
	}, [grabbing]);

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
				<AppSidebar />
				<main>
					<div className={styles.mainContainer}>
						<ResizableWindow allowCollapse={false} allowOutOfBounds={true} allowHorizontalResize={false} allowVerticalResize={false}>
							<p>This is a node, someday.</p>
						</ResizableWindow>
					</div>
				</main>
			</div>
		</>
	);
}

export default App;
