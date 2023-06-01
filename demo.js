require('dotenv').config();
const Octokit = require('octokit');

const gitHubToken = process.env.GITHUB_TOKEN;

const octokit = new Octokit({
    auth: gitHubToken
})

const searchGitHub = async (query) => {
    try {
        const response = await octokit.request('GET /search/repositories', {
            headers
        })
        return response.data;
    } catch (error) {
        console.error(error);
    }
}

const query = encodeURIComponent("GitHub Hi in:readme user:krobison10");

searchGitHub(query)
    .then(data => console.log(data))
    .catch(err => console.error(err));