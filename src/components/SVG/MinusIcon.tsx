import { FC } from "react";

export interface MinusIconProps {
	className?: string;
	size: number;
	onClick?: (e: any) => void;
}

export const MinusIcon: FC<MinusIconProps> = ({
	className = undefined,
	size = 32,
	onClick = undefined,
}) => {
	return (
		<svg
			width={size}
			height={size}
			className={className}
			viewBox="0 0 32 32"
			version="1.1"
			xmlns="http://www.w3.org/2000/svg"
			onClick={onClick}
		>
			<g
				id="Page-1"
				stroke="#000000"
				strokeWidth="0.5"
				fill="none"
				fillRule="evenodd"
			>
				<g
					id="Icon-Set"
					transform="translate(-152.000000, -1035.000000)"
					fill="#ffffff"
				>
					<path
						d="M174,1050 L162,1050 C161.448,1050 161,1050.45 161,1051 C161,1051.55 161.448,1052 162,1052 L174,1052 C174.552,1052 175,1051.55 175,1051 C175,1050.45 174.552,1050 174,1050 L174,1050 Z M182,1063 C182,1064.1 181.104,1065 180,1065 L156,1065 C154.896,1065 154,1064.1 154,1063 L154,1039 C154,1037.9 154.896,1037 156,1037 L180,1037 C181.104,1037 182,1037.9 182,1039 L182,1063 L182,1063 Z M180,1035 L156,1035 C153.791,1035 152,1036.79 152,1039 L152,1063 C152,1065.21 153.791,1067 156,1067 L180,1067 C182.209,1067 184,1065.21 184,1063 L184,1039 C184,1036.79 182.209,1035 180,1035 L180,1035 Z"
						id="minus-square"
					></path>
				</g>
			</g>
		</svg>
	);
};
