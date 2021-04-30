require('dotenv').config()
const fastify = require('fastify')({ logger: true })
const qs = require('querystring')

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

    if (q.puppeteer === "true") {
        let paginateClick = utils.normalize(q.paginateClick)
        let paginateEnd = utils.normalize(q.paginateEnd)

        crawling.domCrawler(q.url, data, Boolean(q.paginate), q.paginateLimit || 1, paginateClick, paginateEnd)
            .then((resp) => {
                reply
                    .code(200)
                    .header('Content-Type', 'application/json; charset=utf-8')
                    .send(resp)
            })
            .catch((err) => {
                reply
                    .code(400)
                    .header('Content-Type', 'application/json; charset=utf-8')
                    .send({
                        errors: err.message
                    })
            })
    } else {
        crawling.crawler(q.url, data)
            .then((resp) => {
                reply
                    .code(200)
                    .header('Content-Type', 'application/json; charset=utf-8')
                    .send(resp)
            })
            .catch((err) => {
                reply
                    .code(400)
                    .header('Content-Type', 'application/json; charset=utf-8')
                    .send({
                        errors: err.message
                    })
            })
    }
})

const start = async () => {
    try {
      await fastify.listen(process.env.PORT || 3000)
    } catch (err) {
      fastify.log.error(err)
      process.exit(1)
    }
}
start()