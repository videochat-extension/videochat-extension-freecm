# Videochat Extension FreeCM

This Chromium extension improves your experience on CooMeet's free video chat service by helping you identify which users are real people and which are likely bots.

Originally part of the larger Videochat Extension project, this functionality was moved into its own dedicated extension with several enhancements. This separation occurred when the main Videochat Extension project changed direction to focus on general WebRTC monitoring rather than site-specific improvements.

This extension is distributed under the MIT open source license, even though the main Videochat Extension project has since become closed-source with a completely new codebase.

## Features

- 🤖 Bot Detection: Automatically identifies potential bot accounts
- 🚫 Auto-Hide: Option to automatically hide video feed from suspected bots 
- 🔇 Auto-Mute: Option to automatically mute audio when bots are detected
- 🌎 Country Detection: Shows the country of your chat partner
- ✨ Minor Improvements: Various small enhancements
- 👁️ Alternative Mode: Backup UI that is more resilient to website changes

## Supported Sites

- free.coomeet.com
- rusvideochat.ru
- video-roulette24.ru
- chatroulette.msk.ru

## Installation

1. Download from the Chrome Web Store

## Usage

1. Visit any supported video chat site
2. Accept the extension's terms when prompted
3. The extension will automatically start monitoring video chats
4. Use the eye icon (👁️) in the top right to open alternative mode, which is more resilient to website changes
5. Bot status and country information will be displayed on the interface, everything is pretty much self-explanatory

## Development

### Prerequisites
- Node.js and npm installed
- Chromium-based browser for testing

### Setup
```bash
# Install dependencies
npm install
```

### Build Commands
```bash
# Build for Chrome production
npm run ext:chrome

# Build for Chrome development
npm run ext:chrome-dev

# Build for Chrome development with watch mode
npm run ext:chrome-dev-watch
```

Build outputs will be created in:
- Production: `webpack_builds/release_chrome/`
- Development: `webpack_builds/dist_chrome/`

### Load into Browser (Developer Mode)

1. Open your Chromium-based browser and navigate to `chrome://extensions/`.
2. Enable "Developer mode" using the toggle in the top-right corner.
3. Click "Load unpacked" and select the desired build output directory:
    - For Production: `webpack_builds/release_chrome/`
    - For Development: `webpack_builds/dist_chrome/`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

This extension is provided "as is", without warranty of any kind. Any consequences of using it are your own responsibility.

## Support

If you encounter any issues, please [create an issue](https://github.com/videochat-extension/videochat-extension-freecm/issues) on GitHub.