const search_url="http://search.unbxd.io/fb853e3332f2645fac9d71dc63e09ec1/demo-unbxd700181503576558/search?&q={SEARCH_TERM}";
var paginationOffset=0;

window.onload= function() {
  fetchProductDetails("",isFetch=true);
  window.addEventListener('scroll',pageScrollListner);
};

function fetchProductDetails(searchTerm,isFetch=false,onScroll=false){
    let searchQueryParam = searchTerm ? searchTerm : '*';
    let searchUrl=search_url.replace('{SEARCH_TERM}',searchQueryParam);
        searchUrl=searchUrl+`&start=${paginationOffset}`;
    displayLoader();
    fetch(searchUrl)
        .then((resp) => resp.json())
        .then(function(data) {
            let offsetlen=data.response && data.response.products.length
            paginationOffset=paginationOffset + offsetlen;
            setTimeout(function () {
                if(isFetch){
                    displayFilters(data.facets)
                } else {
                    if (data.banner){
                        renderBanner(data.banner.banners)
                    }
                }
                displayProducts(data.response.products,onScroll);
                if(!onScroll){
                    if(searchTerm){
                        displayProductCount(data.response.numberOfProducts,searchTerm);
                    } else {
                        displayProductCount(data.response.numberOfProducts);
                    }
                }
            },100)
        })
        .catch(function(error) {
            console.log(error);
        });
}


function pageScrollListner () {
    if ((window.innerHeight + window.pageYOffset) >= document.body.offsetHeight) {
        let inputValue=document.getElementById('search').value;
        fetchProductDetails(inputValue,false,true);
    }
}


function renderBanner(banners) {
    if(banners.length > 0){
      document.getElementById('navigation-banner').innerHTML= `<img class="sale-image" src="${banners[0].imageUrl}">`;
    }
}


function displayLoader(){
    if(!document.getElementsByClassName('loader')){
        document.getElementById('product-row').innerHTML='<div class="loader"></div>';
    }
}

function displayProductCount(count,searchTerm='Items') {
    document.getElementById("product-count").innerHTML=`${searchTerm} - ${count} `;
}

function generateFacetFragment(facetName,facetCount) {
    return ` <li class="facet-value">
          <input type="checkbox" id="${facetName}" name="${facetName}" value="${facetName}">
          <label class="facet-type" for="${facetName}">${facetName}</label>
          <span class="count">(${facetCount})</span>
                    </li>`
}


function generateFacetList(facetValues){
    let facetValue='';
        facetValues && facetValues.forEach((facet,index)=>{
            if(index%2===0){
                facetValue=facetValue.concat(this.generateFacetFragment(facet,facetValues[index+1]));
            }
        })
    return facetValue;
}

function arrayCheckHelper(facetValues) {
    if(Array.isArray(facetValues)){
        return facetValues
    } else {
        return facetValues[Object.keys(facetValues)[0]];
    }
}
function generateFilterFragment(facet) {
    return `<div class="facet-container">
                <div class="facet-title">${facet.displayName}</div>
                <ul class="facet-list">
                    ${(generateFacetList(arrayCheckHelper(facet.values)))}
                </ul>
        </div>`
}

function generateProductFragment(product){
    return `<a href="${generateProductUrl(product.productId)}" target="_blank"><div class="product-column" >
        <img src="${product.productImage}"  height="250" width="200">
        <div class="product-name">${product.name}</div>
        <div class="product-price">${product.displayPrice}</div>
        </div></a>`
}


function generateProductUrl(productId) {
    return `http://demo-unbxd.unbxdapi.com/product?pid=${productId}`
}


function displayProducts(products, appendProducts=false){
    var productMarkup='';
    products.forEach((product)=>{
        productMarkup=productMarkup.concat(this.generateProductFragment(product));
    })
    if(appendProducts){
        document.getElementById('product-row').innerHTML = document.getElementById('product-row').innerHTML + productMarkup
    } else {
        document.getElementById('product-row').innerHTML=productMarkup;
    }
}

function displayFilters(facets){
    var facetMarkup=`<span class="close-icon" onclick="hideFilter()">X</span>`;
    Object.keys(facets).forEach(function(key) {
        if(facets[key] && facets[key].values &&facets[key].values.length >0){
          facetMarkup=facetMarkup.concat(generateFilterFragment(facets[key]))
       }
    });
    document.getElementById('filter-list').innerHTML=facetMarkup;
}


function showFilter(){
    document.getElementById('filter-list').style.display="block";
}

function hideFilter (){
    document.getElementById('filter-list').style.display="none";
}

const debounce = (func, delay) => {
    let timer
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timer);
        timer = setTimeout(() => func.apply(context, args.value), delay)
    }
}

function onSubmitSearch (){
    let inputValue=document.getElementById('search').value;
    if(inputValue){
        fetchProductDetails(inputValue);
    }
}
searchProducts=debounce(fetchProductDetails,3000);
