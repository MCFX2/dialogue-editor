import { useMouseRelease } from "../MouseUtils/UseMouseClick";
import { useMouseMove } from '../MouseUtils/UseMouseMove';
import { useState } from "react";
import styles from './Resize.module.css';

export const ResizableTitlebar = (props: any) => {

	const [startPos, setStartPos] = useState({ x: 0, y: 0 });
	const [windowStartPos, setWindowStartPos] = useState({ x: 0, y: 0 });
	const [isDragging, setIsDragging] = useState(false);

	const clickHandler = (e: React.MouseEvent) => {
		if (!isDragging) {
			setStartPos({ x: e.clientX, y: e.clientY });
			setWindowStartPos(props.windowPos);
			setIsDragging(true);
		}
	};

	const releaseHandler = () => {
		setIsDragging(false);
	}

	const moveHandler = (move: MouseEvent) => {
		if (isDragging) {
			props.setWindowLayout({
				pos: {
					x: windowStartPos.x + move.clientX - startPos.x,
					y: windowStartPos.y + move.clientY - startPos.y
				}
			});
		}
	}

	let styleOverride = {
		height: `${props.height}px`,
		minHeight: `${props.height}px`,
	};

	// we don't use the global click handler
	// because we only care about clicks on the actual titlebar
	useMouseRelease(releaseHandler);
	useMouseMove(moveHandler);

	return (<>
		<div className={styles.resizeTitlebar} onMouseDown={clickHandler} style={styleOverride}>
			{props.children}
		</div>
	</>);
}