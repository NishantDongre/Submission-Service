const fastifyPlugin = require("fastify-plugin");
const servicePlugin = require("./services/servicePlugin");
const repopsitoryPlugin = require("./repositories/repositoryPlugin");

/**
 *
 * @param {Fastify object} fastify
 * @param {*} options
 */
async function app(fastify, options) {
    await fastify.register(require("@fastify/cors"));

    await fastify.register(repopsitoryPlugin);
    await fastify.register(servicePlugin);

    // register routes
    await fastify.register(require("./routes/api/apiRoutes"), {
        prefix: "/api",
    });
}

module.exports = fastifyPlugin(app);
