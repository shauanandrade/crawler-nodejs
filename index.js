const axios = require('axios');
const fs = require('fs');
const cheerio = require('cheerio');
const url = "https://neoxscans.net";

let data = [];
fetchData(url).then((response) => {
    const html = response.data;
    const $ = cheerio.load(html);
    // contar quantos box de mangar tem
    const listManga = $('#loop-content > div')
    if (listManga.length > 0) {
        let count = 0
        // percorrer todos os box de mangar
        for (let m = 0; m < listManga.length; m++) {
            // contar quanto box de mangar tem na linha
            let pathList = '#loop-content > div:nth-child(' + (m + 1) + ') > div > div'
            let listRow = $(pathList)
            if (listRow.length > 0) {
                let arCap = []
                // percorrer cada box de mangar um por um
                for (let lr = 0; lr < listRow.length; lr++) {
                    patch_manga = pathList+':nth-child(' + (lr + 1) + ') > div > div.item-summary'
                    let mangaItem = $(patch_manga)
                    // pegar dados do mangar
                    mangaItem.each(function(){
                        let title = $(this).find('div.post-title.font-title').find('h3').find('a').text()
                        data[count] = {
                            manga: title,
                            caps: []
                        }
                        // contar quanto box de capitulo exitem
                        let pathChapter = patch_manga+' > div.list-chapter > div'
                        let chapter = $(pathChapter)
                        //percorrer cada box do capitulo
                        for(let l=0;l<=chapter.length; l++){
                            let linkCap = $(pathChapter+':nth-child('+(l+1)+') > span.chapter.font-meta >  a')
                            // pegar informacoes do capitulo com texto e link
                            linkCap.each(function(){
                                let link = $(this).attr('href')
                                let text = $(this).text()
                                arCap[l] = 
                                data[count].caps[l] = {
                                    cap: text,
                                    links: link
                                }
                            })
                        }
                    })
                    count++
                }
            }
        }
    }
    let json = JSON.stringify(data);
    console.info(JSON.stringify(data))
    fs.writeFile('mangar_db.json',json,'utf8',function(err){
        if(err) return console.error(err)

        console.log('Opa deu certo');
    })
})

async function fetchData(url) {
    console.log('Crawling data...');

    let response = await axios(url).catch((err) => {
        console.error("Error Axios::", err)
    })

    if (response.status !== 200) {
        console.warn('Erro ocurred while fetching data');
        return;
    }

    return response;
}