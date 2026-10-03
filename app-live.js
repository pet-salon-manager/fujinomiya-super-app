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

const dataPack = window.FUJINOMIYA_DATA || {version:'0', updatedAt:'', note:'', places:[]};
let places = [...(dataPack.places || [])];
let dataSource = '内蔵データ';

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
const summaryEl = document.getElementById('dataSummary');
const template = document.getElementById('cardTemplate');
const favoritesButton = document.getElementById('favoritesButton');
const filterStatusEl = document.getElementById('filterStatus');
const filterChipsEl = document.getElementById('filterChips');

let activeCategory = null;
let userLocation = null;
let markers = [];
let userMarker = null;
let showFavoritesOnly = false;
let mode = localStorage.getItem('fujinomiya-mode') || 'resident';
let favorites = new Set(JSON.parse(localStorage.getItem('fujinomiya-favorites') || '[]'));
const activeFilters = new Set();

const map = L.map('map', {zoomControl:true}).setView([35.229,138.61], 12);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom:19,
  attribution:'&copy; OpenStreetMap contributors'
}).addTo(map);

function hasCoords(place){
  return Number.isFinite(place.lat) && Number.isFinite(place.lng);
}

function isConcreteAddress(place){
  return place.address && place.address !== '富士宮市' && place.address !== '静岡県富士宮市';
}

function toTriState(value){
  return value === true ? true : value === false ? false : null;
}

function mapDbRow(row){
  return {
    id:String(row.id),
    name:row.name || '',
    category:row.category || 'life',
    kind:row.kind || 'place',
    address:row.address || '',
    phone:row.phone || '',
    site:row.site || '',
    desc:row.description || '',
    tags:Array.isArray(row.tags) ? row.tags : [],
    lat:row.lat == null ? null : Number(row.lat),
    lng:row.lng == null ? null : Number(row.lng),
    source:row.source || '',
    area:row.area || '',
    openingHours:row.opening_hours || '',
    regularHoliday:row.regular_holiday || '',
    parking:toTriState(row.parking),
    parkingNote:row.parking_note || '',
    petFriendly:toTriState(row.pet_friendly),
    wheelchairAccessible:toTriState(row.wheelchair_accessible),
    emergency24h:toTriState(row.emergency_24h),
    bookingUrl:row.booking_url || '',
    priceNote:row.price_note || '',
    imageUrl:row.image_url || '',
    lastVerified:row.last_verified || '',
    verificationStatus:row.verification_status || 'unverified'
  };
}

async function loadRemotePlaces(){
  const cfg = window.FM_CONFIG || {};
  const url = String(cfg.SUPABASE_URL || '').trim();
  const key = String(cfg.SUPABASE_ANON_KEY || '').trim();
  if(!url || !key || !window.supabase?.createClient){
    dataSource='内蔵データ（Supabase未設定）';
    statusEl.textContent='Supabase設定を確認できないため、内蔵データを表示しています。';
    return;
  }

  const publicClient = window.supabase.createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });

  try{
    const {data,error}=await publicClient
      .from('places')
      .select('*')
      .eq('is_published',true)
      .order('sort_order',{ascending:true})
      .order('name',{ascending:true});
    if(error) throw error;
    if(!Array.isArray(data)) throw new Error('Supabaseから配列データを取得できませんでした。');

    places=data.map(mapDbRow);
    dataSource='Supabase（公開データ）';
    statusEl.textContent=`Supabaseから最新の公開データ ${places.length}件を読み込みました。`;
  }catch(err){
    console.error('Supabase public load failed',err);
    dataSource='内蔵データ（Supabase読込エラー）';
    statusEl.textContent=`Supabase読込エラー: ${err?.message || err}。内蔵データを表示しています。`;
  }
}

function mapSearchUrl(place){
  if(hasCoords(place)){
    return `https://www.openstreetmap.org/?mlat=${place.lat}&mlon=${place.lng}#map=16/${place.lat}/${place.lng}`;
  }
  const q = encodeURIComponent(`${place.name} ${place.address || '富士宮市'}`);
  return `https://www.openstreetmap.org/search?query=${q}`;
}

