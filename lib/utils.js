const AdmZip = require('adm-zip')
const URL = require('url')
const path = require('path')
const superagent = require('superagent')

const isValidJSONString = (str) => {
    try {
        JSON.parse(str)
    } catch (e) {
        return false
    }

    return true
}

const normalize = (uri) => {
    if (uri !== undefined) {
        uri = uri.replace(/%20/g, " ")
        uri = uri.replace(/%23/g, "#")
        uri = uri.replace(/['"]+/g, '')

        return unescape(uri)
    }

    return undefined
}

const zipBody = async (body, sequentialName) => {
    var zip = new AdmZip()
    if (typeof body === "object" && body.length === undefined) {
        const json = JSON.stringify(body)
        zip.addFile("response.json", Buffer.alloc(json.length, json), "response json")

        const keys = Object.keys(body)
        keys.map(async (key) => {
            const value = body[key]
            if (typeof value === "string") {
                await downloadFile(value)
                .then((res) => {
                    zip.addFile(res.filename, Buffer.alloc(res.contentLength, res.file), "response file")
                })
            } else if (typeof value === "object" && value.length > 0) {
                const downloadProgress = value.map(async (url, index) => {
                    await downloadFile(url)
                    .then((res) => {
                        var filename = res.filename
                        if (sequentialName) filename = (index+1) + "." + path.extname(res.filename)
                        zip.addFile(filename, Buffer.alloc(res.contentLength, res.file), "response file")
                        console.log(`Download ${url} - Success`)
                    })
                    .catch((err) => console.log(`Download  ${url} - Error: ${err}`))
                })
                await Promise.all(downloadProgress)
            }
        })

        return zip.toBuffer()
    } else if (typeof body === "object" && body.length > 0) {
        const downloadProgress = body.map(async (url, index) => {
            await downloadFile(url)
            .then((res) => {
                var filename = res.filename
                if (sequentialName) filename = (index+1) + "." + path.extname(res.filename)
                zip.addFile(filename, Buffer.alloc(res.contentLength, res.file), "response file")
                console.log(`Download ${url} - Success`)
            })
            .catch((err) => console.log(`Download  ${url} - Error: ${err}`))
        })
        await Promise.all(downloadProgress)

        return zip.toBuffer()
    } else return null
}

const downloadFile = (url) => {
    return new Promise((resolve, reject) => {
        if (url.includes("http://") || url.includes("https://")) {
            const origin = getMainDomain(url)
            superagent
            .get(url)
            .set('Referer', origin)
            .timeout(0)
            .retry(3)
            .end((err, res) => {
                if (err) reject(err)
                else {
                    const contentType = res.headers['content-type']
                    if (contentType.includes("application") || contentType.includes("audio") || contentType.includes("image") || contentType.includes("video")) {
                        const filename = getFileName(url)
                        resolve({
                            filename,
                            file: res.body,
                            contentLength: parseInt(res.headers['content-length'])
                        })
                    } else reject("Wrong media")
                }
            })
        } else reject("Wrong url")
    })
}

const getMainDomain = (url) => {
    const obj = new URL.URL(url)
    const parts = obj.hostname.split('.')

    if (parts.length > 2) return obj.protocol + "//" + parts.slice(-2).join('.')
    else return obj.origin
}

const getFileName = (url) => {
    const obj = new URL.URL(url)
    return path.basename(obj.pathname)
}

module.exports.isValidJSONString = isValidJSONString
module.exports.normalize = normalize
module.exports.zipBody = zipBody
module.exports.downloadFile = downloadFile