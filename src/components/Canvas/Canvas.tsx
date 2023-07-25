import { FC, useEffect, useRef } from "react";
import { NodeControl } from "../NodeWindow/NodeControl";
import { NodeHandle } from "../../App";

// all of this so i can draw a fucking line
// i love web

export interface CanvasProps {
	cameraPosition: { x: number; y: number };

	nodeConnections: NodeControl[];
	nodes: { [uuid: string]: NodeHandle };

	mousePos: { x: number; y: number };
	newTargetFrom?: NodeControl;
}

export const Canvas: FC<CanvasProps> = (props: CanvasProps) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);

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

			for (const control of props.nodeConnections) {
				if (control.type === "node" && control.content) {
					const parent = props.nodes[control.parent];

					const calculatedHeight = parent.controls.reduce<number>(
						(prev, cur) => {
							return cur.index <= control.index
								? prev + cur.renderHeight
								: prev;
						},
						20
					);

					const rawStart = parent.worldPosition;
					const start = {
						x: rawStart.x + parent.width + props.cameraPosition.x,
						y: rawStart.y + calculatedHeight + props.cameraPosition.y,
					};

					const rawEnd = props.nodes[control.content].worldPosition;

					const end = {
						x: rawEnd.x + props.cameraPosition.x,
						y: rawEnd.y + props.cameraPosition.y + 16,
					};

					drawBezier(start, end, ctx);
				}
			}

			if (props.newTargetFrom !== undefined) {
				const parent = props.nodes[props.newTargetFrom.parent];

				const calculatedHeight = parent.controls.reduce<number>(
					(prev, cur) => {
						return cur.index <= props.newTargetFrom!.index
							? prev + cur.renderHeight
							: prev;
					}, 20
				);

				const rawStart = parent.worldPosition;
				const start = {
					x: rawStart.x + parent.width + props.cameraPosition.x,
					y: rawStart.y + calculatedHeight + props.cameraPosition.y,
				};

				drawBezier(start, props.mousePos, ctx);
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
	}, [props]);

	return (
		<canvas
			style={{
				position: "fixed",
				zIndex: 2,
				pointerEvents: "none",
			}}
			ref={canvasRef}
		/>
	);
};