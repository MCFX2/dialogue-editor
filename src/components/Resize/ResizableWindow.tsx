import { useWindowSize } from "../Window/UseWindowSize";
import { useState } from "react";
import { ResizeEdgeContainer, ResizeEdgeSide } from "./ResizeEdge";
import { ResizableTitlebar } from "./ResizeTitlebar";
import styles from "./Resize.module.css";

// you might be wondering why this is so complicated
// me too

export interface ResizableWindowProps {
	minWidth?: number;
	maxWidth?: number;
	minHeight?: number;
	maxHeight?: number;
	titlebarHeight?: number;

	defaultHeight?: number;
	defaultWidth?: number;
	defaultCollapsed?: boolean;

	defaultXPos?: number;
	defaultYPos?: number;

	allowOutOfBounds?: boolean;

	allowVerticalResize?: boolean;
	allowHorizontalResize?: boolean;

	onMouseEnter?: () => void;
	onMouseLeave?: () => void;
	onSizeChange?: (newSize: { x: number; y: number }) => void;
	onWindowMoved?: (newPos: { x: number; y: number }) => void;

	forcedPositionX?: number;
	forcedPositionY?: number;

	ignoreWindowResize?: boolean;

	forcedHeight?: number;
	forcedWidth?: number;

	showHighlight?: boolean;

	titlebarChildren?: any;
	children?: any;
}

// for real though, this started as a fairly simple/naive (but clean) implementation of a window
// and as time has passed, we've needed more and more external control and extra features
// built into this poor little component
// at this point it's a shambling mound of extra hacks and features that are all very specific to our use case
// and it's probably not worth ever trying to use this for anything else

