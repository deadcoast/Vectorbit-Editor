css
.layer-list {
  margin: 20px 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.layer-list div {
  padding: 5px;
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  cursor: move;
  transition: background-color 0.2s, transform 0.2s;
}

.layer-list div:hover {
  background-color: #eee;
  transform: scale(1.02); /* Slight scale effect on hover */
}

.snap-preview {
  border: 2px dashed rgba(0, 0, 255, 0.5);
}

.group-controls {
  margin: 20px 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.group-controls span {
  margin-left: 10px;
  font-size: 14px;
}

.group-controls input[type="range"] {
  margin-left: 10px;
  width: 100px;
}

.grid-group {
  position: absolute;
  cursor: grab;
  transition: transform 0.2s;
}

.grid-group:active {
  cursor: grabbing;
}

.history-controls {
  margin: 10px 0;
  display: flex;
  gap: 10px;
}

.history-controls button {
  padding: 5px 10px;
  background-color: #333;
  color: white;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.history-controls button:disabled {
  background-color: #555;
  cursor: not-allowed;
}

.grid-controls {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Utility Classes */
.button {
  padding: 5px 10px;
  background-color: #333;
  color: white;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.2s;
}

.button:hover {
  background-color: #555;
  transform: scale(1.05); /* Slight scale effect */
}

.button:disabled {
  background-color: #555;
  cursor: not-allowed;
}
