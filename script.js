let basket = JSON.parse(localStorage.getItem("basket")) || [];
basketCount.textContent = basket.length;

/* NAVIGATION */
function goTo(pageId){
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById(pageId).classList.add("active");
}

/* SEARCH */
function handleSearch(){
  const q = searchInput.value.toLowerCase();
  suggestions.innerHTML="";
  results.innerHTML="";
  hotDeals.style.display = q ? "none" : "block";
  if(!q) return;

  products.filter(p=>p.name.toLowerCase().includes(q)).forEach(p=>{
    const d=document.createElement("div");
    d.textContent=p.name;
    d.onclick=()=>{ suggestions.innerHTML=""; openProduct(p.key); };
    suggestions.appendChild(d);
  });
}

/* PRODUCT VIEW */
function openProduct(key){
  const p = products.find(x=>x.key===key);
  const min = Math.min(...p.stores.map(s=>s.p));
  let html=`<div class="product-card"><img src="${p.image}"><h3>${p.name}</h3>`;
  p.stores.forEach(s=>{
    html+=`
    <div class="store ${s.p===min?'best':''}">
      <span>${s.n}: ${s.p} AED ${s.p===min?'🏆':''}</span>
      <button onclick="addToBasket('${p.name}','${s.n}',${s.p})">Add</button>
    </div>`;
  });
  html+=`</div>`;
  results.innerHTML=html;
}

/* BASKET LOGIC */
function addToBasket(name,store,price){
  basket.push({name,store,price});
  localStorage.setItem("basket",JSON.stringify(basket));
  basketCount.textContent=basket.length;
  alert("Added to basket 🎉");
}

function renderBasket(){
  basketItems.innerHTML="";
  const grouped={};

  basket.forEach((item,i)=>{
    if(!grouped[item.store]) grouped[item.store]=[];
    grouped[item.store].push({...item,index:i});
  });

  for(const store in grouped){
    let total=0;
    basketItems.innerHTML+=`<h3>${store}</h3>`;
    grouped[store].forEach(item=>{
      total+=item.price;
      basketItems.innerHTML+=`
        <div class="product-card">
          ${item.name} – ${item.price} AED
          <button onclick="removeItem(${item.index})">❌</button>
        </div>`;
    });
    basketItems.innerHTML+=`<strong>Total: ${total} AED</strong>`;
  }
}

function removeItem(i){
  basket.splice(i,1);
  localStorage.setItem("basket",JSON.stringify(basket));
  basketCount.textContent=basket.length;
  renderBasket();
}

/* PROFILE */
function saveProfile(){
  localStorage.setItem("profile",JSON.stringify({
    name:nameInput.value,
    email:emailInput.value,
    phone:phoneInput.value
  }));
  profileSaved.textContent="Saved ✅";
}

/* AUTO LOAD */
document.addEventListener("DOMContentLoaded",()=>{
  goTo("homePage");
  renderBasket();
});