export const ResizableWindow = ({
	minWidth = 400,
	maxWidth = Infinity,
	minHeight = 200,
	maxHeight = Infinity,
	titlebarHeight = 32,

	onMouseEnter = () => {},
	onMouseLeave = () => {},
	onSizeChange = () => {},
	onWindowMoved = () => {},

	defaultHeight = minHeight,
	defaultWidth = minWidth,
	defaultCollapsed = false,
	defaultXPos = 0,
	defaultYPos = 0,
	allowOutOfBounds = false,
	allowHorizontalResize = true,

	forcedPositionX = undefined,
	forcedPositionY = undefined,

	forcedHeight,
	forcedWidth,

	showHighlight,

	ignoreWindowResize = false,

	children,
	titlebarChildren,
}: ResizableWindowProps) => {
	const minCollapsedWidth = minWidth;
	const maxCollapsedWidth = maxWidth;

	// the lesser of the two constraints
	const realMaxWidth = allowOutOfBounds
		? maxWidth
		: maxWidth > window.innerWidth
		? window.innerWidth
		: maxWidth;
	const realMaxHeight = allowOutOfBounds
		? maxHeight
		: maxHeight > window.innerHeight
		? window.innerHeight
		: maxHeight;

	// todo: load layout/size preference from config or something

	const [viewportSize, setViewportSize] = useState({
		x: window.innerWidth,
		y: window.innerHeight,
	});

	const onViewportSizeChange = () => {
		!ignoreWindowResize &&
			requestWindowLayout({
				pos: {
					x: windowLayout.position.x * (window.innerWidth / viewportSize.x),
					y: windowLayout.position.y * (window.innerHeight / viewportSize.y),
				},
			});

		setViewportSize({ x: window.innerWidth, y: window.innerHeight });
	};

	const clamp = (input: number, min: number, max: number) => {
		return Math.min(Math.max(input, min), max);
	};

	useWindowSize(onViewportSizeChange);

	// we use one combined state for this to avoid triggering multiple re-renders when several of these are changed at once
	const [windowLayout, setWindowLayout] = useState({
		size: {
			x:
				forcedWidth === undefined
					? clamp(defaultWidth, minWidth, window.innerWidth)
					: forcedWidth,
			y: forcedHeight === undefined ? defaultHeight : forcedHeight,
		},
		collapsedSize: {
			x: clamp(defaultWidth, minCollapsedWidth, maxCollapsedWidth),
			y: titlebarHeight, // titlebar height can't change
		},
		position: {
			x:
				forcedPositionX ??
				(allowOutOfBounds
					? defaultXPos
					: clamp(defaultXPos, 0, window.innerWidth - defaultWidth)),
			y:
				forcedPositionY ??
				(allowOutOfBounds
					? defaultYPos
					: clamp(defaultYPos, 0, window.innerHeight - defaultHeight)),
		},
		isCollapsed: defaultCollapsed,
	});

	const requestWindowLayout = ({
		pos = windowLayout.position,
		size = windowLayout.size,
		collapsed = windowLayout.isCollapsed,
	}) => {
		const finalSize = {
			x: clamp(size.x, minWidth, realMaxWidth),
			// don't allow vertical resizing when collapsed
			// todo: track the attempted change so we can auto-collapse/uncollapse at the right time
			y:
				forcedHeight === undefined // the reason this has to be here is because,
					? collapsed // during a reload event, all our properties get reset BUT
						? windowLayout.size.y // we don't actually know that happened from here
						: clamp(size.y, minHeight, realMaxHeight) // so we have a mismatch between
					: forcedHeight, // the "outside world" (props) and our home (state).
			// yay
		};

		const finalPos = {
			x: allowOutOfBounds
				? pos.x
				: clamp(pos.x, 0, window.innerWidth - finalSize.x),
			y: allowOutOfBounds
				? pos.y
				: clamp(
						pos.y,
						0,
						window.innerHeight - (collapsed ? titlebarHeight : finalSize.y)
				  ),
		};

		const posChanged =
			finalPos.x !== windowLayout.position.x ||
			finalPos.y !== windowLayout.position.y;

		const sizeChanged =
			finalSize.x !== windowLayout.size.x ||
			finalSize.y !== windowLayout.size.y;

		setWindowLayout({
			position: {
				x: forcedPositionX ?? finalPos.x,
				y: forcedPositionY ?? finalPos.y,
			},
			size: finalSize,
			collapsedSize: {
				x: finalSize.x,
				y: titlebarHeight,
			},
			isCollapsed: collapsed,
		});

		if (sizeChanged) {
			onSizeChange(finalSize);
		}

		if (posChanged) {
			onWindowMoved(finalPos);
		}
	};

	// returns what the size would be if you'd called requestWindowLayout with the specified size
	const getValidatedSize = (size: { x: number; y: number }) => {
		return {
			x: clamp(size.x, minWidth, realMaxWidth),
			// todo: track the attempted change so we can auto-collapse/uncollapse at the right time
			y:
				forcedHeight === undefined
					? windowLayout.isCollapsed
						? windowLayout.size.y
						: clamp(size.y, minHeight, realMaxHeight)
					: forcedHeight,
		};
	};

	let windowLayoutCss = {
		width: `${
			forcedWidth === undefined
				? (windowLayout.isCollapsed
						? windowLayout.collapsedSize
						: windowLayout.size
				  ).x
				: forcedWidth
		}px`,
		height: `${
			forcedHeight === undefined
				? (windowLayout.isCollapsed
						? windowLayout.collapsedSize
						: windowLayout.size
				  ).y
				: forcedHeight
		}px`,
		left: `${forcedPositionX ?? windowLayout.position.x}px`,
		top: `${forcedPositionY ?? windowLayout.position.y}px`,
	};

	let contentAreaCss: React.CSSProperties = {
		height: windowLayout.isCollapsed
			? 0
			: `${
					(forcedHeight === undefined ? windowLayout.size.y : forcedHeight) -
					titlebarHeight
			  }px`,

		boxShadow: showHighlight ? "0px 0px 0px 1px yellow" : undefined,
	};

	return (
		<div
			className={styles.resizeWindow}
			style={windowLayoutCss}
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
		>
			<div className={styles.resizeWindowCenter}>
				{allowHorizontalResize && (
					<ResizeEdgeContainer
						side={ResizeEdgeSide.Left}
						setWindowLayout={requestWindowLayout}
						windowSize={{
							x: forcedWidth ?? windowLayout.size.x,
							y: forcedHeight ?? windowLayout.size.y,
						}}
						windowPos={{
							x: forcedPositionX ?? windowLayout.position.x,
							y: forcedPositionY ?? windowLayout.position.y,
						}}
						getValidatedSize={getValidatedSize}
					/>
				)}
				<div className={styles.resizeWindowVisibleContainer}>
					<ResizableTitlebar
						setWindowLayout={requestWindowLayout}
						windowPos={{
							x: forcedPositionX ?? windowLayout.position.x,
							y: forcedPositionY ?? windowLayout.position.y,
						}}
						height={titlebarHeight}
						showHighlight={showHighlight}
					>
						{titlebarChildren}
					</ResizableTitlebar>
					{!windowLayout.isCollapsed && (
						<div
							className={styles.resizeWindowContentContainer}
							style={contentAreaCss}
						>
							{children}
						</div>
					)}
				</div>
				{allowHorizontalResize && (
					<ResizeEdgeContainer
						side={ResizeEdgeSide.Right}
						setWindowLayout={requestWindowLayout}
						windowSize={{
							x: forcedWidth ?? windowLayout.size.x,
							y: forcedHeight ?? windowLayout.size.y,
						}}
						windowPos={{
							x: forcedPositionX ?? windowLayout.position.x,
							y: forcedPositionY ?? windowLayout.position.y,
						}}
						getValidatedSize={getValidatedSize}
					/>
				)}
			</div>
		</div>
	);
};
