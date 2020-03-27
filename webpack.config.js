const HtmlWebPackPlugin = require('html-webpack-plugin')
module.exports = {
    entry: [
        'babel-polyfill',
        './src/index.js'
    ],
    target: 'electron-renderer',
    resolve: {
        extensions: ['.jsx', '.js', '.json']
    },
    output: {
        path: __dirname,
        publicPath: '/',
        filename: 'bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader"
                }
            },
            {
                test: /\.css$/,
                use: [
                    {
                        loader: 'style-loader',
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            modules: true,
                        }
                    }
                ],
            },
            {
                test: /\.(png|jpe?g|gif)$/i,
                use: [
                    {
                        loader: "url-loader?name=app/images/[name].[ext]"
                    },
                ],
            },
            {
                test: /\.s[ac]ss$/i,
                use: [
                    {
                        loader: 'style-loader',
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            modules: true,
                        }
                    },
                    {
                        loader: 'sass-loader',
                    },
                ],
            }
        ]
    },
    devServer: {
        historyApiFallback: true,
    }
    // plugins: [
    //     new HtmlWebPackPlugin({
    //         template: "./src/index.html",
    //         filename: "./index.html"
    //     })
    // ]
};