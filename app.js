const categories = [
  {id:'food', icon:'🍜', name:'食べる'},
  {id:'sightseeing', icon:'⛩️', name:'遊ぶ・観光'},
  {id:'shopping', icon:'🛍️', name:'買う'},
  {id:'stay', icon:'🏨', name:'泊まる'},
  {id:'mobility', icon:'🚌', name:'移動する'},
  {id:'life', icon:'🏥', name:'暮らす'},
  {id:'kids', icon:'🧸', name:'子育て・教育'},
  {id:'government', icon:'🏛️', name:'行政・手続き'},
  {id:'work', icon:'💼', name:'仕事・ビジネス'},
  {id:'safety', icon:'🚨', name:'防災・緊急'},
  {id:'events', icon:'🎪', name:'イベント'},
  {id:'community', icon:'🎟️', name:'お得・地域交流'}
];

const places = [
  {id:'sengen',name:'富士山本宮浅間大社',category:'sightseeing',address:'静岡県富士宮市宮町1-1',phone:'',site:'https://fuji-hongu.or.jp/sengen/',desc:'富士宮を代表する観光・文化スポット。市街地散策の起点にも使いやすい場所です。',lat:35.2274,lng:138.6104},
  {id:'whc',name:'静岡県富士山世界遺産センター',category:'sightseeing',address:'静岡県富士宮市宮町5-12',phone:'0544-21-3776',site:'',desc:'富士山の自然・文化・信仰を学べる施設。観光前の情報収集にも便利です。',lat:35.2268,lng:138.6077},
  {id:'shiraito',name:'白糸ノ滝',category:'sightseeing',address:'静岡県富士宮市上井出273-1',phone:'',site:'',desc:'富士山の湧水が流れ落ちる富士宮の代表的な景勝地です。',lat:35.3122,lng:138.5888},
  {id:'dada',name:'Cafe & Restaurant DADA PLUS',category:'food',address:'静岡県富士宮市大宮町4-5',phone:'0544-23-1385',site:'https://www.1cho-me.jp/dada-plus/',desc:'富士宮市街地で食事やカフェ利用ができるレストラン。',lat:35.2267,lng:138.6115},
  {id:'roku',name:'Roku cafe',category:'food',address:'静岡県富士宮市宮町14-3',phone:'0544-66-9775',site:'https://www.instagram.com/roku_cafe_/',desc:'浅間大社周辺の散策と組み合わせやすいカフェ。',lat:35.2290,lng:138.6098},
  {id:'mochiwa',name:'海鮮料理もちわ',category:'food',address:'静岡県富士宮市安居山703-20',phone:'0544-23-0296',site:'https://mochiwa.net/',desc:'海鮮料理を楽しめる地元店。',lat:35.2160,lng:138.5817},
  {id:'buffet',name:'ビュッフェレストランふじさん',category:'food',address:'静岡県富士宮市根原449-11',phone:'0544-29-5501',site:'https://www.buffet-restaurant-fujisan.com/',desc:'朝霧高原エリアで立ち寄りやすいビュッフェレストラン。',lat:35.4132,lng:138.5737},
  {id:'cityhall',name:'富士宮市役所',category:'government',address:'静岡県富士宮市弓沢町150',phone:'0544-22-1111',site:'https://www.city.fujinomiya.lg.jp/',desc:'各種行政手続き、生活情報、相談窓口の中心施設。',lat:35.2220,lng:138.6213},
  {id:'station',name:'富士宮駅',category:'mobility',address:'静岡県富士宮市中央町16',phone:'',site:'',desc:'JR身延線の主要駅。市街地観光やバス・タクシー利用の拠点です。',lat:35.2219,lng:138.6148},
  {id:'library',name:'富士宮市立中央図書館',category:'kids',address:'静岡県富士宮市宮町13-1',phone:'0544-26-5062',site:'',desc:'学習や子どもの読書、地域情報収集に使える公共施設。',lat:35.2293,lng:138.6109},
  {id:'hall',name:'富士宮市民文化会館',category:'events',address:'静岡県富士宮市宮町14-2',phone:'0544-23-1237',site:'',desc:'コンサートや地域イベントなどが行われる文化施設。',lat:35.2294,lng:138.6094},
  {id:'emergency',name:'富士宮市 救急・防災',category:'safety',address:'富士宮市',phone:'119',site:'https://www.city.fujinomiya.lg.jp/',desc:'緊急時は119。今後、避難所・AED・災害情報を現在地と連動して表示します。',lat:35.2220,lng:138.6213},
  {id:'work',name:'富士宮市 地域求人・事業者情報',category:'work',address:'富士宮市',phone:'',site:'',desc:'今後、地元企業の求人、創業支援、空き店舗、事業者向け情報をまとめます。',lat:35.2220,lng:138.6213},
  {id:'shopping',name:'富士宮市内 買い物情報',category:'shopping',address:'富士宮市',phone:'',site:'',desc:'スーパー、直売所、土産店、ドラッグストアなどを順次統合します。',lat:35.2250,lng:138.6120},
  {id:'life',name:'富士宮市 生活サービス',category:'life',address:'富士宮市',phone:'',site:'',desc:'病院、歯科、動物病院、美容、修理など暮らしの施設をまとめる入口です。',lat:35.2240,lng:138.6180},
  {id:'stay',name:'富士宮市内 宿泊情報',category:'stay',address:'富士宮市',phone:'',site:'',desc:'ホテル、旅館、民宿、キャンプ場、ペット可施設をまとめて探せるようにします。',lat:35.2300,lng:138.6050},
  {id:'community',name:'富士宮クーポン・スタンプ',category:'community',address:'富士宮市',phone:'',site:'',desc:'地域クーポン、デジタルスタンプ、店舗情報、地域交流機能をここに統合します。',lat:35.2260,lng:138.6120}
];

