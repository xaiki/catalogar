const storeVotes = votes => Object.entries(votes)
                                  .filter(([k]) => k !== 'NULL')
                                  .map(v => v.join(':')).join('|')
const extractVotes = votes => votes.split('|')
                                   .map(e => e.split(':'))
                                   .reduce((acc, [i, v]) => Object.assign({}, acc, {
                                       [i]: Number(v)
                                   }), {})
module.exports = { storeVotes, extractVotes }

//console.log(storeVotes({0: 1, 2: 3, 4: 5, 6: 7, '!': 320}))
//console.log(extractVotes('0:1|2:3|4:5|6:7'))
//console.log(extractVotes('!'))
