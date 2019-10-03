const axios =require('axios');
async function build(champ){
    const res = await axios.get(`http://arrax-lol.herokuapp.com/api/items/${champ}`)
    const data = res.data;
    return data
}
module.exports = build