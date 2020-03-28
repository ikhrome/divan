const express = require('express')
const bodyParser = require('body-parser')
const axios = require('axios')
const crypto = require('crypto')

const app = express()
const port = 3000
const hookUrl = process.env['HOOK_URL']
const raids = require('./raids')

app.use(bodyParser.json())
app.use((req, res, next) => {
    if(req.body.token == process.env['SECRET_TOKEN']) {
        next()
    } else {
        res.json({status: 'unauthorized', 'description': 'Your passphrase is invalid!'})
        res.end()
    }
})

app.get('/', (req, res) => res.json({
    status: 'success',
    description: 'Divan vernite suki!'
}))

app.post('/hook', async (req, res) => {
    let hash = crypto.createHash('md5').update(Math.floor(new Date() / 1000).toString(2)).digest("hex")
    let avatarUrl = `https://api.adorable.io/avatars/170/${hash}.png`


    const request = await axios.get('http://names.drycodes.com/1')

    let username = request.data[0]

    let raid = raids[req.body.raid] ? raids[req.body.raid] : {
        title: 'Не указано',
        image: 'https://stats.bungie.net/img/destiny_content/pgcr/campaign_adieu.jpg'
    }

    axios.post(hookUrl, {
        avatar_url: avatarUrl,
        content: '',
        username: username,
        embeds: [{
            color: 16098851,
            thumbnail: {
                url: raid.image,
            },
            title: `${req.body.username} объявляет сбор в рейд ${raid.title}`,
            description: `Объявляется сбор в рейд!`,
            fields: [
                {
                    name: 'Дата',
                    value: req.body.date,
                    inline: true
                },
                {
                    name: 'Время',
                    value: req.body.time,
                    inline: true
                }
            ]
        }]
    })
    .then((response) => {
        res.json({status: 'success'})
    })
    .catch((error) => {
        res.json({status: 'error', stack: error})
    });
})

app.listen(port, () => console.log(`app listening on port ${port}!`))