const modePriority = {
  resident:['life','shopping','government','safety','kids','mobility','events','food','work','community','sightseeing','stay'],
  visitor:['sightseeing','food','stay','mobility','events','shopping','community','safety','life','government','kids','work']
};

const categoryMap = Object.fromEntries(categories.map(c=>[c.id,c]));
const grid = document.getElementById('categoryGrid');
const cardsEl = document.getElementById('cards');
const titleEl = document.getElementById('resultsTitle');
const countEl = document.getElementById('resultCount');
const searchInput = document.getElementById('globalSearch');
const statusEl = document.getElementById('statusMessage');
const template = document.getElementById('cardTemplate');
const favoritesButton = document.getElementById('favoritesButton');
let activeCategory = null;
let userLocation = null;
let markers = [];
let userMarker = null;
let showFavoritesOnly = false;
let mode = localStorage.getItem('fujinomiya-mode') || 'resident';
let favorites = new Set(JSON.parse(localStorage.getItem('fujinomiya-favorites') || '[]'));

const map = L.map('map', {zoomControl:true}).setView([35.229,138.61], 12);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom:19,
  attribution:'&copy; OpenStreetMap contributors'
}).addTo(map);

categories.forEach(cat=>{
  const btn=document.createElement('button');
  btn.className='category-card';
  btn.type='button';
  btn.dataset.id=cat.id;
  btn.innerHTML=`<span class="icon">${cat.icon}</span><span class="name">${cat.name}</span>`;
  btn.addEventListener('click',()=>{
    activeCategory = activeCategory===cat.id ? null : cat.id;
    showFavoritesOnly=false;
    favoritesButton.classList.remove('active');
    syncCategoryState();
    applyFilters();
    document.getElementById('resultsSection').scrollIntoView({behavior:'smooth',block:'start'});
  });
  grid.appendChild(btn);
});

function syncCategoryState(){
  document.querySelectorAll('.category-card').forEach(b=>b.classList.toggle('active', b.dataset.id===activeCategory));
}

function saveFavorites(){
  localStorage.setItem('fujinomiya-favorites', JSON.stringify([...favorites]));
}

function haversine(a,b){
  const R=6371, rad=Math.PI/180;
  const dLat=(b.lat-a.lat)*rad, dLng=(b.lng-a.lng)*rad;
  const x=Math.sin(dLat/2)**2 + Math.cos(a.lat*rad)*Math.cos(b.lat*rad)*Math.sin(dLng/2)**2;
  return 2*R*Math.asin(Math.sqrt(x));
}

