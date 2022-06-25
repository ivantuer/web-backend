const createClient = require('redis').createClient;

class RedisService  {
    constructor() {
        this.client = createClient({host: 'redis-server',
            port: 6379});
        this.client.on('error', (err) => console.log('Redis Client Error', err));
    }
    async connect() {
        await this.client.connect();
    }

    async set(key, value) {
        return this.client.set(key, value);
    }

    async get(key) {
        return this.client.get(key);
    }
}

module.exports = RedisService;