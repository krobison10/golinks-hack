require('dotenv').config();

const express = require('express');
const app = express();
const cors = require('cors'); 

const port = process.env.PORT || 3000;

const axios = require('axios');

const gitHubToken = process.env.GITHUB_TOKEN;

axios.defaults.headers.common['Authorization'] = `token ${gitHubToken}`;

app.use(cors());

app.get('/', (request, response) => {
    response.send("Welcome, please access the '/stats' endpoint with the necessary parameters");
});

app.get('/stats', (request, response, next) => {
    if(!request.query.username) {
        return response.status(400).send({
            error: "Missing a username"
        })
    }
    else {
        next()
    }
}, async (request, response, next) => {
    //Get all repos
    const url = `https://api.github.com/users/${request.query.username}/repos`
    try {
        const res = await axios.get(url);
        request.repos = res.data.map(entry => Object.assign({}, entry));
        next();
    } catch(err) {
        response.status(500).send({
            error: "Error communicating with GitHub"
        });
    }
}, (request, response, next) => {
    //filter for non-forked if necessary
    if(request.query.forked === "false") {
        request.repos = request.repos.filter(entry => entry.fork === false);
    }
    next();
}, (request, response, next) => {
    //Get total count of repositories
    request.repoCount = request.repos.length;
    next();
}, (request, response, next) => {
    //Get total stargazers for all repositories
    request.stargazerCount = request.repos.reduce((sum, cur) => sum + cur.stargazers_count, 0);
    next();
}, (request, response, next) => {
    //Get total fork count
    request.forkCount = request.repos.reduce((sum, cur) => sum + cur.forks_count, 0);
    next();
}, (request, response, next) => {
    //Average size of all repositories in appropriate unit
    const totalSize = request.repos.reduce((sum, cur) => sum + cur.size, 0);
    request.avgSize = totalSize / request.repos.length;
    request.avgSize = convertSize(request.avgSize);
    next();
}, async (request, response, next) => {
    //List of languages with their counts sorted descending
    const promises = request.repos.map(repo => {
        const url = repo.languages_url;
        return axios.get(url)
        .then(res => res.data);
    });

    const languageMap = {};

    try {
        const responses = await Promise.all(promises);
        responses.forEach(langs => {
            Object.keys(langs).forEach(key => {
                if(!languageMap[key]) {
                    languageMap[key] = 1;
                }
                else {
                    languageMap[key]++;
                }
            });
        });

        request.languages = Object.entries(languageMap).map(([language, count]) => ({
            [language]: count
        })).sort((a, b) => Object.values(b)[0] - Object.values(a)[0]);

        next();
    } catch (error) {
        response.status(500).send({ error: "Error processing languages" });
    }
}, (request, response) => {
    response.status(200).send({
        repoCount: request.repoCount,
        totalStargazers: request.stargazerCount,
        totalForkCount: request.forkCount,
        avgRepoSize: request.avgSize,
        languages: request.languages
    })
});

function convertSize(sizeInKB) {
    if (sizeInKB < 1024) {
        return sizeInKB + ' KB';
    } else if (sizeInKB < 1024 * 1024) {
        const sizeInMB = (sizeInKB / 1024).toFixed(2);
        return sizeInMB + ' MB';
    } else {
        const sizeInGB = (sizeInKB / (1024 * 1024)).toFixed(2);
        return sizeInGB + ' GB';
    }
}

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