function routeUrl(place){
  if(userLocation){
    return `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${userLocation.lat}%2C${userLocation.lng}%3B${place.lat}%2C${place.lng}`;
  }
  return `https://www.openstreetmap.org/?mlat=${place.lat}&mlon=${place.lng}#map=16/${place.lat}/${place.lng}`;
}

function sortedByMode(items){
  if(userLocation){
    return [...items].sort((a,b)=>haversine(userLocation,a)-haversine(userLocation,b));
  }
  const order=modePriority[mode];
  return [...items].sort((a,b)=>order.indexOf(a.category)-order.indexOf(b.category));
}

function render(items){
  cardsEl.innerHTML='';
  markers.forEach(m=>map.removeLayer(m));
  markers=[];
  countEl.textContent=`${items.length}件`;

  if(!items.length){
    cardsEl.innerHTML='<div class="empty">該当する施設がありません。検索語・カテゴリー・お気に入り条件を変えてみてください。</div>';
    return;
  }

  const bounds=[];
  items.forEach(place=>{
    const node=template.content.cloneNode(true);
    node.querySelector('.category-pill').textContent=categoryMap[place.category]?.name || '施設';
    node.querySelector('h3').textContent=place.name;
    node.querySelector('.description').textContent=place.desc;
    node.querySelector('.meta').innerHTML=`<div>📍 ${place.address}</div>${place.phone?`<div>☎️ ${place.phone}</div>`:''}`;

    const distance=node.querySelector('.distance');
    if(userLocation) distance.textContent=`約 ${haversine(userLocation,place).toFixed(1)} km`;

    const favorite=node.querySelector('.favorite-btn');
    const updateFavorite=()=>{
      const on=favorites.has(place.id);
      favorite.classList.toggle('active',on);
      favorite.textContent=on?'♥':'♡';
      favorite.setAttribute('aria-label',on?'お気に入りから削除':'お気に入りに追加');
    };
    updateFavorite();
    favorite.addEventListener('click',()=>{
      favorites.has(place.id)?favorites.delete(place.id):favorites.add(place.id);
      saveFavorites();
      updateFavorite();
      if(showFavoritesOnly) applyFilters();
    });

    const contact=node.querySelector('.contact-actions');
    if(place.phone){
      const tel=document.createElement('a');
      tel.href=`tel:${place.phone.replace(/[^0-9+]/g,'')}`;
      tel.textContent='☎ 電話する';
      contact.appendChild(tel);
    }
    if(place.site){
      const site=document.createElement('a');
      site.href=place.site;
      site.target='_blank';
      site.rel='noopener';
      site.textContent='↗ 公式サイト';
      contact.appendChild(site);
    }

    const route=node.querySelector('.route-btn');
    route.href=routeUrl(place);
    route.textContent=userLocation?'現在地から行く':'場所を開く';

    node.querySelector('.map-btn').addEventListener('click',()=>{
      map.setView([place.lat,place.lng],16);
      const marker=markers.find(m=>m.options.title===place.name);
      if(marker) marker.openPopup();
      document.getElementById('mapSection').scrollIntoView({behavior:'smooth',block:'start'});
    });

    cardsEl.appendChild(node);
    const marker=L.marker([place.lat,place.lng],{title:place.name}).addTo(map).bindPopup(`<strong>${place.name}</strong><br>${place.address}`);
    markers.push(marker);
    bounds.push([place.lat,place.lng]);
  });

  if(items.length>1 && !userLocation) map.fitBounds(bounds,{padding:[24,24],maxZoom:13});
}

function applyFilters(){
  const raw=searchInput.value.trim();
  const q=raw.toLowerCase();
  let items=places.filter(p=>{
    const categoryOK=!activeCategory || p.category===activeCategory;
    const favoriteOK=!showFavoritesOnly || favorites.has(p.id);
    const hay=`${p.name} ${p.address} ${p.phone||''} ${p.desc} ${categoryMap[p.category]?.name||''}`.toLowerCase();
    return categoryOK && favoriteOK && (!q || hay.includes(q));
  });
  items=sortedByMode(items);

  if(showFavoritesOnly) titleEl.textContent='お気に入り';
  else if(activeCategory) titleEl.textContent=categoryMap[activeCategory].name;
  else if(raw) titleEl.textContent=`「${raw}」の検索結果`;
  else titleEl.textContent=mode==='resident'?'市民向けおすすめ':'観光向けおすすめ';

  render(items);
}

