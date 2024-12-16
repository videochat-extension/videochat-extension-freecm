const webpack = require("webpack");
const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const srcDir = path.join(__dirname, "..", "src");

const browser = process.env.BROWSER;
const BUILD_DIR_NAME = process.env.DIR;

module.exports = {
    entry: {
        injection_coomeetfree: path.join(srcDir, 'injection/coomeetfree.ts'),
        background: path.join(srcDir, 'background.ts'),
        content_script: path.join(srcDir, 'content.ts'),
        popup: path.join(srcDir, 'popup/popup.ts')
    },
    output: {
        path: path.join(__dirname, `../${BUILD_DIR_NAME}`),
        filename: (chunkData) => {
            if (chunkData.chunk.name === 'injection_coomeetfree') return "injection/coomeetfree.js";
            if (chunkData.chunk.name === 'popup') return "popup/popup.js";
            return "[name].js";
        },
    },
    optimization: {
        splitChunks: {
            name: "vendor",
            chunks(chunk) {
                return chunk.name === 'content_script';
            }
        },
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
            {test: require.resolve('arrive')},
        ],
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js"],
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                {from: ".", to: "", context: "public"},
                {from: `${browser}.json`, to: `manifest.json`, context: 'manifest'},
                {from: "popup/popup.html", to: "popup/popup.html", context: 'src'},
                {from: "popup/popup.css", to: "popup/popup.css", context: 'src'},
                {from: "popup/font-awesome/css/fa.min.css", to: "popup/font-awesome/css/fa.min.css", context: 'src'},
                {from: "popup/font-awesome/webfonts", to: "popup/font-awesome/webfonts", context: 'src'}
            ],
            options: {},
        }),
    ],
};
