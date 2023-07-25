import { useMouseRelease } from '../MouseUtils/UseMouseClick';
import { useMouseMove } from '../MouseUtils/UseMouseMove';
import React, { useState } from 'react';
import style from './Resize.module.css';

export interface ResizeEdgeContainerProps {
	side: ResizeEdgeSide;
	setWindowLayout: ({ size, pos }: {
		size?: { x: number, y: number },
		pos?: { x: number, y: number }
	}) => void;
	windowSize: { x: number, y: number };
	windowPos: { x: number, y: number };
	getValidatedSize: (size: { x: number, y: number }) => { x: number, y: number };
	includeCorners?: boolean;
}

interface ResizeEdgeProps {
	side: ResizeEdgeSide;
	setWindowLayout: ({ size, pos }: {
		size?: { x: number, y: number },
		pos?: { x: number, y: number }
	}) => void;
	windowSize: { x: number, y: number };
	windowPos: { x: number, y: number };
	getValidatedSize: (size: { x: number, y: number }) => { x: number, y: number };
}

export enum ResizeEdgeSide {
	Top,
	TopRight,
	Right,
	BottomRight,
	Bottom,
	BottomLeft,
	Left,
	TopLeft,
};

const debugMode = false; // enable to make resize grabbers highlight in red/blue

const resizerThicknessPx = 10; // arbitrary

export const ResizeEdge = (props: ResizeEdgeProps) => {

	///
	/// styling
	///
	const longSize = '100%';
	const shortSize = `${resizerThicknessPx}px`;

	let styleOverride = {
		cursor: '',
		width: shortSize,
		height: shortSize,
		backgroundColor: debugMode ? 'red' : undefined,
		marginLeft: undefined as string | undefined,
		marginRight: undefined as string | undefined,
	};

	let resizeFromTop = false;
	let resizeFromLeft = false;

	switch (props.side) {
		case ResizeEdgeSide.Top:
			styleOverride.cursor = 'n-resize';
			styleOverride.width = longSize;
			resizeFromTop = true;
			break;
		case ResizeEdgeSide.TopRight:
			styleOverride.cursor = 'ne-resize';
			styleOverride.marginRight = `-${resizerThicknessPx / 2}px`;
			resizeFromTop = true;

			if (debugMode) {
				styleOverride.backgroundColor = 'blue';
			}
			break;
		case ResizeEdgeSide.Right:
			styleOverride.cursor = 'e-resize';
			styleOverride.height = longSize;
			break;
		case ResizeEdgeSide.BottomRight:
			styleOverride.cursor = 'se-resize';
			styleOverride.marginRight = `-${resizerThicknessPx / 2}px`;

			if (debugMode) {
				styleOverride.backgroundColor = 'blue';
			}
			break;
		case ResizeEdgeSide.Bottom:
			styleOverride.cursor = 's-resize';
			styleOverride.width = longSize;
			break;
		case ResizeEdgeSide.BottomLeft:
			styleOverride.cursor = 'sw-resize';
			styleOverride.marginLeft = `-${resizerThicknessPx / 2}px`;
			resizeFromLeft = true;

			if (debugMode) {
				styleOverride.backgroundColor = 'blue';
			}
			break;
		case ResizeEdgeSide.Left:
			styleOverride.cursor = 'w-resize';
			styleOverride.height = longSize;
			resizeFromLeft = true;
			break;
		case ResizeEdgeSide.TopLeft:
			styleOverride.cursor = 'nw-resize';
			styleOverride.marginLeft = `-${resizerThicknessPx / 2}px`;
			resizeFromTop = true;
			resizeFromLeft = true;

			if (debugMode) {
				styleOverride.backgroundColor = 'blue';
			}
			break;
	}

	///
	/// functionality
	///

	let allowVerticalResizing = false;
	let allowHorizontalResizing = false;

	switch (props.side) {
		case ResizeEdgeSide.Top:
		case ResizeEdgeSide.Bottom:
			allowVerticalResizing = true;
			break;
		case ResizeEdgeSide.TopRight:
		case ResizeEdgeSide.TopLeft:
		case ResizeEdgeSide.BottomRight:
		case ResizeEdgeSide.BottomLeft:
			allowVerticalResizing = true;
			allowHorizontalResizing = true;
			break;
		// fall thru (corners allow both)
		case ResizeEdgeSide.Left:
		case ResizeEdgeSide.Right:
			allowHorizontalResizing = true;
			break;
	}

	const [startWindowPos, setStartWindowPos] = useState({ x: 0, y: 0 });
	const [startWindowSize, setStartWindowSize] = useState({ x: 0, y: 0 });
	const [startDragPos, setStartDragPos] = useState({ x: 0, y: 0 });
	const [isDragging, setIsDragging] = useState(false);

	const releaseHandler = () => {
		setIsDragging(false);
	};

	const moveHandler = (e: MouseEvent) => {
		if (isDragging) {
			e.preventDefault();
			const moveDelta = {
				x: allowHorizontalResizing ? (Math.max(e.clientX, 0) - startDragPos.x) : 0,
				y: allowVerticalResizing ? (Math.max(e.clientY, 0) - startDragPos.y) : 0
			};

			const adjustedSize = {
				x: startWindowSize.x + (resizeFromLeft ? -1 : 1) * moveDelta.x,
				y: startWindowSize.y + (resizeFromTop ? -1 : 1) * moveDelta.y
			};

			// reposition window if we're resizing toward top-left
			if (resizeFromLeft || resizeFromTop) {

				// get actual change in window size
				const candidateSize = props.getValidatedSize(adjustedSize);

				const windowSizeDelta = {
					x: candidateSize.x - startWindowSize.x,
					y: candidateSize.y - startWindowSize.y,
				};

				const adjustedPos = {
					x: resizeFromLeft ? startWindowPos.x - windowSizeDelta.x : props.windowPos.x,
					y: resizeFromTop ? startWindowPos.y - windowSizeDelta.y : props.windowPos.y
				};

				props.setWindowLayout({
					size: adjustedSize,
					pos: adjustedPos
				});
			}
			else {
				props.setWindowLayout({
					size: adjustedSize
				});
			}
		}
	};

	const clickHandler = (e: React.MouseEvent) => {
		setStartDragPos({ x: e.clientX, y: e.clientY });
		setStartWindowPos(props.windowPos);
		setStartWindowSize(props.windowSize);
		setIsDragging(true);
	};

	if (debugMode && isDragging) {
		styleOverride.backgroundColor = 'pink';
	}

	useMouseRelease(releaseHandler);
	useMouseMove(moveHandler);

	return <div className={style.resizeEdge} style={styleOverride} onMouseDown={clickHandler} />;
};

