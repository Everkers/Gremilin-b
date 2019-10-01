const axios = require('axios')
async function getChampById(key){
     const validChamp = []
    const dragon = `http://ddragon.leagueoflegends.com/cdn/9.3.1/data/en_US/champion.json`
    const res = await axios.get(dragon);
    const champs = res.data.data;
   const keys = Object.entries(champs)
   keys.forEach(item =>{
       item.forEach(champ=>{
           if(champ.key == key){
               validChamp.push(champ)
                }
            })
        })
return validChamp
}
module.exports = getChampById