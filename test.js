require('dotenv').config();
const axios = require('axios');

const gitHubToken = process.env.GITHUB_TOKEN;

axios.defaults.headers.common['Authorization'] = `token ${gitHubToken}`;

const searchGitHub = async (query) => {
    try {
        const response = await axios.get(`https://api.github.com/users/seantomburke/repos`);
        return response.data;
    } catch (error) {
        console.error(error);
    }
}

const query = encodeURIComponent(" Hi in:readme user:krobison10");

let response;

searchGitHub(query)
    .then(data => {
        let arrayOfObjects = data.map(entry => Object.assign({}, entry));
        arrayOfObjects = arrayOfObjects.filter(entry => entry.fork === true);

        console.log(arrayOfObjects.length);
    })
    .catch(err => console.error(err));


