// utils/gridUtils.js
export const snapToGrid = (value, gridSize, canvasSize) => {
const cellSize = canvasSize / gridSize;
return Math.round(value / cellSize) * cellSize;
};

export const updateGroupPosition = (groups, groupId, position) => {
return groups.map(group =>
group.id === groupId ? { ...group, ...position } : group
);
};

export const exportCanvasToImage = (canvas, format, fileName = "export") => {
const link = document.createElement("a");
link.href = canvas.toDataURL(`image/${format}`);
link.download = `${fileName}.${format}`;
link.click();
};
