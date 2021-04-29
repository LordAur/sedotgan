const xray = require('x-ray')
const x = xray()

const puppeteer = require('puppeteer')

const crawler = (url, data) => {
    return new Promise(async (resolve, reject) => {
        if (Object.prototype.toString.call(data) === "[object Object]") {
            generateScopping(data)
                .then((scope) => {
                    runXray(url, scope)
                    .then((obj) => resolve(obj))
                    .catch((err) => reject(err))
                })
        } else {
            runXray(url, data)
            .then((obj) => resolve(obj))
            .catch((err) => reject(err))
        }
    })
}

const domCrawler = (url, data, paginate, paginateLimit = 1, paginateClick, paginateEnd) => {
    return new Promise(async (resolve, reject) => {
        const html = await getDOMHTML(url, paginate, paginateLimit, paginateClick, paginateEnd)
        if (paginate) {
            let objs = []
            if (Object.prototype.toString.call(data) === "[object Object]") {
                generateScopping(data)
                    .then((scope) => {
                        html.map((tmpHTML) => {
                            runXray(tmpHTML, scope, 'html')
                            .then((obj) => {
                                objs.push(obj)
                                if (html.length === index+1) resolve(objs)
                            })
                            .catch((err) => reject(err))
                        })
                    })
            } else {
                html.map((tmpHTML, index) => {
                    runXray(tmpHTML, data, 'html')
                    .then((obj) => {
                        objs.push(obj)
                        if (html.length === index+1) resolve(objs)
                    })
                    .catch((err) => reject(err))
                })
            }
        } else {
            if (Object.prototype.toString.call(data) === "[object Object]") {
                generateScopping(data)
                    .then((scope) => {
                        runXray(html, scope, 'html')
                        .then((obj) => resolve(obj))
                        .catch((err) => reject(err))
                    })
            } else {
                runXray(html, data, 'html')
                .then((obj) => resolve(obj))
                .catch((err) => reject(err))
            }
        }
    })
}

const runXray = (url, data, context = null) => {
    return new Promise((resolve, reject) => {
        if (context === null) {
            x(url, data)((err, obj) => {
                if (err !== null) reject(err)
                else resolve(obj)
            })
        } else {
            x(url, context, data)((err, obj) => {
                if (err !== null) reject(err)
                else resolve(obj)
            })
        }
    })
}

const getDOMHTML = async (url, paginate, paginateLimit = 1, paginateClick, paginateEnd) => {
    const browser = await puppeteer.launch({headless: true})
    const [page] = await browser.pages()
    await page.setViewport({ width: 1366, height: 768})
    await page.goto(url, {waitUntil: 'networkidle0'})
    await page.waitForSelector('body')

    if (paginate && paginateClick !== "") {
        let iteration = 1
        let htmls = []

        if (paginateEnd === "") {
            while (iteration < paginateLimit) {
                const html = await page.evaluate(() =>  document.documentElement.outerHTML)
                htmls.push(html)
                await page.click(paginateClick)
                iteration++
            }
        } else {
            while(await page.$(paginateEnd) === null) {
                const html = await page.evaluate(() =>  document.documentElement.outerHTML)
                htmls.push(html)
                await page.click(paginateClick)
            }
            const html = await page.evaluate(() =>  document.documentElement.outerHTML)
            htmls.push(html)
        }

        await browser.close()

        return htmls
    } else {
        const html = await page.evaluate(() =>  document.documentElement.outerHTML)
        await browser.close()

        return html
    }
}

const generateScopping = (data) => {
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

const masterElement = (values) => {
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