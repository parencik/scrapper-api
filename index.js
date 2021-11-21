const PORT = process.env.PORT || 8000
const express = require('express')
const axios = require('axios')
const cheerio = require('cheerio')
const app = express()

const searchWords = ["białoru", "granica", "granicy", "belarus", "łukaszenk"].map(word => {
    return `a:contains("${word}")`
});

let searchQuery = searchWords.join(", ");

const newspapers = [
    {
        name: "wp",
        address: "https://wiadomosci.wp.pl/tag/bia%C5%82oru%C5%9B",
        base: "https://wiadomosci.wp.pl"
    },
    {
        name: "wprost",
        address: "https://www.wprost.pl",
        base: ""
    },
    {
        name: 'rmf24',
        address: 'https://www.rmf24.pl',
        base: ''
    },
    {
        name: 'dorzeczy',
        address: 'https://www.dorzeczy.pl',
        base: ''
    },
    {
        name: 'tvn24',
        address: 'https://tvn24.pl',
        base: '',
    },
]

const articles = [];
promises = [];
newspapers.forEach(newspaper => {
    console.time(newspaper.name);
    promises.push(axios.get(newspaper.address))
    axios.get(newspaper.address)
        .then(response => {
            const html = response.data
            const $ = cheerio.load(html)
            $(searchQuery, html).each(function () {
                let title = $(this).text();
                const url = $(this).attr('href')
                if ((newspaper.base + url).startsWith("http")) {
                    articles.push({
                        title,
                        url: newspaper.base + url,
                        source: newspaper.name
                    })
                }
            })
        })
    console.timeEnd(newspaper.name);
})


app.get('/', (req, res) => {
    res.json('Welcome to polish-border crisis API')
})

app.get('/news', async (req, res) => {
    res.json(articles)
})

app.get('/news/:newspaperId', (req, res) => {
    const newspaperId = req.params.newspaperId

    const newspaperAddress = newspapers.filter(newspaper => newspaper.name == newspaperId)[0].address
    const newspaperBase = newspapers.filter(newspaper => newspaper.name == newspaperId)[0].base


    axios.get(newspaperAddress)
        .then(response => {
            const html = response.data
            const $ = cheerio.load(html)
            const specificArticles = []

            $(searchQuery, html).each(function () {
                const title = $(this).text()
                const url = $(this).attr('href')
                specificArticles.push({
                    title,
                    url: newspaperBase + url,
                    source: newspaperId
                })
            })
            res.json(specificArticles)
        }).catch(err => console.log(err))
})

app.listen(PORT, () => console.log("Server running on port", PORT))