function renderCategories(){
  grid.innerHTML='';
  categories.forEach(cat=>{
    const btn=document.createElement('button');
    btn.className='category-card';
    btn.type='button';
    btn.dataset.id=cat.id;
    const count=places.filter(p=>p.category===cat.id).length;
    btn.innerHTML=`<span class="icon">${cat.icon}</span><span class="name">${cat.name}</span><span class="cat-count">${count}件</span>`;
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
}

function renderDataSummary(){
  const pinCount=places.filter(hasCoords).length;
  const realPlaces=places.filter(p=>p.kind==='place').length;
  const phoneCount=places.filter(p=>p.phone).length;
  const webCount=places.filter(p=>p.site).length;
  summaryEl.innerHTML=`
    <span><strong>${places.length}</strong> 登録情報</span>
    <span><strong>${realPlaces}</strong> 施設・場所</span>
    <span><strong>${pinCount}</strong> 地図ピン</span>
    <span><strong>${phoneCount}</strong> 電話あり</span>
    <span><strong>${webCount}</strong> Webあり</span>
    <span class="source-badge"><strong>DB</strong> ${dataSource}</span>
  `;
}

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
  if(userLocation && hasCoords(place)){
    return `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${userLocation.lat}%2C${userLocation.lng}%3B${place.lat}%2C${place.lng}`;
  }
  return mapSearchUrl(place);
}

function sortedByMode(items){
  if(userLocation){
    return [...items].sort((a,b)=>{
      const da=hasCoords(a)?haversine(userLocation,a):Infinity;
      const db=hasCoords(b)?haversine(userLocation,b):Infinity;
      if(da!==db) return da-db;
      return modePriority[mode].indexOf(a.category)-modePriority[mode].indexOf(b.category);
    });
  }
  const order=modePriority[mode];
  return [...items].sort((a,b)=>{
    const categoryDiff=order.indexOf(a.category)-order.indexOf(b.category);
    if(categoryDiff!==0) return categoryDiff;
    if(a.kind!==b.kind) return a.kind==='place'?-1:1;
    return a.name.localeCompare(b.name,'ja');
  });
}

function addBadge(container,text,className=''){
  const span=document.createElement('span');
  span.textContent=text;
  if(className) span.className=className;
  container.appendChild(span);
}

function render(items){
  cardsEl.innerHTML='';
  markers.forEach(m=>map.removeLayer(m));
  markers=[];
  countEl.textContent=`${items.length}件`;

  if(!items.length){
    cardsEl.innerHTML='<div class="empty">該当する情報がありません。検索語・カテゴリー・絞り込み条件を変えてみてください。</div>';
    return;
  }

  const bounds=[];
  items.forEach(place=>{
    const node=template.content.cloneNode(true);
    const article=node.querySelector('.place-card');
    article.classList.toggle('service-card',place.kind==='service');
    node.querySelector('.category-pill').textContent=categoryMap[place.category]?.name || '施設';
    node.querySelector('h3').textContent=place.name;
    node.querySelector('.description').textContent=place.desc;

    const metaParts=[];
    if(place.address) metaParts.push(`<div>📍 ${place.address}</div>`);
    if(place.phone) metaParts.push(`<div>☎️ ${place.phone}</div>`);
    if(place.openingHours) metaParts.push(`<div>🕒 ${place.openingHours}</div>`);
    if(place.regularHoliday) metaParts.push(`<div>休 ${place.regularHoliday}</div>`);
    node.querySelector('.meta').innerHTML=metaParts.join('');

    const distance=node.querySelector('.distance');
    if(userLocation && hasCoords(place)) distance.textContent=`約 ${haversine(userLocation,place).toFixed(1)} km`;
    else if(place.kind==='service') distance.textContent='案内';
    else if(!hasCoords(place)) distance.textContent='住所検索';

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

    const details=node.querySelector('.detail-badges');
    if(place.parking===true) addBadge(details,'🅿 駐車場');
    if(place.petFriendly===true) addBadge(details,'🐾 ペット可');
    if(place.wheelchairAccessible===true) addBadge(details,'♿ バリアフリー');
    if(place.emergency24h===true) addBadge(details,'24h');
    if(place.priceNote) addBadge(details,place.priceNote);
    if(!details.children.length) details.hidden=true;

    const tags=node.querySelector('.tags');
    (place.tags || []).slice(0,5).forEach(tag=>addBadge(tags,tag));

    const verification=node.querySelector('.verification-row');
    if(place.verificationStatus==='verified' || place.lastVerified){
      verification.hidden=false;
      const label=place.verificationStatus==='verified'?'確認済み':'確認日あり';
      verification.textContent=place.lastVerified?`${label}：${place.lastVerified}`:label;
    }

    const source=node.querySelector('.source-label');
    source.textContent=place.source?`情報元: ${place.source}`:'';
    if(!place.source) node.querySelector('.source-row').hidden=true;

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
      site.textContent='↗ Webを見る';
      contact.appendChild(site);
    }
    if(place.bookingUrl){
      const booking=document.createElement('a');
      booking.href=place.bookingUrl;
      booking.target='_blank';
      booking.rel='noopener';
      booking.textContent='予約・受付';
      contact.appendChild(booking);
    }

    const route=node.querySelector('.route-btn');
    const mapBtn=node.querySelector('.map-btn');

    if(place.kind==='service' && !isConcreteAddress(place)){
      mapBtn.hidden=true;
      route.hidden=true;
      if(!place.site && !place.phone && !place.bookingUrl){
        node.querySelector('.card-actions').hidden=true;
      }
    }else{
      route.href=routeUrl(place);
      route.textContent=userLocation && hasCoords(place)?'現在地から行く':(hasCoords(place)?'場所を開く':'住所で探す');
      mapBtn.textContent=hasCoords(place)?'地図で見る':'地図で検索';
      mapBtn.addEventListener('click',()=>{
        if(hasCoords(place)){
          map.setView([place.lat,place.lng],16);
          const marker=markers.find(m=>m.options.title===place.name);
          if(marker) marker.openPopup();
          document.getElementById('mapSection').scrollIntoView({behavior:'smooth',block:'start'});
        }else{
          window.open(mapSearchUrl(place),'_blank','noopener');
        }
      });
    }

    cardsEl.appendChild(node);

    if(hasCoords(place)){
      const marker=L.marker([place.lat,place.lng],{title:place.name}).addTo(map).bindPopup(`<strong>${place.name}</strong><br>${place.address || ''}`);
      markers.push(marker);
      bounds.push([place.lat,place.lng]);
    }
  });

  if(bounds.length>1 && !userLocation) map.fitBounds(bounds,{padding:[24,24],maxZoom:13});
  else if(bounds.length===1 && !userLocation) map.setView(bounds[0],14);
}

