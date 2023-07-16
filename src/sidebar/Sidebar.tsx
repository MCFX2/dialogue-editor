import React from "react";
import {
  Menu,
  MenuItem,
  MenuItemStyles,
  Sidebar,
  SubMenu,
  menuClasses,
} from "react-pro-sidebar";
// import { Diamond } from './icons/Diamond';
// import { BarChart } from './icons/BarChart';
// import { Global } from './icons/Global';
// import { InkBottle } from './icons/InkBottle';
// import { Book } from './icons/Book';
// import { Calendar } from './icons/Calendar';
// import { ShoppingCart } from './icons/ShoppingCart';
// import { Service } from './icons/Service';
import styles from "./Sidebar.module.scss";
import { Badge } from "./temp/badge";

const theme = {
  menu: {
    menuContent: "#082440",
    icon: "#59d0ff",
    hover: {
      backgroundColor: "#00458b",
      color: "#b6c8d9",
    },
    disabled: {
      color: "#3e5e7e",
    },
  },
};

// hex to rgba converter
const hexToRgba = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const AppSidebar: React.FC = () => {
  const [collapsed, setCollapsed] = React.useState(false);
  const [toggled, setToggled] = React.useState(false);

  const menuItemStyles: MenuItemStyles = {
    root: {
      fontSize: "13px",
      fontWeight: 400,
    },
    icon: {
      color: theme.menu.icon,
      [`&.${menuClasses.disabled}`]: {
        color: theme.menu.disabled.color,
      },
    },
    SubMenuExpandIcon: {
      color: "#b6b7b9",
    },
    subMenuContent: ({ level }: { level: number }) => ({
      backgroundColor:
        level === 0
          ? hexToRgba(theme.menu.menuContent, !collapsed ? 0.4 : 1)
          : "transparent",
    }),
    button: {
      [`&.${menuClasses.disabled}`]: {
        color: theme.menu.disabled.color,
      },
      "&:hover": {
        backgroundColor: hexToRgba(theme.menu.hover.backgroundColor, 0.8),
        color: theme.menu.hover.color,
      },
    },
    label: {
      fontWeight: 600,
    },
  };

  return (
    <div style={{ display: "flex", height: "100%" }}>
      <Sidebar
        collapsed={collapsed}
        toggled={toggled}
        onBackdropClick={() => setToggled(false)}
        image="/tex_bg_sb.png"
      >
        <div className={styles.sidebarContainer}>
          <div className={styles.sidebarHeader}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div className={styles.headerLogo}>O/</div>
              <p className={styles.subtitle} color="#0098e5">
                Nodedit
              </p>
            </div>
          </div>{" "}
          <div style={{ flex: 1, marginBottom: "32px" }}>
            <div style={{ padding: "0 24px", marginBottom: "8px" }}>
              <p
                className={styles.bodyText}
                style={{ opacity: collapsed ? 0 : 0.7, letterSpacing: "0.5px" }}
              >
                Category 1 (Submenus)
              </p>
            </div>
            <Menu menuItemStyles={menuItemStyles}>
              <SubMenu
                label="pinged by @everyone"
                suffix={
                  <Badge variant="danger" shape="circle">
                    3
                  </Badge>
                }
              >
                <MenuItem>Option 1</MenuItem>
                <MenuItem>Option B</MenuItem>
                <MenuItem>Squirrel</MenuItem>
              </SubMenu>
              <SubMenu label="Do-nothing buttons">
                <MenuItem>Activate cheat mode</MenuItem>
                <MenuItem>Find a bite to eat?</MenuItem>
              </SubMenu>
              <SubMenu label="Useless buttons">
                <MenuItem>A</MenuItem>
                <MenuItem>B</MenuItem>
              </SubMenu>
              <SubMenu label="Pointless Bbuttons">
                <MenuItem>#1</MenuItem>
                <MenuItem>#2</MenuItem>
                <SubMenu label="Submenu">
                  <MenuItem>Gaming</MenuItem>
                  <MenuItem>Groaning</MenuItem>
                  <SubMenu label="Nested submenu">
                    <MenuItem>Kiki</MenuItem>
                    <MenuItem>Boba</MenuItem>
                  </SubMenu>
                </SubMenu>
              </SubMenu>
            </Menu>

            <div
              style={{
                padding: "0 24px",
                marginBottom: "8px",
                marginTop: "32px",
              }}
            >
              <p
                className={styles.bodyText}
                style={{ opacity: collapsed ? 0 : 0.7, letterSpacing: "0.5px" }}
              >
                Category 2 (glorified links)
              </p>
            </div>

            <Menu menuItemStyles={menuItemStyles}>
              <MenuItem>Random Button That Does Nothing</MenuItem>
            </Menu>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              paddingBottom: "20px",
            }}
          >
            {collapsed ? (
              <button
                className={styles.sidebarFooter}
                onClick={() => setCollapsed(false)}
              >
                <p className={styles.bodyText}>&gt;&gt;</p>
              </button>
            ) : (
              <button
                className={styles.sidebarFooter}
                onClick={() => setCollapsed(true)}
              >
                <p className={styles.bodyText}>&lt;&lt;</p>
              </button>
            )}
          </div>
          {collapsed ? (
            <div className={styles.legalText}>
              Nodedit v0.1a
              <p>EVALUATION</p>
            </div>
          ) : (
            <div className={styles.legalText}>
                Nodedit v0.1-alpha (c) 2023 Rozalily
                <p>This software for evaluation purposes only.</p>
            </div>
          )}
        </div>
      </Sidebar>
    </div>
  );
};
