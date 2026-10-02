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
  {name:'富士山本宮浅間大社', category:'sightseeing', address:'静岡県富士宮市宮町1-1', phone:'', desc:'富士宮を代表する観光・文化スポット。市街地散策の起点にも使いやすい場所です。', lat:35.2274, lng:138.6104},
  {name:'静岡県富士山世界遺産センター', category:'sightseeing', address:'静岡県富士宮市宮町5-12', phone:'0544-21-3776', desc:'富士山の自然・文化・信仰を学べる施設。観光前の情報収集にも便利です。', lat:35.2268, lng:138.6077},
  {name:'白糸ノ滝', category:'sightseeing', address:'静岡県富士宮市上井出273-1', phone:'', desc:'富士山の湧水が流れ落ちる富士宮の代表的な景勝地です。', lat:35.3122, lng:138.5888},
  {name:'Cafe & Restaurant DADA PLUS', category:'food', address:'静岡県富士宮市大宮町4-5', phone:'0544-23-1385', desc:'富士宮市街地で食事やカフェ利用ができるレストラン。', lat:35.2267, lng:138.6115},
  {name:'Roku cafe', category:'food', address:'静岡県富士宮市宮町14-3', phone:'0544-66-9775', desc:'浅間大社周辺の散策と組み合わせやすいカフェ。', lat:35.2290, lng:138.6098},
  {name:'海鮮料理もちわ', category:'food', address:'静岡県富士宮市安居山703-20', phone:'0544-23-0296', desc:'海鮮料理を楽しめる地元店。', lat:35.2160, lng:138.5817},
  {name:'ビュッフェレストランふじさん', category:'food', address:'静岡県富士宮市根原449-11', phone:'0544-29-5501', desc:'朝霧高原エリアで立ち寄りやすいビュッフェレストラン。', lat:35.4132, lng:138.5737},
  {name:'富士宮市役所', category:'government', address:'静岡県富士宮市弓沢町150', phone:'0544-22-1111', desc:'各種行政手続き、生活情報、相談窓口の中心施設。', lat:35.2220, lng:138.6213},
  {name:'富士宮駅', category:'mobility', address:'静岡県富士宮市中央町16', phone:'', desc:'JR身延線の主要駅。市街地観光やバス・タクシー利用の拠点です。', lat:35.2219, lng:138.6148},
  {name:'富士宮市立中央図書館', category:'kids', address:'静岡県富士宮市宮町13-1', phone:'0544-26-5062', desc:'学習や子どもの読書、地域情報収集に使える公共施設。', lat:35.2293, lng:138.6109},
  {name:'富士宮市民文化会館', category:'events', address:'静岡県富士宮市宮町14-2', phone:'0544-23-1237', desc:'コンサートや地域イベントなどが行われる文化施設。', lat:35.2294, lng:138.6094},
  {name:'富士宮市救急・防災情報', category:'safety', address:'富士宮市', phone:'119', desc:'緊急時は119。将来は避難所・AED・災害情報を現在地と連動して表示します。', lat:35.2220, lng:138.6213},
  {name:'富士宮市地域求人・事業者情報', category:'work', address:'富士宮市', phone:'', desc:'今後、地元企業の求人、創業支援、空き店舗、事業者向け情報をまとめる予定です。', lat:35.2220, lng:138.6213},
  {name:'富士宮市内買い物情報', category:'shopping', address:'富士宮市', phone:'', desc:'スーパー、直売所、土産店、ドラッグストアなどを順次統合します。', lat:35.2250, lng:138.6120},
  {name:'富士宮市生活サービス', category:'life', address:'富士宮市', phone:'', desc:'病院、歯科、動物病院、美容、修理など暮らしの施設をまとめる入口です。', lat:35.2240, lng:138.6180},
  {name:'富士宮市内の宿泊情報', category:'stay', address:'富士宮市', phone:'', desc:'ホテル、旅館、民宿、キャンプ場、ペット可施設を統合して探せるようにします。', lat:35.2300, lng:138.6050},
  {name:'富士宮クーポン・スタンプ', category:'community', address:'富士宮市', phone:'', desc:'地域クーポン、デジタルスタンプ、店舗情報、地域交流機能をここに統合します。', lat:35.2260, lng:138.6120}
];

const categoryMap = Object.fromEntries(categories.map(c=>[c.id,c]));
const grid = document.getElementById('categoryGrid');
const cardsEl = document.getElementById('cards');
const titleEl = document.getElementById('resultsTitle');
const countEl = document.getElementById('resultCount');
const searchInput = document.getElementById('globalSearch');
const statusEl = document.getElementById('statusMessage');
const template = document.getElementById('cardTemplate');
let activeCategory = null;
let userLocation = null;
let markers = [];

const map = L.map('map', {zoomControl:true}).setView([35.229,138.61], 12);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

