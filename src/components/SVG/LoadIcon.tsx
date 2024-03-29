import { FC } from "react";

export interface LoadIconProps {
	className?: string;
	size: number;
}

export const LoadIcon: FC<LoadIconProps> = ({
	className = undefined,
	size = 32,
}) => {
	return (
		<svg
			fill="#ffffff"
			height={size}
			width={size}
			className={className}
			version="1.1"
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 452.149 452.149"
			stroke="#000000"
			strokeWidth={452 / size}
		>
			<g>
				<path
					d="M446.813,64.312c-4.196-4.866-10.269-7.696-16.514-7.696H90.356c-8.177,0-15.125,4.814-18.015,12h29.702
		c21.93,0,41.258,14,48.095,34.837l4.598,14.014h206.855c27.911,0,50.618,22.707,50.618,50.618V327.41l39.682-245.756
		C452.877,75.555,451.009,69.178,446.813,64.312z"
				/>
				<path
					d="M361.591,147.466H133.006l-11.373-34.66c-2.778-8.466-10.68-14.19-19.591-14.19H20.616C9.228,98.615,0,107.845,0,119.233
		c0,54.43,0,201.257,0,255.683c0,11.386,9.23,20.618,20.616,20.618h340.975c11.387,0,20.618-9.231,20.618-20.618V168.084
		C382.209,156.697,372.978,147.466,361.591,147.466z"
				/>
			</g>
		</svg>
	);
};
