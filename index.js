require('dotenv').config()
const fastify = require('fastify')({ logger: true })
const qs = require('querystring')

const crawling = require('./lib/crawler')

fastify.get('/crawling', async (request, reply) => {
    const q = qs.parse(request.url.split("?")[1])
    
    let data = q.data
    if (isValidJSONString(q.data)) {
        data = JSON.parse(q.data)
    }

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
})

const isValidJSONString = (str) => {
    try {
        JSON.parse(str)
    } catch (e) {
        return false
    }

    return true
}

const start = async () => {
    try {
      await fastify.listen(process.env.PORT)
    } catch (err) {
      fastify.log.error(err)
      process.exit(1)
    }
}
start()