function locate(){
  if(!navigator.geolocation){statusEl.textContent='この端末では位置情報を利用できません。';return;}
  statusEl.textContent='現在地を取得しています…';
  navigator.geolocation.getCurrentPosition(pos=>{
    userLocation={lat:pos.coords.latitude,lng:pos.coords.longitude};
    if(userMarker) map.removeLayer(userMarker);
    userMarker=L.circleMarker([userLocation.lat,userLocation.lng],{radius:9,weight:3,fillOpacity:.82}).addTo(map).bindPopup('現在地');
    map.setView([userLocation.lat,userLocation.lng],13);
    userMarker.openPopup();
    statusEl.textContent='現在地を取得しました。距離の近い順に表示します。';
    applyFilters();
  },()=>{
    statusEl.textContent='位置情報を取得できませんでした。Safariの位置情報許可を確認してください。';
  },{enableHighAccuracy:true,timeout:10000,maximumAge:60000});
}

function updateModeUI(){
  const resident=mode==='resident';
  document.getElementById('modeIcon').textContent=resident?'🏠':'🗻';
  document.getElementById('modeLabel').textContent=resident?'市民':'観光';
  document.getElementById('heroModeBadge').textContent=resident?'市民モード':'観光モード';
  document.getElementById('modeTitle').textContent=resident?'暮らしに便利な情報を優先':'旅行に便利な情報を優先';
  document.getElementById('modeDescription').textContent=resident?'医療・買い物・行政・防災などを上位に表示します。':'観光・グルメ・宿泊・移動などを上位に表示します。';
  document.getElementById('modeStripButton').textContent=resident?'観光モードへ':'市民モードへ';
}

function toggleMode(){
  mode=mode==='resident'?'visitor':'resident';
  localStorage.setItem('fujinomiya-mode',mode);
  updateModeUI();
  statusEl.textContent=mode==='resident'?'市民モードに切り替えました。':'観光モードに切り替えました。';
  applyFilters();
}

function toggleFavorites(){
  showFavoritesOnly=!showFavoritesOnly;
  activeCategory=null;
  syncCategoryState();
  favoritesButton.classList.toggle('active',showFavoritesOnly);
  applyFilters();
  document.getElementById('resultsSection').scrollIntoView({behavior:'smooth',block:'start'});
}

document.getElementById('searchButton').addEventListener('click',()=>{showFavoritesOnly=false;favoritesButton.classList.remove('active');applyFilters();document.getElementById('resultsSection').scrollIntoView({behavior:'smooth',block:'start'});});
searchInput.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();document.getElementById('searchButton').click();}});
document.getElementById('nearbyButton').addEventListener('click',locate);
document.getElementById('mapLocateButton').addEventListener('click',locate);
document.getElementById('favoritesButton').addEventListener('click',toggleFavorites);
document.getElementById('bottomFavorite').addEventListener('click',toggleFavorites);
document.getElementById('showAllButton').addEventListener('click',()=>{
  activeCategory=null;showFavoritesOnly=false;searchInput.value='';favoritesButton.classList.remove('active');syncCategoryState();applyFilters();
});
document.getElementById('modeButton').addEventListener('click',toggleMode);
document.getElementById('modeStripButton').addEventListener('click',toggleMode);
document.getElementById('bottomMode').addEventListener('click',toggleMode);
document.getElementById('homeBrand').addEventListener('click',()=>document.getElementById('home').scrollIntoView({behavior:'smooth'}));
document.querySelectorAll('.bottom-nav [data-target]').forEach(btn=>btn.addEventListener('click',()=>{
  const target=document.getElementById(btn.dataset.target);
  if(target) target.scrollIntoView({behavior:'smooth',block:'start'});
  if(btn.dataset.target==='searchSection') setTimeout(()=>searchInput.focus({preventScroll:true}),450);
  if(btn.dataset.target==='mapSection') setTimeout(()=>map.invalidateSize(),400);
}));

updateModeUI();
applyFilters();
