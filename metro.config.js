const { getDefaultConfig } = require('@expo/metro-config')
const path = require('path')

const config = getDefaultConfig(__dirname)

// Fix workspace root issues
config.watchFolders = [__dirname]
config.resolver.platforms = ['ios', 'android', 'native', 'web']

module.exports = config