function passesQuickFilters(place){
  for(const filter of activeFilters){
    if(filter==='phone' && !place.phone) return false;
    if(filter==='web' && !place.site) return false;
    if(filter==='map' && !hasCoords(place)) return false;
    if(filter==='parking' && place.parking!==true) return false;
    if(filter==='pets' && place.petFriendly!==true) return false;
    if(filter==='wheelchair' && place.wheelchairAccessible!==true) return false;
    if(filter==='emergency' && place.emergency24h!==true) return false;
    if(filter==='placeOnly' && place.kind!=='place') return false;
  }
  return true;
}

function updateFilterUI(){
  filterChipsEl.querySelectorAll('button[data-filter]').forEach(btn=>{
    const on=activeFilters.has(btn.dataset.filter);
    btn.classList.toggle('active',on);
    btn.setAttribute('aria-pressed',String(on));
  });
  filterStatusEl.textContent=activeFilters.size?`${activeFilters.size}個の条件で絞り込み中`:'条件指定なし';
}

function applyFilters(){
  const raw=searchInput.value.trim();
  const q=raw.toLowerCase();
  let items=places.filter(p=>{
    const categoryOK=!activeCategory || p.category===activeCategory;
    const favoriteOK=!showFavoritesOnly || favorites.has(p.id);
    const hay=`${p.name} ${p.address||''} ${p.phone||''} ${p.desc||''} ${(p.tags||[]).join(' ')} ${p.source||''} ${p.area||''} ${p.openingHours||''} ${p.regularHoliday||''} ${p.priceNote||''} ${categoryMap[p.category]?.name||''}`.toLowerCase();
    return categoryOK && favoriteOK && passesQuickFilters(p) && (!q || hay.includes(q));
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
    statusEl.textContent='現在地を取得しました。座標確認済みの施設は距離の近い順に表示します。';
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

filterChipsEl.addEventListener('click',e=>{
  const btn=e.target.closest('button[data-filter]');
  if(!btn) return;
  const key=btn.dataset.filter;
  activeFilters.has(key)?activeFilters.delete(key):activeFilters.add(key);
  updateFilterUI();
  applyFilters();
});

document.getElementById('clearFiltersButton').addEventListener('click',()=>{
  activeFilters.clear();
  updateFilterUI();
  applyFilters();
});

document.getElementById('searchButton').addEventListener('click',()=>{
  showFavoritesOnly=false;
  favoritesButton.classList.remove('active');
  applyFilters();
  document.getElementById('resultsSection').scrollIntoView({behavior:'smooth',block:'start'});
});
searchInput.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();document.getElementById('searchButton').click();}});
document.getElementById('nearbyButton').addEventListener('click',locate);
document.getElementById('mapLocateButton').addEventListener('click',locate);
document.getElementById('favoritesButton').addEventListener('click',toggleFavorites);
document.getElementById('bottomFavorite').addEventListener('click',toggleFavorites);
document.getElementById('showAllButton').addEventListener('click',()=>{
  activeCategory=null;
  showFavoritesOnly=false;
  searchInput.value='';
  activeFilters.clear();
  favoritesButton.classList.remove('active');
  syncCategoryState();
  updateFilterUI();
  applyFilters();
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

async function boot(){
  updateModeUI();
  updateFilterUI();
  await loadRemotePlaces();
  renderCategories();
  renderDataSummary();
  applyFilters();
}

boot();
