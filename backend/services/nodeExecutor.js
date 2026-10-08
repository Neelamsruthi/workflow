const axios = require("axios");
const ivm = require("isolated-vm");
const dns = require("dns").promises;
const executeTransformNode = async (
    node,
    input
) => {

    const code =
        node.config?.code;

    if (!code) {
        return input;
    }

    const isolate =
        new ivm.Isolate({
            memoryLimit: 64
        });

    try {

        const context =
            await isolate.createContext();

        const jail =
            context.global;

        await jail.set(
            "input",
            new ivm.ExternalCopy(
                input
            ).copyInto()
        );

        const script =
            await isolate.compileScript(`
                (async () => {
                    ${code}
                })()
            `);

        const result =
            await script.run(
                context,
                {
                    timeout: 500
                }
            );

        return await new ivm.ExternalCopy(
            result
        ).copy();

    } catch (error) {

        throw new Error(
            `Transform execution failed: ${error.message}`
        );

    } finally {

        isolate.dispose();
    }
};
const isPrivateIP = (ip) => {
    return (
        ip.startsWith("10.") ||
        ip.startsWith("192.168.") ||
        ip.startsWith("127.") ||
        ip.startsWith("169.254.") ||
        /^172\.(1[6-9]|2\d|3[0-1])\./.test(ip) ||
        ip === "::1" ||
        ip.startsWith("fc") ||
        ip.startsWith("fd")
    );
};
const executeHttpNode = async (
    node,
    input
) => {
    const {
        url,
        method = "GET",
        headers = {},
        body,
        retryAttempts = 3,
        retryDelay = 1000
    } = node.config || {};

    if (!url) {
        throw new Error(
            "HTTP URL is required"
        );
    }
const parsedUrl = new URL(url);

if (parsedUrl.protocol !== "http:" &&
    parsedUrl.protocol !== "https:") {
    throw new Error(
        "Only HTTP and HTTPS URLs are allowed"
    );
}

const hostname = parsedUrl.hostname;

const addresses =
    await dns.lookup(hostname, {
        all: true
    });

for (const address of addresses) {
    if (isPrivateIP(address.address)) {
        throw new Error(
            "HTTP request blocked: private or local IP address is not allowed"
        );
    }
}
    let lastError;

    for (
        let attempt = 1;
        attempt <= retryAttempts;
        attempt++
    ) {

        try {

            console.log(
                `HTTP attempt ${attempt}/${retryAttempts}`
            );

            const response =
                await axios({
                    url,
                    method,
                    headers,
                    data:
                        body !== undefined
                            ? body
                            : input
                });

            return {
                status:
                    response.status,

                headers:
                    response.headers,

                body:
                    response.data
            };

        } catch (error) {

            lastError = error;

            console.log(
                `HTTP attempt ${attempt} failed`
            );

            /*
             * Stop if this was the
             * final attempt.
             */
            if (
                attempt === retryAttempts
            ) {
                break;
            }

            /*
             * Exponential backoff:
             *
             * attempt 1 → 1000ms
             * attempt 2 → 2000ms
             * attempt 3 → 4000ms
             */
            const delay =
                retryDelay *
                Math.pow(
                    2,
                    attempt - 1
                );

            console.log(
                `Retrying in ${delay}ms`
            );

            await new Promise(
                (resolve) =>
                    setTimeout(
                        resolve,
                        delay
                    )
            );
        }
    }

    throw new Error(
        `HTTP request failed after ${retryAttempts} attempts: ${
            lastError?.response?.data?.message ||
            lastError?.message
        }`
    );
};


module.exports = {
    executeTransformNode,
    executeHttpNode
};