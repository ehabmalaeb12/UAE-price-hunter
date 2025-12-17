const products = [
  {key:"iphone",name:"iPhone 15 Pro",image:"images/iphone.jpg",stores:[
    {n:"Amazon",p:4299,l:"https://amazon.ae"},
    {n:"Noon",p:4250,l:"https://noon.com"},
    {n:"Carrefour",p:4399,l:"https://carrefouruae.com"}
  ]},
  {key:"airfryer",name:"Philips Air Fryer",image:"images/airfryer.jpg",stores:[
    {n:"Amazon",p:399,l:"https://amazon.ae"},
    {n:"Noon",p:379,l:"https://noon.com"},
    {n:"Carrefour",p:420,l:"https://carrefouruae.com"}
  ]},
  {key:"creatine",name:"Creatine",image:"images/creatine.jpg",stores:[
    {n:"Amazon",p:119,l:"https://amazon.ae"},
    {n:"Noon",p:115,l:"https://noon.com"},
    {n:"Carrefour",p:129,l:"https://carrefouruae.com"}
  ]},
  {key:"tv",name:"Samsung Smart TV",image:"images/tv.jpg"},
  {key:"ps5",name:"PlayStation 5",image:"images/ps5.jpg"},
  {key:"ipad",name:"iPad Pro",image:"images/ipad.jpg"},
  {key:"watch",name:"Apple Watch",image:"images/watch.jpg"},
  {key:"laptop",name:"Gaming Laptop",image:"images/laptop.jpg"},
  {key:"headphones",name:"Sony Headphones",image:"images/headphones.jpg"},
  {key:"coffee",name:"Coffee Machine",image:"images/coffee.jpg"}
];

let basket = JSON.parse(localStorage.getItem("basket")) || [];
basketCount.textContent = basket.length;

function handleSearch(){
  const q = searchInput.value.toLowerCase();
  suggestions.innerHTML = "";
  results.innerHTML = "";
  hotDeals.style.display = q ? "none" : "block";

  if(!q) return;

  products.filter(p=>p.name.toLowerCase().includes(q)).forEach(p=>{
    const d=document.createElement("div");
    d.textContent=p.name;
    d.onclick=()=>{ suggestions.innerHTML=""; openProduct(p.key); };
    suggestions.appendChild(d);
  });
}

function openProduct(key){
  const p = products.find(x=>x.key===key);
  if(!p.stores){
    results.innerHTML=`<div class="product-card"><img src="${p.image}"><h3>${p.name}</h3><p>Comparison coming soon</p></div>`;
    return;
  }

  const min = Math.min(...p.stores.map(s=>s.p));
  let html=`<div class="product-card"><img src="${p.image}"><h3>${p.name}</h3>`;

  p.stores.forEach(s=>{
    html+=`
    <div class="store ${s.p===min?'best':''}">
      <span>${s.n}: ${s.p} AED ${s.p===min?'🏆':''}</span>
      <div>
        <button onclick="window.open('${s.l}')">Buy</button>
        <button onclick="addToBasket('${p.key}','${s.n}',${s.p})">Add</button>
      </div>
    </div>`;
  });

  html+=`</div>`;
  results.innerHTML=html;
}

function addToBasket(key,store,price){
  basket.push({key,store,price});
  localStorage.setItem("basket",JSON.stringify(basket));
  basketCount.textContent=basket.length;
  alert("Added to basket 🎉");
}

function openBasket(){
  showPage("basketPage");
  basketItems.innerHTML="";
  basket.forEach((i,idx)=>{
    basketItems.innerHTML+=`
      <div class="product-card">
        <p>${i.key} - ${i.store} - ${i.price} AED</p>
        <button onclick="removeItem(${idx})">Delete</button>
      </div>`;
  });
}

function removeItem(i){
  basket.splice(i,1);
  localStorage.setItem("basket",JSON.stringify(basket));
  openBasket();
  basketCount.textContent=basket.length;
}

function saveProfile(){
  localStorage.setItem("profile",JSON.stringify({
    name:nameInput.value,
    email:emailInput.value,
    phone:phoneInput.value
  }));
  profileSaved.textContent="Saved ✅";
}

function showHome(){ showPage(null); }
function showRewards(){ showPage("rewardsPage"); }
function showProfile(){ showPage("profilePage"); }

function showPage(id){
  document.querySelectorAll(".page").forEach(p=>p.style.display="none");
  hotDeals.style.display="block";
  if(id) document.getElementById(id).style.display="block";
}
