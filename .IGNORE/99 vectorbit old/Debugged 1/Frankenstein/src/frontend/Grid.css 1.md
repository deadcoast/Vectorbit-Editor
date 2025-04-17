css
.grid-container {
display: flex;
flex-direction: column;
align-items: center;
}

.eraser-preview {
background-color: rgba(255, 255, 255, 0.5);
border: 1px solid #ccc;
}

.toolbar select {
padding: 5px;
font-size: 14px;
border: 1px solid #ccc;
border-radius: 3px;
}

.canvas {
border: 1px solid #ccc;
cursor: crosshair;
}

.grid-cell {
box-sizing: border-box;
border: 1px solid rgba(0, 0, 0, 0.1);
}

.brush-preview {
position: absolute;
pointer-events: none;
background-color: rgba(0, 0, 0, 0.2);
}

.grid {
width: 500px;
height: 500px;
border: 1px solid #ccc;
display: grid;
grid-template-columns: repeat(auto-fit, minmax(20px, 1fr)); /*Responsive grid*/
grid-template-rows: repeat(auto-fit, minmax(20px, 1fr));
}

.grid-cell {
border: 1px solid #eee;
background-color: #f9f9f9;
position: relative;
transition: background-color 0.2s, border 0.2s;
}

.grid-cell:hover {
background-color: #ddd;
outline: 1px dashed red; /*Highlight on hover*/
}

.grid-controls {
margin-bottom: 10px;
display: flex;
gap: 10px;
}

.grid-controls button {
padding: 5px 10px;
background-color: #333;
color: white;
border: none;
cursor: pointer;
font-size: 14px;
transition: background-color 0.2s, transform 0.2s;
}

.grid-controls button:hover {
background-color: #555;
transform: scale(1.05); /*Slight scale effect on hover*/
}

.controls {
margin-bottom: 20px;
}

/*Utility Classes*/
.hidden {
display: none !important;
}

.visible {
display: flex !important;
}
