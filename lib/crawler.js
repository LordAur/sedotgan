const xray = require('x-ray')
const x = xray()

const puppeteer = require('puppeteer')

const crawler = (url, data) => {
    return new Promise(async (resolve, reject) => {
        if (Object.prototype.toString.call(data) === "[object Object]") {
            generateScopping(data)
                .then((scope) => {
                    x(url, scope)((err, obj) => {
                        if (err !== null) reject(err)
                        else resolve(obj)
                    })
                })
        } else {
            x(url, data)((err, obj) => {
                if (err !== null) reject(err)
                else resolve(obj)
            })
        }
    })
}

const domCrawler = (url, data) => {
    return new Promise((resolve, reject) => {
        (async () => {
            const browser = await puppeteer.launch({headless: true})
            const [page] = await browser.pages()
            await page.goto(url, {waitUntil: 'networkidle2'})
            const html = await page.evaluate(() =>  document.documentElement.outerHTML)
            await browser.close()

            if (Object.prototype.toString.call(data) === "[object Object]") {
                generateScopping(data)
                    .then((scope) => {
                        x(html, 'html', scope)((err, obj) => {
                            if (err !== null) reject(err)
                            else resolve(obj)
                        })
                    })
            } else {
                x(html, 'html', data)((err, obj) => {
                    if (err !== null) reject(err)
                    else resolve(obj)
                })
            }
        })()
    })
}

const generateScopping = async (data) => {
    let scope = {}

    const keys = Object.keys(data)
    keys.map((key) => {
        const value = data[key]
        if (typeof value === "string") {
            scope[key] = value
        } else if (typeof value === "object" && value.length === undefined) {
            scope[key] = value
        } else if (typeof value === "object" && value.length > 0) {
            if (Object.prototype.toString.call(value[0]) === "[object Object]") {
                masterElement(value[0])
                    .then((elements) => {
                        scope[key] = x(elements[0], [elements[1]])
                    })
            } else scope[key] = [value[0]]
        }
    })

    return scope
}

const masterElement = async (values) => {
    let elements = []
    let sameElements = []
    let childElements = {}
    
    const keys = Object.keys(values)
    keys.map((key) => {
        const arr = values[key].split(" ")
        if (elements.length === 0) {
        	elements = arr
        } else {
        	arr.map((value) => {
                if (elements.includes(value)) {
                    sameElements.push(value)
                } else {
                    if (childElements[key] === undefined) childElements[key] = value
                    else childElements[key] = childElements[key] + " " + value
                }
            })
        }
    })
    childElements[keys[0]] = elements.slice(sameElements.length, elements.length).join(" ")
    
    return [sameElements.join(" "), childElements]
}

module.exports.crawler = crawler
module.exports.domCrawler = domCrawler
module.exports.masterElement = masterElement