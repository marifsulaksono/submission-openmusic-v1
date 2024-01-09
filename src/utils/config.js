const config = {
    app: {
        port: process.env.PORT,
        host: process.env.HOST
    },
    rabbitmq: {
        server: process.env.RABBITMQ_SERVER
    },
    s3: {
        buckerName: process.env.AWS_BUCKET_NAME
    },
    redis: {
        server: process.env.REDIS_SERVER
    }
}

module.exports = config