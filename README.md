# Template Pug

Modern web development template with Pug, SASS, Gulp, and Webpack.

## Features

- 🚀 **Pug** templating with BEM methodology support
- 💅 **SASS/SCSS** compilation with autoprefixer
- 📦 **Webpack** for JavaScript bundling
- 🔧 **Gulp** task runner
- 🎨 **Bootstrap 5** integration
- 🔄 Live reload with Browser-sync
- 📝 Source maps for CSS and JS
- 🗜️ Asset optimization (CSS, JS, SVG)
- 🌟 Modern JavaScript with Babel

## Prerequisites

- Node.js (version specified in `.nvmrc`)
- Yarn package manager

## Installation

```bash
# Clone the repository
git clone [your-repo-url]

# Install dependencies
yarn install
```

## Usage

### Development

Start the development server with live reload:

```bash
yarn dev
```

### Build

Build the project for production:

```bash
yarn build
```

### Compress Assets

Optimize and compress project assets:

```bash
yarn compress
```

## Project Structure

```
template-pug/
├── app/
│   ├── pug/        # Pug templates
│   ├── sass/       # SASS/SCSS files
│   ├── js/         # JavaScript files
│   ├── img/        # Images
│   └── css/        # Compiled CSS
├── gulpfile.js     # Gulp tasks configuration
├── webpack.config.js # Webpack configuration
└── package.json
```

## Features in Detail

### Pug Templates
- BEM methodology support via gulp-pugbem
- Components-based structure
- Pretty HTML output

### Styles
- SASS/SCSS preprocessing
- Autoprefixer for cross-browser compatibility
- CSS minification
- Source maps for debugging

### JavaScript
- Modern ES6+ syntax support
- Babel transpilation
- Webpack bundling
- Code minification
- Source maps

### Asset Optimization
- SVG optimization and sprite generation
- Image compression
- CSS and JS minification

### Development Tools
- Live reload
- Error notifications
- Source maps
- Development server

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Author

Keba 