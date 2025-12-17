const products = [
  {key:"iphone",name:"iPhone 15 Pro",stores:[{n:"Amazon",p:4299,l:"https://amazon.ae"},{n:"Noon",p:4250,l:"https://noon.com"},{n:"Carrefour",p:4399,l:"https://carrefouruae.com"}]},
  {key:"airfryer",name:"Philips Air Fryer",stores:[{n:"Amazon",p:399,l:"https://amazon.ae"},{n:"Noon",p:379,l:"https://noon.com"},{n:"Carrefour",p:420,l:"https://carrefouruae.com"}]},
  {key:"creatine",name:"Creatine Monohydrate",stores:[{n:"Amazon",p:119,l:"https://amazon.ae"},{n:"Noon",p:115,l:"https://noon.com"},{n:"Carrefour",p:129,l:"https://carrefouruae.com"}]},
  {key:"tv",name:"Samsung Smart TV"},
  {key:"ps5",name:"PlayStation 5"},
  {key:"ipad",name:"iPad Pro"},
  {key:"watch",name:"Apple Watch"},
  {key:"laptop",name:"Gaming Laptop"},
  {key:"headphones",name:"Sony Headphones"},
  {key:"coffee",name:"Coffee Machine"}
];

let basket = JSON.parse(localStorage.getItem("basket")) || [];

basketCount.textContent = basket.length;

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
  if(!p.stores){ results.innerHTML=`<div class="product-card">Coming soon</div>`; return;}
  const min = Math.min(...p.stores.map(s=>s.p));

  let html=`<div class="product-card"><h3>${p.name}</h3>`;
  p.stores.forEach(s=>{
    html+=`
    <div class="store ${s.p===min?'best':''}">
      <span>${s.n}: ${s.p} AED ${s.p===min?'🏆':''}</span>
      <button onclick="window.open('${s.l}')">Buy</button>
    </div>`;
  });
  html+=`<button onclick="addToBasket('${key}')">Add to Basket</button></div>`;
  results.innerHTML=html;
}

function addToBasket(key){
  basket.push(key);
  localStorage.setItem("basket",JSON.stringify(basket));
  basketCount.textContent=basket.length;
}

function showBasket(){
  showPage("basketPage");
  const grouped={};
  basket.forEach(k=>{
    const p=products.find(x=>x.key===k);
    p.stores.forEach(s=>{
      grouped[s.n]=(grouped[s.n]||0)+s.p;
    });
  });
  basketItems.innerHTML = Object.entries(grouped).map(([s,t])=>`
    <div class="card">${s}: <strong>${t} AED</strong></div>
  `).join("");
}

function saveName(){
  localStorage.setItem("username",usernameInput.value);
  savedName.textContent="Saved: "+usernameInput.value;
}

function showHome(){ showPage("homePage"); }
function showRewards(){ showPage("rewardsPage"); }
function showProfile(){ showPage("profilePage"); }

function showPage(id){
  document.querySelectorAll(".page,#homePage").forEach(p=>p.style.display="none");
  document.getElementById(id).style.display="block";
}
