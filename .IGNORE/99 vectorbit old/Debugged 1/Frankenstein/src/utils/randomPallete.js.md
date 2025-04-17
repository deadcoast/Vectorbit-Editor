const getRandomColor = () => {
const randomHex = Math.floor(Math.random() * 16777215).toString(16);
return `#${randomHex.padStart(6, "0")}`;
};

const generateRandomPalette = (size = 5) => {
return Array.from({ length: size }, () => getRandomColor());
};

export default generateRandomPalette;
