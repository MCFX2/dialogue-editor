import { FC } from "react";

export interface SquareXIconProps {
	className?: string;
	size: number;
}

export const SquareXIcon: FC<SquareXIconProps> = ({
	className = undefined,
	size = 32,
}) => {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			className={className}
			stroke="#ffffff"
			strokeWidth={0}
			xmlns="http://www.w3.org/2000/svg"
		>
			<g clipPath="url(#clip0_429_10964)">
				<path
					d="M4 4H20V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V4Z"
					stroke="#ffffff"
					strokeWidth="2.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path
					d="M15 9L9 15"
					stroke="#ffffff"
					strokeWidth="2.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path
					d="M9 9L15 15"
					stroke="#ffffff"
					strokeWidth="2.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</g>
			<defs>
				<clipPath id="clip0_429_10964">
					<rect width="24" height="24" fill="white" />
				</clipPath>
			</defs>
		</svg>
	);
};
