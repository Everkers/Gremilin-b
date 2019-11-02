const axios = require('axios')
async function getChampByName(name){
     const validChamp = []
     const name_a = new RegExp(name , 'gi')
    const dragon = `http://ddragon.leagueoflegends.com/cdn/9.19.1/data/en_US/champion.json`
    const res = await axios.get(dragon);
    const champs = res.data.data;
    const names = Object.entries(champs)
    names.forEach(item =>{
       item.forEach(champ=>{
           const champ_name = champ.name
           if(champ_name == undefined ){
               return
           }
           else if(champ_name.match(name_a)){ 
               validChamp.push({about:champ.blurb, image:{full:champ.image.full , sprite:champ.image.sprite}})
           }
        })
     })
     return validChamp
}
module.exports = getChampByName