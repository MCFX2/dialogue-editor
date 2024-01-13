import { FC } from "react";
import styles from "./Modal.module.scss";
import { SquareXIcon } from "../SVG/SquareXIcon";

export interface ModalProps {
	closeModal: () => void;
	children?: any;
}

export const Modal: FC<ModalProps> = ({
	closeModal,
	children,
}) => {
	return (
		<div className={styles.appModalContainer}>
			{children}
			<SquareXIcon className={styles.appXButton} size={64} onClick={closeModal}/>
		</div>
	);
};
