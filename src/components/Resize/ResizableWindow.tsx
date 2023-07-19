import { useWindowSize } from "../Window/UseWindowSize";
import { useState } from "react";
import { ResizeEdgeContainer, ResizeEdgeSide } from "./ResizeEdge";
import { ResizableTitlebar } from "./ResizeTitlebar";
import styles from "./Resize.module.css";
import { ExpandCollapseButton } from "../ExpandCollapseButton/ExpandCollapseButton";

export interface ResizableWindowProps {
	minWidth?: number;
	maxWidth?: number;
	minHeight?: number;
	maxHeight?: number;
	titlebarHeight?: number;

	defaultHeight?: number;
	defaultWidth?: number;
	allowCollapse?: boolean;
	defaultCollapsed?: boolean;

	defaultXPos?: number;
	defaultYPos?: number;

	allowOutOfBounds?: boolean;

	allowVerticalResize?: boolean;
	allowHorizontalResize?: boolean;

	onMouseEnter?: () => void;
	onMouseLeave?: () => void;

	forcedOffsetX?: number;
	forcedOffsetY?: number;

	ignoreWindowResize?: boolean;

	titlebarChildren?: any;
	children?: any;
}

export const ResizableWindow = ({
	minWidth = 400,
	maxWidth = Infinity,
	minHeight = 200,
	maxHeight = Infinity,
	titlebarHeight = 32,

	onMouseEnter = () => {},
	onMouseLeave = () => {},

	defaultHeight = minHeight,
	defaultWidth = minWidth,
	allowCollapse = true,
	defaultCollapsed = false,
	defaultXPos = 0,
	defaultYPos = 0,
	allowOutOfBounds = false,
	allowHorizontalResize = true,
	allowVerticalResize = true,

	forcedOffsetX = 0,
	forcedOffsetY = 0,

	ignoreWindowResize = false,

	children,
	titlebarChildren
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
			x: clamp(defaultWidth, minWidth, window.innerWidth),
			y: defaultHeight,
		},
		collapsedSize: {
			x: clamp(defaultWidth, minCollapsedWidth, maxCollapsedWidth),
			y: titlebarHeight, // titlebar height can't change
		},
		position: {
			x: allowOutOfBounds
				? defaultXPos
				: clamp(defaultXPos, 0, window.innerWidth - defaultWidth),
			y: allowOutOfBounds
				? defaultYPos
				: clamp(defaultYPos, 0, window.innerHeight - defaultHeight),
		},
		isCollapsed: defaultCollapsed,
	});

	const requestCollapse = () => {
		if (!windowLayout.isCollapsed) {
			// by default collapse upward (preserving titlebar position)
			// however if window is at bottom edge we should collapse downward instead
			if (windowLayout.position.y + windowLayout.size.y >= viewportSize.y) {
				// technically the Y here is out of bounds, but we assume it'll be clamped
				requestWindowLayout({
					pos: { x: windowLayout.position.x, y: viewportSize.y },
					collapsed: true,
				});
			} else {
				requestWindowLayout({ collapsed: true });
			}
		} else {
			// simply re-request the current layout and we guarantee a valid position
			requestWindowLayout({ collapsed: false });
		}
	};

	const requestWindowLayout = ({
		pos = windowLayout.position,
		size = windowLayout.size,
		collapsed = windowLayout.isCollapsed,
	}) => {
		const finalSize = {
			x: clamp(size.x, minWidth, realMaxWidth),
			// don't allow vertical resizing when collapsed
			// todo: track the attempted change so we can auto-collapse/uncollapse at the right time
			y: collapsed
				? windowLayout.size.y
				: clamp(size.y, minHeight, realMaxHeight),
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

		setWindowLayout({
			position: finalPos,
			size: finalSize,
			collapsedSize: {
				x: finalSize.x,
				y: titlebarHeight,
			},
			isCollapsed: collapsed,
		});
	};

	// returns what the size would be if you'd called requestWindowLayout with the specified size
	const getValidatedSize = (size: { x: number; y: number }) => {
		return {
			x: clamp(size.x, minWidth, realMaxWidth),
			// todo: track the attempted change so we can auto-collapse/uncollapse at the right time
			y: windowLayout.isCollapsed
				? windowLayout.size.y
				: clamp(size.y, minHeight, realMaxHeight),
		};
	};

	let windowLayoutCss = {
		width: `${
			(windowLayout.isCollapsed
				? windowLayout.collapsedSize
				: windowLayout.size
			).x
		}px`,
		height: `${
			(windowLayout.isCollapsed
				? windowLayout.collapsedSize
				: windowLayout.size
			).y
		}px`,
		left: `${windowLayout.position.x + forcedOffsetX}px`,
		top: `${windowLayout.position.y + forcedOffsetY}px`,
	};

	let contentAreaCss = {
		height: windowLayout.isCollapsed
			? 0
			: `${windowLayout.size.y - titlebarHeight}px`,
	};

	return (
		<div
			className={styles.resizeWindow}
			style={windowLayoutCss}
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
		>
			{allowVerticalResize && !windowLayout.isCollapsed && (
				<ResizeEdgeContainer
					side={ResizeEdgeSide.Top}
					includeCorners
					setWindowLayout={requestWindowLayout}
					windowSize={windowLayout.size}
					windowPos={windowLayout.position}
					getValidatedSize={getValidatedSize}
				/>
			)}
			<div className={styles.resizeWindowCenter}>
				{allowHorizontalResize && (
					<ResizeEdgeContainer
						side={ResizeEdgeSide.Left}
						setWindowLayout={requestWindowLayout}
						windowSize={windowLayout.size}
						windowPos={windowLayout.position}
						getValidatedSize={getValidatedSize}
					/>
				)}
				<div className={styles.resizeWindowVisibleContainer}>
					<ResizableTitlebar
						setWindowLayout={requestWindowLayout}
						windowPos={windowLayout.position}
						height={titlebarHeight}
					>
						{titlebarChildren}
						{allowCollapse && (
							<ExpandCollapseButton
								onClick={requestCollapse}
								isCollapsed={windowLayout.isCollapsed}
							/>
						)}
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
						windowSize={windowLayout.size}
						windowPos={windowLayout.position}
						getValidatedSize={getValidatedSize}
					/>
				)}
			</div>
			{allowVerticalResize && (
				<ResizeEdgeContainer
					side={ResizeEdgeSide.Bottom}
					includeCorners
					setWindowLayout={requestWindowLayout}
					windowSize={windowLayout.size}
					windowPos={windowLayout.position}
					getValidatedSize={getValidatedSize}
				/>
			)}
		</div>
	);
};
