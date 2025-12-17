const products = [
  {
    key:"iphone",
    name:"iPhone 15 Pro",
    image:"https://upload.wikimedia.org/wikipedia/commons/f/fa/IPhone_15_Pro.png",
    stores:[
      {name:"Amazon",price:4299,link:"https://amazon.ae"},
      {name:"Noon",price:4250,link:"https://noon.com"},
      {name:"Carrefour",price:4399,link:"https://carrefouruae.com"}
    ]
  },
  {
    key:"airfryer",
    name:"Philips Air Fryer",
    image:"https://upload.wikimedia.org/wikipedia/commons/6/6b/Air_fryer.jpg",
    stores:[
      {name:"Amazon",price:399,link:"https://amazon.ae"},
      {name:"Noon",price:379,link:"https://noon.com"},
      {name:"Carrefour",price:420,link:"https://carrefouruae.com"}
    ]
  },
  {
    key:"creatine",
    name:"Creatine Monohydrate",
    image:"https://upload.wikimedia.org/wikipedia/commons/5/5b/Creatine.png",
    stores:[
      {name:"Amazon",price:119,link:"https://amazon.ae"},
      {name:"Noon",price:115,link:"https://noon.com"},
      {name:"Carrefour",price:129,link:"https://carrefouruae.com"}
    ]
  }
];

let basket = JSON.parse(localStorage.getItem("basket")) || [];

function handleSearch(){
  const q = searchInput.value.toLowerCase();
  suggestions.innerHTML="";
  results.innerHTML="";
  hotDeals.style.display = q ? "none" : "block";

  if(!q){ suggestions.style.display="none"; return; }

  products.filter(p=>p.name.toLowerCase().includes(q)).forEach(p=>{
    const d=document.createElement("div");
    d.textContent=p.name;
    d.onclick=()=>openProduct(p.key);
    suggestions.appendChild(d);
  });
  suggestions.style.display="block";
}

function openProduct(key){
  const p = products.find(x=>x.key===key);
  const min = Math.min(...p.stores.map(s=>s.price));
  let html=`<div class="product-card"><h3>${p.name}</h3>
  <img src="${p.image}" width="100%">`;

  p.stores.forEach(s=>{
    html+=`
    <div class="store ${s.price===min?'best':''}">
      <span>${s.name}: ${s.price} AED ${s.price===min?'🏆':''}</span>
      <button onclick="window.open('${s.link}')">Buy</button>
    </div>`;
  });

  html+=`<button onclick="addToBasket('${p.key}')">Add to Basket</button></div>`;
  results.innerHTML=html;
}

function addToBasket(key){
  basket.push(key);
  localStorage.setItem("basket",JSON.stringify(basket));
  basketCount.textContent=basket.length;
}

function showBasket(){
  showPage("basketPage");
  basketItems.innerHTML = basket.map(k=>{
    const p=products.find(x=>x.key===k);
    return `<div>${p.name}</div>`;
  }).join("");
}

function showHome(){ showPage("homePage"); }
function showRewards(){ showPage("rewardsPage"); }
function showProfile(){ showPage("profilePage"); }

function showPage(id){
  document.querySelectorAll(".page,#homePage").forEach(p=>p.style.display="none");
  document.getElementById(id).style.display="block";
}
