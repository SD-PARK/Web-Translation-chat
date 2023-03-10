const axios = require('axios');
const qs = require('querystring');
const key = require('./key');
const descapeMap = require('./descapeMap');

class Papago {
    async lookup(source, target, term) {
        if (!term) { // 메세지가 없을 경우, '검색 용어 조회 인수로 제공되어야 합니다.'
            throw new Error('Search term should be provided as lookup arguments');
        } else if (source === target) { // 'source 언어와 target 언어는 달라야합니다.'
            console.log('The source language and the target language must be different.');
            return term;
        } else {
            const config = {
                headers: {
                    'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'x-naver-client-id': key.NAVER_CLIENT_ID,
                    'x-naver-client-secret': key.NAVER_CLIENT_SECRET,
                },
            };
            const params = qs.stringify({
                source: source,
                target: target,
                text: descapeMap(term)
            });
            const response = await axios.post('https://openapi.naver.com/v1/papago/n2mt', params, config);
            // console.log(response.data.message.result.translatedText.replace(/\"/g, ""));
            return response.data.message.result.translatedText;
            // try{
            
            // } catch (err) {
            //     return term;
            // }
        }
    }
}

module.exports = new Papago();