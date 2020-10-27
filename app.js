/* DOM 그리기 🎨 */
document.body.style.display = "flex";
document.body.style.flexDirection = "column";
document.body.style.justifyContent = "center";
document.body.style.alignItems = "center";
document.body.style.height = "100vh";
document.body.style.background = "linear-gradient(#00e4d0, #5983e8)";
document.body.innerHTML = `
<form id="bestForm" style="width:600px;padding:12px;border-radius:5px;background:#FFFFFF;">
    <h1 style="color:'#2E2E2E';margin:10px 0px 20px 0px;">아마존 베스트 상품 URL 추출기 🎲</h1>
    <label for="bestUrl">Best 상품 URL 20개 추출하기(선택)</label>
    <input id="bestUrl" style="width:100%;padding:12px 8px;border: 1px solid #BDBDBD;border-radius:3px;"><br><br>
    <button type="button" id="bestButton" style="padding:8px 15px;border:none;border-radius:3px;background:#084B8A;color:white;font-weight:bold;">추출하기</button>
    <br>
    <br>
    <label for="date">상품번호를 클릭하면 크롤러에 해당 URL을 연결합니다.</label>
    <table style="border-collapse:collapse;border: 1px solid #BDBDBD;width:100%;">
        <tr>
            <th style="border: 1px solid #BDBDBD;padding:8px;">No</th>
            <th style="border: 1px solid #BDBDBD;padding:8px;">상품번호</th>
            <th style="border: 1px solid #BDBDBD;padding:8px;">처리상태</th>
        </tr>
        <tbody id="productIdTbody" style="max-height:300px;overflow:hidden;"></tbody>
    </table>
</form>
<form id="form" style="width:600px;padding:12px;border-radius:5px;background:#FFFFFF;">
    <h1 style="color:'#2E2E2E';margin:10px 0px 20px 0px;">아마존 리뷰 크롤러 🍰</h1>
    <label for="url">URL을 입력하세요</label>
    <input id="url" style="width:100%;padding:12px 8px;border: 1px solid #BDBDBD;border-radius:3px;"><br><br>
    <label for="date">제한날짜를 입력하세요</label>
    <input id="date" type="date" style="width:30%;padding:12px 8px;border: 1px solid #BDBDBD;border-radius:3px;">
    <button type="button" id="button" style="padding:8px 15px;border:none;border-radius:3px;background:#5F04B4;color:white;font-weight:bold;">탐색하기</button>
    <br>
    <br>
    <label for="date">탐색한 데이터를 확인하세요</label>
    <table style="border-collapse:collapse;border: 1px solid #BDBDBD;width:100%;">
        <tr>
            <th style="border: 1px solid #BDBDBD;padding:8px;">상품번호</th>
            <th style="border: 1px solid #BDBDBD;padding:8px;">금액</th>
            <th style="border: 1px solid #BDBDBD;padding:8px;">리뷰 수(클릭시 복사가능)</th>
        </tr>
        <tr style="font-size:18px;">
            <td id="productId" style="border: 1px solid #BDBDBD;text-align:center;padding:8px;">🍕</td>
            <td id="productPrice" style="border: 1px solid #BDBDBD;text-align:center;padding:8px;">🍔</td>
            <td id="totalReview" class="copy" style="border: 1px solid #BDBDBD;text-align:center;padding:8px; cursor:pointer;">🍟</td>
        </tr>
    </table>
</form>
<div id="bestIframeWrap" style="display:none"></div>
<div id="reviewIframeWrap" style="display:none"></div>
`;


/* 생성된 DOM을 참조 ✨  */
const bestForm = document.getElementById("bestForm");
const bestUrlInput = document.getElementById("bestUrl");
const bestButton = document.getElementById("bestButton");
const productIdTbody = document.getElementById("productIdTbody");

const form = document.getElementById("form");
const urlInput = document.getElementById("url");
const dateInput = document.getElementById("date");
const button = document.getElementById("button");

const productIdTd = document.getElementById("productId");
const productPriceTd = document.getElementById("productPrice");
const totalReviewTd = document.getElementById("totalReview");


/* 리뷰 카운터 함수 🌈 */
async function getReviewCount(URL, page, myDate){
    return new Promise((resolve, reject)=>{
        button.textContent = `${page} 페이지 조회중..`;
        let iframe = document.createElement("iframe");
        iframe.src = `${URL}pageNumber=${page}`;
        iframe.setAttribute(`id`,`iframe${page}`);
        document.getElementById("reviewIframeWrap").appendChild(iframe);

        document.getElementById(`iframe${page}`).onload =  ()=>{
            let count = 0;
            let review = iframe.contentWindow.document.getElementsByClassName("review");
            for(let i = 0; i < review.length; i++){
                //날짜가 섞여있는 멍청한 데이터
                let dummyStringDate = review[i].getElementsByClassName('review-date')[0].textContent;
                //문자를 걸러낸 날짜만 할당, 앞뒤 공백제거
                let stringDate = dummyStringDate.split("on")[1].trim();
                //날짜 비교연산을 사용하기 위해 Date 타입으로 변경
                let date = new Date(stringDate);
                
                //console.log(`%c 리뷰 날짜 : ${date}`, `color:red`);
                //console.log(`%c 사용자 지정 날짜 : ${myDate}`, `color:blue`);

                if(myDate <= date){
                    count++;
                }else{
                    console.log('%c 검색 조건 완료 🍳', 'color:blue');
                    break;
                }
            }
            resolve(count);
        };
    })
} 

