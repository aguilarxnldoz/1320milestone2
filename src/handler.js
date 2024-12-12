const { parse } = require("url");
const { DEFAULT_HEADER } = require("./util/util.js");
const controller = require("./controller");
const { createReadStream, statSync } = require("fs");
const path = require("path");

const allRoutes = {
    // GET: localhost:3000/home
    "/home:get": (request, response) => {
        controller.getHomePage(request, response);
    },

    // POST: localhost:3000/images
    "/images:post": (request, response) => {
        console.log("got image");
        controller.uploadImages(request, response);
        console.log("uploaded image");
    },

    // GET: localhost:3000/feed
    // Shows instagram profile for a given user
    "/feed:get": (request, response) => {
        controller.getFeed(request, response);
    },

    // 404 routes
    default: (request, response) => {
        response.writeHead(404, DEFAULT_HEADER);
        createReadStream(
            path.join(__dirname, "views", "404.html"),
            "utf8"
        ).pipe(response);
    },
};

function handler(request, response) {
    const { url, method } = request;

    const { pathname } = parse(url, true);

    if (pathname.startsWith('/photos/')) {
        return serveStaticFile(request, response, pathname);
    }

    const key = `${pathname}:${method.toLowerCase()}`;
    const chosen = allRoutes[key] || allRoutes.default;

    return Promise.resolve(chosen(request, response)).catch(
        handlerError(response)
    );
}

function handlerError(response) {
    return (error) => {
        console.log("Something bad has  happened**", error.stack);
        response.writeHead(500, DEFAULT_HEADER);
        response.write(
            JSON.stringify({
                error: "internet server error!!",
            })
        );

        return response.end();
    };
}

const serveStaticFile = async (request, response, pathname) => {
    // Remove leading slash to create a relative path
    const relativePath = pathname.replace(/^\/+/, '');
    const filePath = path.join(__dirname, relativePath);
    // Debug Log
    console.log('Attempting to serve:', filePath);

    try {
        statSync(filePath);
    } catch (error) {
        console.error('statSync error:', error.message);
        response.writeHead(404, DEFAULT_HEADER);
        return response.end('File not found');
    }

    let contentType = 'application/octet-stream';
    if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
        contentType = 'image/jpeg';
    } else if (filePath.endsWith('.png')) {
        contentType = 'image/png';
    }
    response.writeHead(200, { 'Content-Type': contentType });
    createReadStream(filePath).pipe(response);
};

module.exports = handler;
