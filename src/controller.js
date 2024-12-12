const fs = require("fs");
const http = require("node:http");
const { DEFAULT_HEADER } = require("./util/util");
const path = require("path");
var qs = require("querystring");
const data = require("../database/data.json");
const ejs = require("ejs");
const { formidable, formidableErrors } = require("formidable");
const { req } = require("node:querystring");

const controller = {
    getHomePage: async (req, res) => {
        const file = path.join(__dirname, "index.ejs");
        const contents = await ejs.renderFile(file, { data: data });
        return res.end(contents);
    },

    getFeed: async (req, res) => {
        const username = req.url.split("=")[1];
        const user = data.find((obj) => obj.username === username);
        const file = path.join(__dirname, "feed.ejs");
        const contents = await ejs.renderFile(file, { user });
        return res.end(contents);
    },
    parseData: async (data) => {
        const jsonData = JSON.parse(data);
        jsonData.find((obj) => obj.username === username);
        jsonData.photos.push(uploadedFileName);
        return await fs.writeFile(`${data}`, JSON.stringify(jsonData, null, 4));
    },

    // files.photo[0].newFilename
    uploadImages: async (req, res) => {
        let username = req.url.split("=")[1];
        const form = formidable({
            uploadDir: `photos/${username}`,      
            keepExtensions: true,
        });
        let fields;
        let files;
        try {
            [fields, files] = await form.parse(req);
            // files.photo[0].newFilename
        } catch (err) {
            console.error(err);
            res.writeHead(err.httpCode || 400, {
                "Content-Type": "text/plain",
            });
            res.end(String(err));
            return;
        }
        
        const addKeyToJson = async (uploadedFileName) => {
            try {
                const filePath = path.join(__dirname, "../database/data.json");
                const fileData = await fs.promises.readFile(filePath, "utf8");
                const jsonData = JSON.parse(fileData);
        
                const user = jsonData.find((obj) => obj.username === username);
                if (user) {
                    user.photos.push(uploadedFileName);
                } else {
                    throw new Error(`User with username ${username} not found`);
                }
        
                await fs.promises.writeFile(filePath, JSON.stringify(jsonData, null, 4));
                console.log("Key added successfully!");
            } catch (err) {
                console.error("Error adding key to JSON:", err);
                throw err;
            }
        };

        try {
            await addKeyToJson(files.photo[0].newFilename);
        } catch (err) {
            console.error(err)
        }
        
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ fields, files }, null, 2));
        return;
    },
};

module.exports = controller;
