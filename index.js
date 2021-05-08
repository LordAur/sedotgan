require('dotenv').config()
const fastify = require('fastify')({ logger: true })
const qs = require('querystring')
const contentDisposition = require('content-disposition')

const utils = require('./lib/utils')
const crawling = require('./lib/crawler')

fastify.get('/crawling', async (request, reply) => {
    const q = qs.parse(request.url.split("?")[1])
    
    let data = q.data
    if (utils.isValidJSONString(q.data)) {
        data = JSON.parse(q.data)
    } else {
        data = utils.normalize(q.data)
    }

    let clickBefore
    if (q.clickBefore !== undefined) {
        clickBefore = JSON.parse(q.clickBefore)
        if (typeof clickBefore === "string") {
            const tmp = utils.normalize(clickBefore)
            clickBefore = [tmp]
        } else if (typeof q.clickBefore === "[object Object]" && q.clickBefore.length > 0) {
            q.clickBefore.map((node, index) => {
                const tmp = utils.normalize(node)
                clickBefore[index] = tmp 
            })
        }
    } else clickBefore = []

    if (q.puppeteer === "true") {
        let paginateClick = utils.normalize(q.paginateClick)
        let paginateEnd = utils.normalize(q.paginateEnd)

        crawling.domCrawler(q.url, data, Boolean(q.paginate), q.paginateLimit || 1, paginateClick, paginateEnd, clickBefore)
            .then((resp) => {
                if (q.download === "true") zipResponse(reply, resp, Boolean(q.sequentialName), utils.normalize(q.filename))
                else jsonResponse(reply, 200, resp)
            })
            .catch((err) => jsonResponse(reply, 400, {error: err}))
    } else {
        crawling.crawler(q.url, data)
            .then((resp) => {
                if (q.download === "true") zipResponse(reply, resp, Boolean(q.sequentialName), utils.normalize(q.filename))
                else jsonResponse(reply, 200, resp)
            })
            .catch((err) => jsonResponse(reply, 400, {error: err}))
    }
})

const jsonResponse = (reply, statusCode, body) => {
    reply
        .code(statusCode)
        .header('Content-Type', 'application/json; charset=utf-8')
        .send(body)
}

const zipResponse = async (reply, body, sequentialName, filename) => {
    const zipBody = await utils.zipBody(body, sequentialName)
    if (filename === "") filename = "default"
    reply
        .code(200)
        .header('Content-Type', 'application/zip; charset=utf-8')
        .header('Content-Disposition', contentDisposition(`${filename}.zip`))
        .send(zipBody)
}

const start = async () => {
    try {
      await fastify.listen(process.env.PORT || 3000)
    } catch (err) {
      fastify.log.error(err)
      process.exit(1)
    }
}
start()