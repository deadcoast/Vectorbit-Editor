const syncAnchors = (updatedAnchors) => {
setColorAnchors(updatedAnchors);
updateGridWithAllAnchors(updatedAnchors);
};

ws.current.onmessage = (event) => {
const { type, payload } = JSON.parse(event.data);
if (type === "anchorsUpdated") {
syncAnchors(payload);
}
};
