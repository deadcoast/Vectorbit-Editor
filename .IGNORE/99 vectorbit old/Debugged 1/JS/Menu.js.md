
import React from "react";
import "./Menus.css";

const Menus = ({ toggleGrid, setGridSize }) => {
    const handleMenuClick = (menu) => {
        console.log(`Menu option selected: ${menu}`);
    };

    return (
        <div className="menu-bar">
            <div className="menu">
                <span>File</span>
                <div className="dropdown">
                    <button onClick={() => handleMenuClick("New")}>New</button>
                    <button onClick={() => handleMenuClick("Open")}>Open</button>
                    <button onClick={() => handleMenuClick("Save")}>Save</button>
                    <button onClick={() => handleMenuClick("Export")}>Export</button>
                </div>
            </div>
            <div className="menu">
                <span>Settings</span>
                <div className="dropdown">
                    <button onClick={() => setGridSize(16)}>Set Grid Size: 16x16</button>
                    <button onClick={() => setGridSize(32)}>Set Grid Size: 32x32</button>
                    <button onClick={() => handleMenuClick("Default Settings")}>
                        Default Settings
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Menus;