/* 크롤링 시작함수 🚀 */
async function reviewCrawler(url ,date , func){
    let myDate = new Date(date);
    myDate.setDate(myDate.getDate()-1);
    const URL = url.split("pageNumber=")[0];
    let total = 0;
    let page = 1;
    
    while(true){
        let count = await getReviewCount(URL, page, myDate);
        total += count;

        if(count < 10){
            break;
        }
        ++page;
    }

    func(total)
}


/* 리뷰 크롤러 탐색 버튼 클릭 이벤트 👆 */
button.onclick = ()=> {

    //console.log('데이터 탐색!');

    //URL과 DATE input의 값이 없으면 경고
    if(!urlInput.value || !dateInput.value){
        alert("URL과 제한 날짜는 필수값입니다 😐");
        return false;
    }

    //크롤링 함수 실행
    reviewCrawler(
        urlInput.value,
        dateInput.value,
        function(total){
            console.table({"검색된 리뷰 수 ":total});

            urlInput.value = '';
            button.textContent = `탐색`;
            totalReviewTd.textContent = total;
            productPriceTd.textContent = total;

            //만들었던 iframe들을 제거(초기화)해주어야 한다.
            const reviewIframWrap = document.getElementById("reviewIframeWrap");
            while(reviewIframWrap.hasChildNodes()){
                reviewIframWrap.removeChild(reviewIframWrap.firstChild);
            }
            console.log("iframe 삭제 완료");
        }
    );
}


/* 베스트 페이지의 상품정보 불러오는 함수 ⛽ */
async function getBestProductList(URL){
    return new Promise((resolve, reject)=>{
        bestButton.textContent = `상품정보 추출중..`;

        let iframe = document.createElement("iframe");
        iframe.src = URL;
        iframe.setAttribute(`id`,`bestPage`);
        document.getElementById("bestIframeWrap").appendChild(iframe);

        document.getElementById(`bestPage`).onload = ()=> 
        {
            let products = [];
            for(let i = 1; i <= 21; i++)
            {
                if(document.getElementById(`bestPage`).contentWindow.document.querySelector("#zg-ordered-list > li:nth-child("+i+") > span > div > span > a") !== null 
                && document.getElementById(`bestPage`).contentWindow.document.querySelector("#zg-ordered-list > li:nth-child("+i+") > span > div > span > a > div") !== null 
                && document.getElementById(`bestPage`).contentWindow.document.querySelector("#zg-ordered-list > li:nth-child("+i+") > span > div > span > div.a-row > a > span > span") !== null)
                {
                    products.push(
                    {
                        "code" :document.getElementById(`bestPage`).contentWindow.document.querySelector("#zg-ordered-list > li:nth-child("+i+") > span > div > span > a").href.split('dp/')[1].split('/')[0],
                        "title":document.getElementById(`bestPage`).contentWindow.document.querySelector("#zg-ordered-list > li:nth-child("+i+") > span > div > span > a > div").textContent, 
                        "price":document.getElementById(`bestPage`).contentWindow.document.querySelector("#zg-ordered-list > li:nth-child("+i+") > span > div > span > div.a-row > a > span > span").textContent.replaceAll("US$","")
                    })
                }
            }
            resolve(products);
        }
        
    });
}



/* 베스트 상품 추출 버튼 클릭 이벤트 👆 */
bestButton.onclick = async ()=> {

    console.log('상품 탐색!');

    //이전 상품번호리스트 초기화
    productIdTbody.innerHTML = '';

    //URL과 DATE input의 값이 없으면 경고
    if(!bestUrlInput.value){
        alert("URL은 필수값입니다 😐");
        return false;
    }

    //베스트 상품리스트 실행 후 결과 받기
    let data =  await getBestProductList(bestUrlInput.value);
    console.log(data);
    
    document.body.style.height = "120vh";
    for(let i=0; i<data.length; i++){
        productIdTbody.innerHTML += `
        <tr style="font-size:18px;">
            <td style="border: 1px solid #BDBDBD;text-align:center;padding:8px;">${i}</td>
            <td  class="copy" style="border: 1px solid #BDBDBD;text-align:center;padding:8px; cursor:pointer;" 
            onclick="urlMapping(this, ${i})"
            >
                <a>${data[i].code}</a>
                <span style="display:none;">${data[i].price}</span>
            </td>
            <td style="border: 1px solid #BDBDBD;text-align:center;padding:8px;">
                처리완료
            </td>
        </tr>
        `
    }

    bestButton.textContent = `추출하기`;

    //만들었던 iframe들을 제거(초기화)해주어야 한다.
    const bestIframeWrap = document.getElementById("bestIframeWrap");
    while(bestIframeWrap.hasChildNodes()){
        bestIframeWrap.removeChild(bestIframeWrap.firstChild);
    }
    console.log("iframe 삭제 완료");
}

/*ProductId -> 크롤링 url Input의 value에 할당 🚀*/
function urlMapping(data, i){
    console.log(`%c [${i}] 번째 상품번호를 조회하였습니다 🚀`,`color:#A901DB`);
    urlInput.value = `
    https://www.amazon.com/-/ko/Acer-Display-Graphics-Keyboard-A515-43-R19L/product-reviews/${data.children[0].textContent}/ref=cm_cr_arp_d_viewopt_srt?ie=UTF8&reviewerType=all_reviews&sortBy=recent&pageNumber=1`
    productIdTd.textContent = data.children[0].textContent;
    productPriceTd.textContent = data.children[1].textContent;
}


