css
.grid-container {
display: flex;
flex-direction: column;
align-items: center;
}

.controls {
margin-bottom: 20px;
}

.grid {
width: 500px;
height: 500px;
border: 1px solid #ccc;
display: grid;
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
}

.grid-controls button:hover {
background-color: #555;
}