export const ResizeEdgeContainer = (props: ResizeEdgeContainerProps) => {
	let styleOverride: React.CSSProperties = {
		flexDirection: undefined, // defaults to row
		height: undefined,
		width: undefined,
		marginTop: undefined,
		marginRight: undefined,
		marginBottom: undefined,
		marginLeft: undefined,
		// top and left edges already have correct defaults for alignment
		right: undefined,
		bottom: undefined,

		transform: undefined,
	}

	let firstElement: ResizeEdgeSide;
	let secondElement: ResizeEdgeSide;
	let thirdElement: ResizeEdgeSide;

	switch (props.side) {
		case ResizeEdgeSide.Top:
			firstElement = ResizeEdgeSide.TopLeft;
			secondElement = ResizeEdgeSide.Top;
			thirdElement = ResizeEdgeSide.TopRight;

			styleOverride.flexDirection = 'row';
			styleOverride.width = 'inherit';

			// margins are half of thickness
			// this way, the grabbable resize area is centered on the actual window edge
			// also, an advantage to doing it this way (as opposed to growing the window):
			// the resizers no longer count as part of the window size
			// this is needed to let you drag them off screen, and will be handy later if we implement snapping
			styleOverride.marginTop = `-${resizerThicknessPx / 2}px`;
			break;
		case ResizeEdgeSide.Right:
			firstElement = ResizeEdgeSide.TopRight;
			secondElement = ResizeEdgeSide.Right;
			thirdElement = ResizeEdgeSide.BottomRight;

			styleOverride.flexDirection = 'column';
			styleOverride.height = 'inherit';
			styleOverride.right = 0;
			styleOverride.marginRight = `-${resizerThicknessPx / 2}px`;
			styleOverride.transform = `translateY(${resizerThicknessPx / 2}px)`;
			break;
		case ResizeEdgeSide.Bottom:
			firstElement = ResizeEdgeSide.BottomLeft;
			secondElement = ResizeEdgeSide.Bottom;
			thirdElement = ResizeEdgeSide.BottomRight;

			styleOverride.flexDirection = 'row';
			styleOverride.width = 'inherit';
			styleOverride.bottom = 0;
			styleOverride.marginBottom = `-${resizerThicknessPx / 2}px`;
			break;
		case ResizeEdgeSide.Left:
			firstElement = ResizeEdgeSide.TopLeft;
			secondElement = ResizeEdgeSide.Left;
			thirdElement = ResizeEdgeSide.BottomLeft;

			styleOverride.flexDirection = 'column';
			styleOverride.height = 'inherit';
			styleOverride.marginLeft = `-${resizerThicknessPx / 2}px`;
			styleOverride.transform = `translateY(${resizerThicknessPx / 2}px)`;
			break;
		default:
			console.log('WARNING: ResizeEdgeContainer can only handle top/left/bottom/right sides!');
			return <></>;
	}

	return <div className={style.resizeEdgeContainer} style={styleOverride}>
		{props.includeCorners &&
			<ResizeEdge
				side={firstElement}
				setWindowLayout={props.setWindowLayout}
				windowSize={props.windowSize}
				windowPos={props.windowPos}
				getValidatedSize={props.getValidatedSize}
			/>}
		<ResizeEdge
			side={secondElement}
			setWindowLayout={props.setWindowLayout}
			windowSize={props.windowSize}
			windowPos={props.windowPos}
			getValidatedSize={props.getValidatedSize}
		/>
		{props.includeCorners &&
			<ResizeEdge
				side={thirdElement}
				setWindowLayout={props.setWindowLayout}
				windowSize={props.windowSize}
				windowPos={props.windowPos}
				getValidatedSize={props.getValidatedSize}
			/>}
	</div>;
}