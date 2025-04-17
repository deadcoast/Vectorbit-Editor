import React from "react";
import "./Toolbar.css";

const Toolbar = ({ setActiveTool, setActiveColor }) => {
return (
    <div className="toolbar">
\<button onClick={() => setActiveTool("brush")}>Brush</button>
\<button onClick={() => setActiveTool("eraser")}>Eraser</button>
\<button onClick={() => setActiveTool("bucket")}>Bucket Fill</button>
\<button onClick={() => setActiveTool("rectangle")}>Rectangle</button>
\<button onClick={() => setActiveTool("ellipse")}>Ellipse</button>
\<button onClick={() => setActiveTool("freehand")}>Freehand</button>
\<input
type="color"
onChange={(e) => setActiveColor(e.target.value)}
title="Color Picker"
/>
    </div>
);
};

export default Toolbar;
