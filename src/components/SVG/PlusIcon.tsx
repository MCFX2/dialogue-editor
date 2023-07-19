import { FC } from "react";

export interface PlusIconProps {
	className?: string;
	size?: number;
}

export const PlusIcon1: FC<PlusIconProps> = (props: PlusIconProps) => {
	return (
		<svg
			className={props.className}
			fill="#ffffff"
			stroke="#000000"
			width={props.size}
			height={props.size}
			viewBox="0 0 56 56"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path d="M 10.7851 20.7227 C 10.7851 14.0664 14.3008 10.6211 20.9804 10.6211 L 42.0273 10.6211 L 42.0273 10.0351 C 42.0273 5.2070 39.5664 2.7695 34.6679 2.7695 L 9.6367 2.7695 C 4.7382 2.7695 2.2773 5.2070 2.2773 10.0351 L 2.2773 34.6914 C 2.2773 39.5429 4.7382 41.9570 9.6367 41.9570 L 10.7851 41.9570 Z M 21.3555 53.2305 L 46.3868 53.2305 C 51.2617 53.2305 53.7227 50.8164 53.7227 45.9883 L 53.7227 21.0742 C 53.7227 16.2461 51.2617 13.8086 46.3868 13.8086 L 21.3555 13.8086 C 16.4336 13.8086 13.9960 16.2461 13.9960 21.0742 L 13.9960 45.9883 C 13.9960 50.8164 16.4336 53.2305 21.3555 53.2305 Z M 33.9179 44.0664 C 32.8398 44.0664 31.9726 43.1992 31.9726 42.0273 L 31.9726 35.5117 L 25.3867 35.5117 C 24.3086 35.5117 23.3242 34.5742 23.3242 33.4961 C 23.3242 32.4648 24.3086 31.5039 25.3867 31.5039 L 31.9726 31.5039 L 31.9726 25.0117 C 31.9726 23.8633 32.8398 22.9961 33.9179 22.9961 C 34.9960 22.9961 35.8398 23.8633 35.8398 25.0117 L 35.8398 31.5039 L 42.2148 31.5039 C 43.4101 31.5039 44.3944 32.4180 44.3944 33.4961 C 44.3944 34.5976 43.4101 35.5117 42.2148 35.5117 L 35.8398 35.5117 L 35.8398 42.0273 C 35.8398 43.1992 34.9960 44.0664 33.9179 44.0664 Z" />
		</svg>
	);
};

export const PlusIcon2: FC<PlusIconProps> = (props: PlusIconProps) => {
	return (
		<svg
			fill="#ffffff"
			stroke="#000000"
			width={props.size}
			height={props.size}
			viewBox="0 0 56 56"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path d="M 13.7851 49.5742 L 42.2382 49.5742 C 47.1366 49.5742 49.5743 47.1367 49.5743 42.3086 L 49.5743 13.6914 C 49.5743 8.8633 47.1366 6.4258 42.2382 6.4258 L 13.7851 6.4258 C 8.9101 6.4258 6.4257 8.8398 6.4257 13.6914 L 6.4257 42.3086 C 6.4257 47.1602 8.9101 49.5742 13.7851 49.5742 Z M 27.9882 39.6367 C 26.6523 39.6367 25.9492 38.6758 25.9492 37.3164 L 25.9492 30.0274 L 18.2617 30.0274 C 16.8788 30.0274 15.9179 29.3008 15.9179 28.0118 C 15.9179 26.6758 16.8320 25.9258 18.2617 25.9258 L 25.9492 25.9258 L 25.9492 18.1680 C 25.9492 16.8086 26.6523 15.8477 27.9882 15.8477 C 29.2773 15.8477 30.0742 16.7617 30.0742 18.1680 L 30.0742 25.9258 L 37.7851 25.9258 C 39.2148 25.9258 40.1054 26.6758 40.1054 28.0118 C 40.1054 29.3008 39.1679 30.0274 37.7851 30.0274 L 30.0742 30.0274 L 30.0742 37.3164 C 30.0742 38.7227 29.2773 39.6367 27.9882 39.6367 Z" />
		</svg>
	);
};