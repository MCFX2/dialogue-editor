import { FC } from "react";
import { ResizableWindow } from "../../Resize/ResizableWindow";
import styles from "./UnsavedModal.module.scss";

export interface UnsavedModalProps {
	unsavedTarget: string;
	onConfirm: () => void;
	onCancel: () => void;
}

export const UnsavedModal: FC<UnsavedModalProps> = ({
	unsavedTarget,
	onConfirm,
	onCancel,
}) => {
	return (
		<ResizableWindow
			allowHorizontalResize={false}
			allowOutOfBounds={false}
			defaultXPos={window.innerWidth / 2 - 200}
			defaultYPos={window.innerHeight / 2 - 100}
			defaultWidth={400}
			defaultHeight={300}
			titlebarChildren={<p className={styles.unsavedModalTitle}>Warning</p>}
		>
			<div className={styles.unsavedModal}>
				<p className={styles.unsavedModalText}>
					{unsavedTarget} Continue?
				</p>
				<div className={styles.unsavedModalButtons}>
					<button className={styles.unsavedModalButton} onClick={onConfirm}>
						Continue
					</button>
					<button className={styles.unsavedModalButton} onClick={onCancel}>
						Cancel
					</button>
				</div>
			</div>
		</ResizableWindow>
	);
};
