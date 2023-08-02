import { FC } from "react";
import styles from "./Modal.module.scss";

export interface ModalProps {
	onModalClose?: () => void;
	children?: any;
}

export const Modal: FC<ModalProps> = ({
	onModalClose = () => { },
	children,
}) => {
	return <div className={styles.appModalContainer}>
		{children}
	</div>;
};
