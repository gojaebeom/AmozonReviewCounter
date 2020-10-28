/* DOM 그리기 🎨 */
document.body.style.display = "flex";
document.body.style.flexDirection = "column";
document.body.style.justifyContent = "center";
document.body.style.alignItems = "center";
document.body.style.height = "100vh";
document.body.style.background = "linear-gradient(#00e4d0, #5983e8)";
document.body.innerHTML = `
<form id="bestForm" style="width:800px;padding:12px;border-radius:5px;background:#FFFFFF;">
    <h1 style="color:'#2E2E2E';margin:10px 0px 20px 0px;">아마존 베스트 상품 크롤러 2.0 🎲</h1>
    <label for="bestUrl">Best 상품 URL 20개 추출하기(선택)</label>
    <input id="bestUrl" style="width:100%;padding:12px 8px;border: 1px solid #BDBDBD;border-radius:3px;"><br><br>
    <label for="date">제한날짜를 입력하세요</label>
    <input id="date" type="date" style="width:30%;padding:12px 8px;border: 1px solid #BDBDBD;border-radius:3px;">
    <button type="button" id="bestButton" style="padding:8px 15px;border:none;border-radius:3px;background:#084B8A;color:white;font-weight:bold;">추출하기</button>
    <br>
    <br>
    <label for="date">상품번호를 클릭하면 해당 상품페이지로 이동합니다.</label>
    <table style="border-collapse:collapse;border: 1px solid #BDBDBD;width:100%;">
        <tr>
            <th style="border: 1px solid #BDBDBD;padding:8px;">No</th>
            <th style="border: 1px solid #BDBDBD;padding:8px;">상품번호</th>
            <th style="border: 1px solid #BDBDBD;padding:8px;">가격</th>
            <th style="border: 1px solid #BDBDBD;padding:8px;">전체리뷰수</th>
            <th style="border: 1px solid #BDBDBD;padding:8px;">검색리뷰수</th>
            <th style="border: 1px solid #BDBDBD;padding:8px;">채널이름</th>
            <th style="border: 1px solid #BDBDBD;padding:8px;">카테고리</th>
        </tr>
        <tbody id="productIdTbody" style="max-height:300px;overflow:hidden;"></tbody>
    </table>
</form>
<div id="bestIframeWrap" style="display:none"></div>
<div id="reviewIframeWrap" style="display:none"></div>
<div id="submitIframeWrap"></div>
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
async function getReviewCount(URL, page, myDate, code) 
{
    return new Promise((resolve, reject) => 
    {
        bestButton.textContent = `[${code}] 상품의 [${page}] 페이지 조회중..`;
        let iframe = document.createElement("iframe");
        iframe.src = `${URL}pageNumber=${page}`;
        iframe.setAttribute(`id`, `iframe${page}`);
        document.getElementById("reviewIframeWrap").appendChild(iframe);

        document.getElementById(`iframe${page}`).onload = () => 
        {
            let count = 0;
            let review = iframe.contentWindow.document.getElementsByClassName("review");
            //제조사 가져오는 코드
            let channelName = iframe.contentWindow.document.querySelector("#cr-arp-byline > a").textContent;
            for (let i = 0; i < review.length; i++) 
            {
                //날짜가 섞여있는 멍청한 데이터
                let dummyStringDate = review[i].getElementsByClassName('review-date')[0].textContent;
                //문자를 걸러낸 날짜만 할당, 앞뒤 공백제거
                let stringDate = dummyStringDate.split("on")[1].trim();
                //날짜 비교연산을 사용하기 위해 Date 타입으로 변경
                let date = new Date(stringDate);

                //console.log(`%c 리뷰 날짜 : ${date}`, `color:red`);
                //console.log(`%c 사용자 지정 날짜 : ${myDate}`, `color:blue`);

                if (myDate <= date) 
                {
                    count++;
                } else 
                {
                    console.log('%c 검색 조건 완료 🍳', 'color:blue');
                    break;
                }
            }
            resolve({count, channelName});

        };
    })
}

/* 크롤링 시작함수 🚀 */
async function reviewCrawler(url, date, code, func) 
{
    let myDate = new Date(date);
    myDate.setDate(myDate.getDate() - 1);
    const URL = url.split("pageNumber=")[0];

    let searchReviews = 0; // 검색한 리뷰 수
    let page = 1;
    let _channelName;
    

    while (true) 
    {
        let {count, channelName} = await getReviewCount(URL, page, myDate, code);
        searchReviews += count;
        if (count < 10) 
        {
            _channelName = channelName;
            break;
        }
        ++page;
    }

    func(searchReviews, _channelName);
}

/* 베스트 페이지의 상품정보 불러오는 함수 ⛽ */
async function getBestProductList(URL, date) 
{
    return new Promise((resolve, reject) => 
    {
        bestButton.textContent = `상품정보 추출중..`;

        let iframe = document.createElement("iframe");
        iframe.src = URL;
        iframe.setAttribute(`id`, `bestPage`);
        document.getElementById("bestIframeWrap").appendChild(iframe);
        
        document.getElementById(`bestPage`).onload = () => 
        {
            //카테고리 가져오는 코드
            let category = document.getElementById(`bestPage`).contentWindow.document.querySelector(".zg_selected").textContent;
            
            let products = [];
            for (let i = 1; i <= 21; i++) 
            {
                if (document.getElementById(`bestPage`).contentWindow.document.querySelector("#zg-ordered-list > li:nth-child(" + i + ") > span > div > span > a") !== null &&
                    document.getElementById(`bestPage`).contentWindow.document.querySelector("#zg-ordered-list > li:nth-child(" + i + ") > span > div > span > a > div") !== null &&
                    document.getElementById(`bestPage`).contentWindow.document.querySelector("#zg-ordered-list > li:nth-child(" + i + ") > span > div > span > div.a-row > a > span > span") !== null &&
                    document.getElementById(`bestPage`).contentWindow.document.querySelector("#zg-ordered-list > li:nth-child(" + i + ") > span > div > span > div.a-icon-row.a-spacing-none > a.a-size-small.a-link-normal") !== null
                    ) 
                    {
                    products.push({
                        "code": document.getElementById(`bestPage`).contentWindow.document.querySelector("#zg-ordered-list > li:nth-child(" + i + ") > span > div > span > a").href.split('dp/')[1].split('/')[0],
                        "title": document.getElementById(`bestPage`).contentWindow.document.querySelector("#zg-ordered-list > li:nth-child(" + i + ") > span > div > span > a > div").textContent,
                        "price": document.getElementById(`bestPage`).contentWindow.document.querySelector("#zg-ordered-list > li:nth-child(" + i + ") > span > div > span > div.a-row > a > span > span").textContent.replaceAll("US$", ""),
                        "total": document.getElementById(`bestPage`).contentWindow.document.querySelector("#zg-ordered-list > li:nth-child(" + i + ") > span > div > span > div.a-icon-row.a-spacing-none > a.a-size-small.a-link-normal").textContent
                    })
                }
            }
            resolve({products, category});
        }


    });
}

/* 베스트 상품 추출 버튼 클릭 이벤트 👆 */
bestButton.onclick = async () => 
{

    console.log('상품 탐색!');

    //이전 상품번호리스트 초기화
    productIdTbody.innerHTML = '';

    //URL과 DATE input의 값이 없으면 경고
    if (!bestUrlInput.value) 
    {
        alert("URL은 필수값입니다 😐");
        return false;
    }

    //베스트 상품리스트 실행 후 결과 받기
    let {products, category} = await getBestProductList(bestUrlInput.value);
    
    let _searchReviews = 0;
    let _channelName;
    for (let i = 0; i < products.length; i++) 
    {
        //크롤링 함수 실행
        await reviewCrawler(
            `https://www.amazon.com/-/ko/Acer-Display-Graphics-Keyboard-A515-43-R19L/product-reviews/${products[i].code}/ref=cm_cr_arp_d_viewopt_srt?ie=UTF8&reviewerType=all_reviews&sortBy=recent&pageNumber=1`,
            dateInput.value,
            products[i].code,
            (searchReviews, channelName)=>
            {
                _searchReviews = searchReviews;
                _channelName = channelName;

                //review iframe 제거
                const reviewIframWrap = document.getElementById("reviewIframeWrap");
                while (reviewIframWrap.hasChildNodes()) 
                {
                    reviewIframWrap.removeChild(reviewIframWrap.firstChild);
                }
            }
        );
        

        productIdTbody.innerHTML += `
        <tr style="font-size:18px;">
            <td style="border: 1px solid #BDBDBD;text-align:center;padding:8px;">${i + 1}</td>
            <td  class="copy" style="border: 1px solid #BDBDBD;text-align:center;padding:8px; cursor:pointer;" 
            onclick="urlMapping(this, ${i + 1})"
            >
                <a>${products[i].code}</a>
                <span style="display:none;">${products[i].price}</span>
            </td>
            <td style="border: 1px solid #BDBDBD;text-align:center;padding:8px;">
                ${products[i].price}
            </td>
            <td style="border: 1px solid #BDBDBD;text-align:center;padding:8px;">
                ${products[i].total}
            </td>
            <td style="border: 1px solid #BDBDBD;text-align:center;padding:8px;">
                ${_searchReviews}
            </td>
            <td style="border: 1px solid #BDBDBD;text-align:center;padding:8px;">
                ${_channelName}
            </td>
            <td style="border: 1px solid #BDBDBD;text-align:center;padding:8px;">
                ${category}
            </td>
        </tr>
        `;

        console.table(
        {
            '상품이름':products[i].title,
            '상품번호':products[i].code,
            '가격':products[i].price,
            '전체리뷰수':products[i].total,
            '검색리뷰수':_searchReviews,
            '채널이름':_channelName,
            "카테고리":category
        });
    }

    bestUrlInput.value = '';
    bestButton.textContent = `추출하기`;

    //best iframe 제거
    const bestIframeWrap = document.getElementById("bestIframeWrap");
    while (bestIframeWrap.hasChildNodes()) {
        bestIframeWrap.removeChild(bestIframeWrap.firstChild);
    }
}

/*ProductId -> 크롤링 url Input의 value에 할당 🚀*/
function urlMapping(product, i) {
    console.log(`%c [${i}] 번째 상품번호를 조회하였습니다 🚀`, `color:#A901DB`);
    //productIdTd.textContent = data.children[0].textContent;
    window.open(`
    https://www.amazon.com/-/ko/Acer-Display-Graphics-Keyboard-A515-43-R19L/product-reviews/${product.children[0].textContent}/ref=cm_cr_arp_d_viewopt_srt?ie=UTF8&reviewerType=all_reviews&sortBy=recent&pageNumber=1`);
}