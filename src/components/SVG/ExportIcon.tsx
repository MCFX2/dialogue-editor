import { FC } from "react";

export interface ExportIconProps {
	size?: number;
}

export const ExportIcon: FC<ExportIconProps> = ({ size = 24 }) => {
	return (
		<svg
			fill="#ffffff"
			stroke="#000000"
			strokeWidth={490 / size}
			height={size}
			width={size}
			version="1.1"
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 493.525 493.525"
		>
			<g id="XMLID_30_">
				<path
					id="XMLID_32_"
					d="M430.557,79.556H218.44c21.622,12.688,40.255,29.729,54.859,49.906h157.258
	   c7.196,0,13.063,5.863,13.063,13.06v238.662c0,7.199-5.866,13.064-13.063,13.064H191.894c-7.198,0-13.062-5.865-13.062-13.064
	   V222.173c-6.027-3.1-12.33-5.715-18.845-7.732c-3.818,11.764-12.105,21.787-23.508,27.781c-2.39,1.252-4.987,2.014-7.554,2.844
	   v136.119c0,34.717,28.25,62.971,62.968,62.971h238.663c34.718,0,62.969-28.254,62.969-62.971V142.522
	   C493.525,107.806,465.275,79.556,430.557,79.556z"
				/>
				<path
					id="XMLID_31_"
					d="M129.037,175.989c51.419,1.234,96.388,28.283,122.25,68.865c2.371,3.705,6.434,5.848,10.657,5.848
	   c1.152,0,2.322-0.162,3.46-0.486c5.377-1.545,9.114-6.418,9.179-12.006c0-0.504,0-1.01,0-1.51
	   c0-81.148-64.853-147.023-145.527-148.957V64.155c0-5.492-3.038-10.512-7.879-13.078c-2.16-1.139-4.533-1.707-6.889-1.707
	   c-2.94,0-5.848,0.88-8.35,2.584L5.751,120.526C2.162,122.98,0.018,127.041,0,131.394c-0.017,4.338,2.113,8.418,5.687,10.902
	   l100.17,69.451c2.518,1.753,5.459,2.631,8.414,2.631c2.355,0,4.696-0.553,6.857-1.676c4.855-2.549,7.909-7.6,7.909-13.092V175.989z
	   "
				/>
			</g>
		</svg>
	);
};