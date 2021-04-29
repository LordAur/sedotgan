const isValidJSONString = (str) => {
    try {
        JSON.parse(str)
    } catch (e) {
        return false
    }

    return true
}

const normalize = (uri) => {
    uri = uri.replace(/%20/g, " ")
    uri = uri.replace(/%23/g, "#")
    uri = uri.replace(/['"]+/g, '')

    return unescape(uri)
}

module.exports.isValidJSONString = isValidJSONString
module.exports.normalize = normalize