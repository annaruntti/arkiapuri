'use strict'

const fs = require('fs')
const next = require('image-size-next')

const imageSizeImpl = next.imageSize || next.default

/**
 * Metro 0.83 still calls image-size() with a file path (v1 API).
 * image-size-next 2.x only accepts a buffer, so resolve paths here.
 */
function imageSize(input) {
    const bytes = typeof input === 'string' ? fs.readFileSync(input) : input
    return imageSizeImpl(bytes)
}

module.exports = imageSize
module.exports.imageSize = imageSize
module.exports.default = imageSize
module.exports.disableTypes = next.disableTypes
module.exports.types = next.types
