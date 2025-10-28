# Lightweight React Template for KAVIA

This project provides a minimal React template with a clean, modern UI and minimal dependencies.

## Features

- **Lightweight**: No heavy UI frameworks - uses only vanilla CSS and React
- **Modern UI**: Clean, responsive design with KAVIA brand styling
- **Fast**: Minimal dependencies for quick loading times
- **Simple**: Easy to understand and modify

## Runtime Overview

This frontend includes a minimal Express API server and a React client:
- API server runs on http://localhost:3001
- React dev server runs on http://localhost:3000
- package.json keeps CRA's proxy set to `http://localhost:3001` so client requests to `/api/*` are proxied to the API

The API server reads the SQLite database path from a sibling database container's db_connection.txt when present; otherwise it falls back to a local file.

## Startup Sequence

1) Start the database container first (todo_database)
   - Ensure it writes a db_connection.txt file with a "File path:" line pointing to the SQLite .db file.
   - Location expected by the frontend API:  
     simple-todo-application-36788-36798/todo_database/db_connection.txt

2) Start the frontend (this container)
   - In this directory:
     - `npm install`
     - `npm start`
   - This launches:
     - Express API at port 3001
     - React dev server at port 3000 (proxy to 3001 is preserved)

If db_connection.txt is not found or cannot be parsed, the API falls back to: `todo_frontend/data/todos.db` and will create it if needed.

## Getting Started

In the project directory, you can run:

### `npm start`

Runs both the API server and the React app in development mode.
- React: http://localhost:3000
- API: http://localhost:3001
- The CRA proxy in package.json remains set to `http://localhost:3001`.

### `npm test`

Launches the test runner in interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

## Customization

### Colors

The main brand colors are defined as CSS variables in `src/App.css`:

```css
:root {
  --kavia-orange: #E87A41;
  --kavia-dark: #1A1A1A;
  --text-color: #ffffff;
  --text-secondary: rgba(255, 255, 255, 0.7);
  --border-color: rgba(255, 255, 255, 0.1);
}
```

### Components

This template uses pure HTML/CSS components instead of a UI framework. You can find component styles in `src/App.css`. 

Common components include:
- Buttons (`.btn`, `.btn-large`)
- Container (`.container`)
- Navigation (`.navbar`)
- Typography (`.title`, `.subtitle`, `.description`)

## Learn More

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
