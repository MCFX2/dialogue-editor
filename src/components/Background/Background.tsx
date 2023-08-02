import { FC } from "react";
import styles from "./Background.module.scss";

export interface BackgroundProps {
	cameraPos: { x: number; y: number };
}

export const Background: FC<BackgroundProps> = ({ cameraPos }) => {
	const imageSize = { width: 2160, height: 1528 };

	const clampBgPosition = ({ x, y }: { x: number; y: number }) => {
		const { width, height } = imageSize;
		while (x < -width) x += width;
		while (x > width) x -= width;
		while (y < -height) y += height;
		while (y > height) y -= height;
		return { x, y };
	};

	const bgPos = clampBgPosition(cameraPos);

	return (
		<div className={styles.appBgContainer}>
			<div
				className={styles.wholeAppBg}
				style={{
					transform: `translate(${bgPos.x}px, ${bgPos.y}px)`,
					backgroundSize: `${imageSize.width}px ${imageSize.height}px`,
				}}
			/>
		</div>
	);
};
