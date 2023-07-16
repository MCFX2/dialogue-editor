import { MouseEventHandler } from "react";
import { CollapseIcon } from "../SVG/CollapseIcon";
import { ExpandIcon } from "../SVG/ExpandIcon";
import styles from "./ExpandCollapseButton.module.css";

export interface ExpandCollapseButtonProps {
  isCollapsed: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

export const ExpandCollapseButton = (props: ExpandCollapseButtonProps) => {
  const isCollapsed = props.isCollapsed;
  return (
    <button
      type="button"
      className={styles.cmbr}
      data-modal-toggle="defaultModal"
      onClick={props.onClick}
    >
      {isCollapsed
        ? <ExpandIcon className={styles.icon} />
        : <CollapseIcon className={styles.icon} />
      }
    </button>
  );
};
