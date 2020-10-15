
const axios = require("axios");
const cheerio = require("cheerio");
const bodyParser = require('body-parser');

const express = require("express");
const app = express();

const port = 4000;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())

// 서버가 읽을 수 있도록 HTML 의 위치를 정의해줍니다. 
app.set('views', __dirname + '/views'); 

// 서버가 HTML 렌더링을 할 때, EJS엔진을 사용하도록 설정합니다. 
app.set('view engine', 'ejs'); app.engine('html', require('ejs').renderFile);

app.get("/", function(request, response){

    response.render('index');
})

app.post("/search", function(request, response){
    console.log(request.body);
    let url = request.body.url;
    let limitDate = new Date(request.body.date);
    let count = 0;

    headers = {'user-agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0'};
    try{
        axios.get(url, headers=headers).then(function(html){
            
            //cheerio 라이브러리를 통해 html의 파싱된 데이터를 담아온다.
            const body = cheerio.load(html.data);
            console.log(body);

            //페이지의 리뷰개수를 가져온다.
            let reviewListTotal = body("#a-page").find("div#cm_cr-review_list").find("div.review").length;

            console.log(`리뷰 총 개수 :${reviewListTotal}`);

            for(let i = 0; i < reviewListTotal; i++){

                //문자열이 섞여 있는 문자열 타입의 멍청한 날짜
                let dummyStringDate = body("#a-page")
                            .find("div#cm_cr-review_list")
                            .find("div.review")[i]
                            .children[0]
                            .children[0]
                            .children[2]
                            .children[0].data;
                            
                //문자열 'on'을 기준으로 왼쪽의 데이터는 날림. 오른쪽 날짜 데이터만 가져옴(공백제거는 덤)
                let stringDate = dummyStringDate.split("on")[1].trim();

                // //문자열 타입의 날짜 -> Date 타입으로 바꿈 (날짜 비교연산을 위해)
                let date = new Date(stringDate);

                console.log(limitDate);
                console.log(date);
                if(limitDate < date){
                    count++;
                }
           
            }

            console.log(count);
            response.redirect('/');
        })
    }catch(e){
        console.log(e);
    }
    

    
});

app.listen(port, function(){
    console.log(`app is running on port : ${port}`);
})