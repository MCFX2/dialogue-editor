import { FC, useEffect, useRef } from "react";
import { NodeControl } from "../NodeWindow/NodeControl";
import { NodeHandle } from "../../App";

// all of this so i can draw a fucking line
// i love web

export interface CanvasProps {
	cameraPosition: { x: number; y: number };

	nodeConnections: NodeControl[];
	nodes: { [uuid: string]: NodeHandle };
}

export const Canvas: FC<CanvasProps> = (props: CanvasProps) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const draw = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
			if (window.innerHeight !== canvas.height) {
				canvas.height = window.innerHeight;
			}

			if (window.innerWidth !== canvas.width) {
				canvas.width = window.innerWidth;
			}

			ctx.strokeStyle = "white";
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

					const delta = { x: end.x - start.x, y: end.y - start.y };
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
				}
			}
		};

		const canvas = canvasRef.current;
		if (canvas) {
			const context = canvas.getContext("2d");
			if (context) {
				draw(canvas, context);
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
				zIndex: 100,
				pointerEvents: "none",
			}}
			ref={canvasRef}
		/>
	);
};