categories.forEach(cat=>{
  const btn=document.createElement('button');
  btn.className='category-card';
  btn.dataset.id=cat.id;
  btn.innerHTML=`<span class="icon">${cat.icon}</span><span class="name">${cat.name}</span>`;
  btn.addEventListener('click',()=>{
    activeCategory = activeCategory===cat.id ? null : cat.id;
    document.querySelectorAll('.category-card').forEach(b=>b.classList.toggle('active', b.dataset.id===activeCategory));
    applyFilters();
  });
  grid.appendChild(btn);
});

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

function render(items){
  cardsEl.innerHTML='';
  markers.forEach(m=>map.removeLayer(m));
  markers=[];
  if(!items.length){
    cardsEl.innerHTML='<div class="empty">該当する施設がありません。検索語やカテゴリーを変えてみてください。</div>';
    countEl.textContent='0件';
    return;
  }
  countEl.textContent=`${items.length}件`;
  const bounds=[];
  items.forEach(place=>{
    const node=template.content.cloneNode(true);
    node.querySelector('.category-pill').textContent=categoryMap[place.category]?.name || '施設';
    node.querySelector('h4').textContent=place.name;
    node.querySelector('.description').textContent=place.desc;
    const meta=node.querySelector('.meta');
    meta.innerHTML=`<div>📍 ${place.address}</div>${place.phone?`<div>☎️ ${place.phone}</div>`:''}`;
    const distance=node.querySelector('.distance');
    if(userLocation){ distance.textContent=`約 ${haversine(userLocation,place).toFixed(1)} km`; }
    const route=node.querySelector('.route-btn');
    route.href=routeUrl(place);
    route.textContent=userLocation?'現在地からの行き方':'場所を開く';
    node.querySelector('.map-btn').addEventListener('click',()=>{
      map.setView([place.lat,place.lng],16);
      const marker=markers.find(m=>m.options.title===place.name);
      if(marker) marker.openPopup();
      document.querySelector('.map-panel').scrollIntoView({behavior:'smooth',block:'start'});
    });
    cardsEl.appendChild(node);
    const marker=L.marker([place.lat,place.lng],{title:place.name}).addTo(map).bindPopup(`<strong>${place.name}</strong><br>${place.address}`);
    markers.push(marker); bounds.push([place.lat,place.lng]);
  });
  if(items.length>1) map.fitBounds(bounds,{padding:[24,24],maxZoom:13});
}

function applyFilters(){
  const q=searchInput.value.trim().toLowerCase();
  let items=places.filter(p=>{
    const catOK=!activeCategory || p.category===activeCategory;
    const hay=`${p.name} ${p.address} ${p.phone||''} ${p.desc} ${categoryMap[p.category]?.name||''}`.toLowerCase();
    return catOK && (!q || hay.includes(q));
  });
  if(userLocation){items=items.sort((a,b)=>haversine(userLocation,a)-haversine(userLocation,b));}
  titleEl.textContent = activeCategory ? categoryMap[activeCategory].name : (q ? `「${searchInput.value.trim()}」の検索結果` : 'おすすめ・新着');
  render(items);
}

function locate(){
  if(!navigator.geolocation){statusEl.textContent='この端末では位置情報を利用できません。';return;}
  statusEl.textContent='現在地を取得しています…';
  navigator.geolocation.getCurrentPosition(pos=>{
    userLocation={lat:pos.coords.latitude,lng:pos.coords.longitude};
    L.circleMarker([userLocation.lat,userLocation.lng],{radius:9,weight:3,fillOpacity:.8}).addTo(map).bindPopup('現在地').openPopup();
    map.setView([userLocation.lat,userLocation.lng],13);
    statusEl.textContent='現在地を取得しました。施設を距離順に並べ替えました。';
    applyFilters();
  },err=>{
    statusEl.textContent='位置情報を取得できませんでした。ブラウザの位置情報許可を確認してください。';
  },{enableHighAccuracy:true,timeout:10000,maximumAge:60000});
}

document.getElementById('searchButton').addEventListener('click',applyFilters);
searchInput.addEventListener('keydown',e=>{if(e.key==='Enter')applyFilters();});
document.getElementById('nearbyButton').addEventListener('click',locate);
document.getElementById('mapLocateButton').addEventListener('click',locate);
document.getElementById('showAllButton').addEventListener('click',()=>{
  activeCategory=null; searchInput.value='';
  document.querySelectorAll('.category-card').forEach(b=>b.classList.remove('active'));
  applyFilters();
});

document.getElementById('modeButton').addEventListener('click',e=>{
  const next=e.currentTarget.textContent==='市民'?'観光':'市民';
  e.currentTarget.textContent=next;
  statusEl.textContent = next==='観光' ? '観光向け表示に切り替えました。今後、観光情報を優先表示します。' : '市民向け表示に切り替えました。今後、生活情報を優先表示します。';
});

applyFilters();
