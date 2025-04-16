sh
#!/bin/bash

echo "Setting up your Vectorbit project..."

# Step 1: Initialize npm project
if [ ! -f package.json ]; then
  echo "Initializing npm project..."
  npm init -y
else
  echo "npm project already initialized."
fi

# Step 2: Install Runtime Dependencies
echo "Installing runtime dependencies..."
npm install --save \
  react react-dom react-router-dom @mui/material @mui/icons-material \
  lodash.debounce clsx express mongoose helmet compression morgan \
  axios crypto body-parser cors sharp svg2img

# Step 3: Install Development Dependencies
echo "Installing development dependencies..."
npm install --save-dev \
  jest babel-jest @babel/preset-env @babel/preset-react @testing-library/react \
  @testing-library/jest-dom @testing-library/user-event dotenv enzyme-to-json \
  identity-obj-proxy jest-resolve jest-watch-typeahead jest-svg-transform \
  prettier eslint eslint-plugin-react eslint-config-airbnb \
  eslint-plugin-jsx-a11y eslint-plugin-import eslint-plugin-react-hooks \
  husky lint-staged mongodb-memory-server svgo

# Step 4: Setup Project Structure
echo "Creating project structure..."
mkdir -p src/{components,server/{routes,models,utils},utils,state,tests} \
  public/{assets,images,styles} \
  __tests__

touch \
  src/index.js \
  src/App.js \
  src/server/server.js \
  src/setupTests.js \
  jest-svg-transform.js \
  jest-resolver.js \
  .eslintrc.json \
  .prettierrc \
  jest.config.js \
  tsconfig.json \
  README.md

# Step 5: Configure ESLint
echo "Configuring ESLint..."
cat <<EOL > .eslintrc.json
{
  "extends": ["airbnb", "prettier"],
  "parserOptions": {
    "ecmaVersion": 2021,
    "sourceType": "module"
  },
  "env": {
    "browser": true,
    "node": true,
    "jest": true
  },
  "rules": {
    "react/jsx-filename-extension": [1, { "extensions": [".js", ".jsx"] }],
    "import/prefer-default-export": "off",
    "no-console": "warn"
  }
}
EOL

# Step 6: Configure Prettier
echo "Configuring Prettier..."
cat <<EOL > .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 80
}
EOL

# Step 7: Setup Husky and Lint-Staged for Pre-commit Hooks
echo "Setting up Husky and Lint-Staged..."
npx husky install
npx husky add .husky/pre-commit "npx lint-staged"

cat <<EOL > lint-staged.config.js
module.exports = {
  "*.js": ["eslint --fix", "prettier --write"],
  "*.jsx": ["eslint --fix", "prettier --write"],
  "*.css": ["prettier --write"],
};
EOL

# Step 8: Configure Jest
echo "Configuring Jest..."
cat <<EOL > jest.config.js
module.exports = {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(js|jsx)$": "babel-jest",
    "^.+\\.svg$": "<rootDir>/jest-svg-transform.js"
  },
  moduleNameMapper: {
    "\\.(css|scss|sass)$": "identity-obj-proxy"
  },
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.js"],
  collectCoverageFrom: ["src/**/*.{js,jsx}", "!src/index.js"]
};
EOL

# Step 9: Create Jest SVG Transformer
echo "Creating Jest SVG Transformer..."
cat <<EOL > jest-svg-transform.js
module.exports = {
  process(sourceText, sourcePath) {
    const svgContent = \`
      module.exports = {
        __esModule: true,
        default: "<svg />",
        raw: \${JSON.stringify(sourceText || "")},
        path: "\${sourcePath}"
      };
    \`;
    return { code: svgContent };
  },
  getCacheKey(fileData, filePath, configString, options) {
    return \`\${fileData}-\${filePath}-\${configString}-\${JSON.stringify(options)}\`;
  },
};
EOL

# Step 10: Create Jest Resolver
echo "Creating Jest Resolver..."
cat <<EOL > jest-resolver.js
const path = require("path");

module.exports = (request, options) => {
  const svgExtensions = [".svg", ".svgx"];
  const aliasMappings = {
    "@/components": "src/components",
    "@/utils": "src/utils",
    "@/assets": "src/assets"
  };

  if (svgExtensions.some((ext) => request.endsWith(ext))) {
    const resolvedPath = path.join(options.basedir, request);
    console.log(\`[Resolver] SVG Resolved: \${resolvedPath}\`);
    return resolvedPath;
  }

  for (const alias in aliasMappings) {
    if (request.startsWith(alias)) {
      const aliasPath = request.replace(alias, aliasMappings[alias]);
      const resolvedAliasPath = path.resolve(options.basedir, aliasPath);
      console.log(\`[Resolver] Alias Resolved: \${resolvedAliasPath}\`);
      return resolvedAliasPath;
    }
  }

  return options.defaultResolver(request, options);
};
EOL

# Final Message
echo "Setup complete! Your Vectorbit project is ready to go."
echo "Run 'npm start' to start the development server or 'npm test' to run tests."
