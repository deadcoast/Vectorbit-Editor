
## 1. Initialize the Repository

 1. Create the project directory:

bash
mkdir Vectorbit
cd Vectorbit


2. Initialize a Git repository:
bash
git init


## 2. Set Up Frontend (React + Webpack)

1. Initialize package.json:

bash
npm init -y


2. Install Frontend Dependencies:

bash
npm install react react-dom iro.js

npm install --save-dev webpack webpack-cli babel-loader @babel/core @babel/preset-react html-webpack-plugin


3. Create Frontend Files:
    - src/frontend/index.js: Entry point for the React app.
    -  src/frontend/App.js: Main React component.
    - public/index.html: HTML template.

#### src/frontend/index.js

import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

ReactDOM.render(<App />, document.getElementById("root"));


#### src/frontend/App.js

import React from "react";

const App = () => {
    return (
        <div>
            <h1>Vectorbit</h1>
            <p>Welcome to the pixel art editor!</p>
        </div>
    );
};

export default App;


#### public/index.html
html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vectorbit</title>
</head>
<body>
    <div id="root"></div>
</body>
</html>


4. Create webpack.config.js:

const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    entry: "./src/frontend/index.js",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "bundle.js",
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                },
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "./public/index.html",
        }),
    ],
    devServer: {
        static: path.resolve(__dirname, "dist"),
        port: 3000,
    },
};


5. Add Babel Configuration:

#### Create a .babelrc file:

{
    "presets": ["@babel/preset-react"]
}

  
6. Run the App:

#### Start the development server:
bash
npm start



3. Set Up Backend (Flask)

1. Create a Python Virtual Environment:
bash
python3 -m venv venv
source venv/bin/activate  # For Linux/Mac
venv\Scripts\activate     # For Windows


2. Install Flask and Dependencies:

bash
pip install flask flask-cors svgwrite pillow


3. Create Backend Files:

• src/backend/app.py: Main Flask application.

#### src/backend/app.py
python
from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
import svgwrite
from io import BytesIO

app = Flask(__name__)
CORS(app)

@app.route("/")
def home():
    return jsonify({"message": "Welcome to the Vectorbit Backend"})

@app.route("/export", methods=["POST"])
def export():
    # Example SVG generation
    dwg = svgwrite.Drawing(size=(256, 256))
    dwg.add(dwg.rect(insert=(0, 0), size=(256, 256), fill="blue"))
    svg_data = BytesIO()
    dwg.write(svg_data)
    svg_data.seek(0)

    return send_file(svg_data, mimetype="image/svg+xml", as_attachment=True, download_name="vectorbit.svg")

if __name__ == "__main__":
    app.run(debug=True)


4. Run the Backend:
python
python src/backend/app.py


4. Add Git Ignore Files

#### Create .gitignore to exclude unnecessary files:
bash
node_modules/
venv/
dist/
__pycache__/
*.svg
*.png
*.jpg

  

5. Test the Setup

• Frontend: Visit http://localhost:3000 to confirm the React app is running.

• Backend: Use curl http://127.0.0.1:5000/ or a browser to test the Flask API.


6. Commit to Git

#### Add and commit your changes:
bash
git add .

git commit -m "Initial setup of Vectorbit project"

