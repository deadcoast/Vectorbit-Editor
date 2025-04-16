## VectorBit

VectorBit is a versatile and cutting-edge pixel art illustration software tailored for artists and developers. It offers a comprehensive suite of tools to create, manage, and export scalable vector-based pixel art that adapts seamlessly to various grid sizes and styles.

### Features

#### Core Features

• Resizable Pixel Art: Adjust grid sizes dynamically without compromising quality.

• Vector-Based Design: Ensures smooth scalability for all artwork, optimized for resizing mid-project.

• Customizable Grid Ratios: Choose from standard grids (8-bit, 16-bit, 32-bit) or define your own.

• Layer Management: Organize your artwork with multi-layered editing support.

• Color Management: Advanced tools like the Eye Dropper, Color Picker, Recent Colors, and Palette Management.

• Export Options: Save your creations as .svg, .png, .jpg, or share via JSON data for collaborative projects.

#### Advanced Tools

• Procedural Patterns: Generate noise-based or algorithmic patterns directly on the grid.

• Collaboration Features: Share your project data or work collaboratively in real time.

• Custom Palettes: Create and manage palettes tailored to your project needs.

### Installation

#### Prerequisites

• Node.js (v14 or later)

• npm (v6 or later)

#### Steps to Install

1. Clone the repository:
sh
git clone https://github.com/deadcoast/vectorbit.git

cd vectorbit



2. Install dependencies:
sh
npm install



3. Start the development server:
sh
npm start



## Usage

### Scripts

#### Script Description

- npm start Runs the app in development mode.

- npm run build Builds the app for production.

- npm test Runs all test cases.

- npm run lint Lints the codebase for issues.


### Environment Variables

1. Create a .env file in the root directory.

2. Configure the following variables:
sh
REACT_APP_API_BASE_URL=http://localhost:5000
REACT_APP_DEFAULT_GRID_SIZE=16
REACT_APP_DEFAULT_COLOR=#ffffff



## Project Structure

  

vectorbit/

vectorbit/
├── src/
│   ├── components/         # React components (UI)
│   ├── utils/              # Helper functions (grid, palette, file handling)
│   ├── styles/             # Shared CSS styles
│   ├── state/              # State management hooks
│   ├── App.js              # Root application component
│   ├── App.css             # Root application styles
│   └── index.js            # Main React entry point
├── public/                 # Static files
│   ├── index.html          # Root HTML file
│   └── favicon.ico         # App icon
├── server/                 # Backend server
│   ├── routes/             # API routes (projects, palettes)
│   ├── models/             # Database models (Mongoose schemas)
│   ├── server.js           # Main server entry point
│   └── utils/              # Server utility functions
├── tests/                  # Test files
├── .env                    # Environment variables
├── package.json            # Project metadata and dependencies
├── README.md               # Project documentation
├── webpack.config.js       # Webpack configuration
└── setup.sh                # Setup script for installation


  
## Development Notes


### Frontend

• Built with React.js for a responsive and dynamic UI.

• Material UI for accessible and modern design components.

### Backend

• Developed using Express.js for robust and scalable API endpoints.

• Uses MongoDB as the primary database for projects and palettes.

### Testing

• Comprehensive testing suite powered by Jest, @testing-library/react, and @testing-library/jest-dom.

• Linting tools like ESLint and Prettier ensure code consistency.

### Build Tool

• Managed via Webpack, configured for efficient builds and modular development.

### Contribution

We welcome contributions from the community! Follow these steps to contribute:

1. Fork the repository.

2. Create a feature branch:
sh
git checkout -b feature-name



3. Commit your changes:
sh
git commit -m "Add feature description"



4. Push your branch:
sh
git push origin feature-name



5. Submit a pull request.


### License


This project is licensed under the [MIT License](LICENSE).

### Support

If you encounter any issues or have questions:

• Visit the [issues page](https://github.com/deadcoast/vectorbit/issues) to report bugs or request features.

• Contact us at [support@vectorbit.com](mailto:support@vectorbit.com).