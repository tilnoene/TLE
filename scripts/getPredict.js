const axios = require('axios');

const config = require('../config.json');
const startedContest = require('./startedContest');

module.exports = async ( handle ) => {
    let dataResult = {
        status: 'FAIL'
    };

    let contest_id = null;
    
    await axios.get(`https://${config.api_upcoming_contests}/codeforces`)
        .then(response => response.data)
        .then(contests => contests.map(contest => {
            const name = contest.name;

            if (!contest_id && (name.includes('Div. 1') || name.includes('Div. 2'))) {
                const url = contest.url.split('/');
                contest_id = url[url.length-1];
            }
        }))
        .catch(() => console.log('[KONTESTS] An error occurred'));

    if (!contest_id) {
        console.log(`[Upcoming Contest] No contest found`);
        return;
    }
    
    // contest_id = last contest (or first upcoming contest)
    while (!await startedContest(contest_id))
        contest_id -= 1;

    await axios.get(`https://${config.api_predictor}/GetPartialRatingChangesServlet?contestId=${contest_id}&handles=${handle}`)
        .then(response => response.data)
        .then(data => data.result[0])
        .then(result => {
            dataResult.status = 'OK',
            dataResult.oldRating = result.oldRating,
            dataResult.newRating = result.newRating,
            dataResult.rank = result.rank
        })
        .catch(() => {
            console.log(`[Predictor] An error occurred while processing the handle ${handle}`)
        })

    return dataResult;
}