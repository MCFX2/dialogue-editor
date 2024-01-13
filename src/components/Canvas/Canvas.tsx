import { FC, useEffect, useRef, useState } from "react";
import { NodeControl } from "../NodeWindow/NodeControl";
import { NodeHandle } from "../../App";
import { recursiveCalculateHeight } from "../NodeWindow/NodeWindow";
import { useMouseMove } from "../MouseUtils/UseMouseMove";

// all of this so i can draw a fucking line
// i love web

export interface CanvasProps {
	cameraPosition: { x: number; y: number };

	nodeConnections: NodeControl[];
	nodes: { [uuid: string]: NodeHandle };

	newTargetFrom?: NodeControl;
}

export const Canvas: FC<CanvasProps> = ({
	cameraPosition,
	nodeConnections,
	nodes,
	newTargetFrom,
}) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

	useMouseMove((ev) => {
		// avoid updating and triggering a re-render unless
		// we're actually clicking and dragging
		if (newTargetFrom !== undefined) {
			setMousePos({ x: ev.clientX, y: ev.clientY });
		}
	});

	useEffect(() => {
		const drawBezier = (
			start: { x: number; y: number },
			end: { x: number; y: number },
			ctx: CanvasRenderingContext2D
		) => {
			const delta = { x: end.x - start.x, y: end.y - start.y };
			ctx.strokeStyle = "black";
			const shadowOffset = 2;
			ctx.beginPath();
			ctx.moveTo(start.x, start.y + shadowOffset);
			ctx.bezierCurveTo(
				start.x + delta.x * 0.4,
				start.y + shadowOffset,
				start.x + delta.x * 0.6,
				end.y + shadowOffset,
				end.x,
				end.y + shadowOffset
			);
			ctx.stroke();

			ctx.strokeStyle = "white";
			ctx.beginPath();
			ctx.moveTo(start.x, start.y);
			ctx.bezierCurveTo(
				start.x + delta.x * 0.4,
				start.y,
				start.x + delta.x * 0.6,
				end.y,
				end.x,
				end.y
			);
			ctx.stroke();
		};

		const render = (
			canvas: HTMLCanvasElement,
			ctx: CanvasRenderingContext2D
		) => {
			if (window.innerHeight !== canvas.height) {
				canvas.height = window.innerHeight;
			}

			if (window.innerWidth !== canvas.width) {
				canvas.width = window.innerWidth;
			}

			ctx.lineWidth = 4;
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			
			for (const control of nodeConnections) {
				if (control.type === "node" && control.content) {
					const parent = nodes[control.parent];

					const calculatedHeight =
						20 + recursiveCalculateHeight(parent.controls, control.index);

					const rawStart = parent.worldPosition;
					const start = {
						x: rawStart.x + parent.width + cameraPosition.x,
						y: rawStart.y + calculatedHeight + cameraPosition.y,
					};

					const rawEnd = nodes[control.content].worldPosition;

					const end = {
						x: rawEnd.x + cameraPosition.x,
						y: rawEnd.y + cameraPosition.y + 16,
					};

					drawBezier(start, end, ctx);
				}
			}

			// it would save us a lot of performance if we could break this out
			// into a separate render call, however we need to be able to clear it
			// and redraw it every frame. so doing that would actually require
			// an entire second canvas, which is just more work than i feel like doing.
			if (newTargetFrom !== undefined) {
				const parent = nodes[newTargetFrom.parent];

				const calculatedHeight =
					20 + recursiveCalculateHeight(parent.controls, newTargetFrom.index);

				const rawStart = parent.worldPosition;
				const start = {
					x: rawStart.x + parent.width + cameraPosition.x,
					y: rawStart.y + calculatedHeight + cameraPosition.y,
				};

				drawBezier(start, mousePos, ctx);
			}
		};

		const canvas = canvasRef.current;
		if (canvas) {
			const context = canvas.getContext("2d");
			if (context) {
				render(canvas, context);
			} else {
				console.error("Failed to get canvas context");
			}
		} else {
			console.error("Failed to get canvas");
		}
	}, [mousePos, cameraPosition, nodeConnections, nodes, newTargetFrom]);

	return (
		<canvas
			style={{
				position: "fixed",
				pointerEvents: "none",
			}}
			ref={canvasRef}
		/>
	);
};
