css
.menu-bar {
  display: flex;
  justify-content: space-around;
  background-color: #333;
  color: white;
  padding: 10px;
}

.menu {
  position: relative;
  cursor: pointer;
}

.menu span {
  font-weight: bold;
}

.dropdown {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  background-color: white;
  color: black;
  border: 1px solid #ccc;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 10;
  padding: 10px;
  flex-direction: column;
}

.menu:hover .dropdown {
  display: flex;
}

.dropdown button {
  background: none;
  border: none;
  text-align: left;
  padding: 5px 10px;
  cursor: pointer;
  font-size: 14px;
  color: inherit;
}

.dropdown button:hover {
  background-color: #f0f0f0;
}

