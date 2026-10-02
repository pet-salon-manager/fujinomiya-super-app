const db = window.FM_DB;
const setupNotice = document.getElementById('setupNotice');
const loginPanel = document.getElementById('loginPanel');
const adminPanel = document.getElementById('adminPanel');
const loginStatus = document.getElementById('loginStatus');
const saveStatus = document.getElementById('saveStatus');
const adminList = document.getElementById('adminList');
const adminCount = document.getElementById('adminCount');
const adminSearch = document.getElementById('adminSearch');
let rows = [];
let activeId = null;

const $ = id => document.getElementById(id);
const fields = {
  id:$('placeId'), name:$('placeName'), category:$('placeCategory'), kind:$('placeKind'),
  published:$('placePublished'), address:$('placeAddress'), phone:$('placePhone'), site:$('placeSite'),
  description:$('placeDescription'), tags:$('placeTags'), lat:$('placeLat'), lng:$('placeLng'),
  source:$('placeSource'), sortOrder:$('placeSortOrder')
};

function setStatus(el,msg,type=''){
  el.textContent=msg || '';
  el.classList.remove('error','ok');
  if(type) el.classList.add(type);
}

function normalizeRow(row){
  return {...row, tags:Array.isArray(row.tags)?row.tags:[]};
}

async function isAdmin(){
  const {data,error}=await db.client.rpc('is_admin');
  if(error) throw error;
  return data===true;
}

async function showAuthenticated(session){
  const ok=await isAdmin();
  if(!ok){
    await db.client.auth.signOut();
    throw new Error('このアカウントには管理者権限がありません。');
  }
  loginPanel.hidden=true;
  adminPanel.hidden=false;
  $('signedInAs').textContent=session.user.email || '管理者';
  await loadRows();
}

async function loadRows(){
  setStatus(saveStatus,'読み込み中…');
  const {data,error}=await db.client.from('places').select('*').order('sort_order',{ascending:true}).order('name',{ascending:true});
  if(error){setStatus(saveStatus,error.message,'error');return;}
  rows=(data||[]).map(normalizeRow);
  renderList();
  setStatus(saveStatus,'最新です','ok');
}

function renderList(){
  const q=adminSearch.value.trim().toLowerCase();
  const filtered=rows.filter(r=>`${r.name} ${r.address||''} ${r.category||''} ${r.description||''}`.toLowerCase().includes(q));
  adminCount.textContent=`${filtered.length}件`;
  adminList.innerHTML='';
  if(!filtered.length){adminList.innerHTML='<div class="empty">該当する登録情報がありません。</div>';return;}
  filtered.forEach(row=>{
    const b=document.createElement('button');
    b.type='button';
    b.className='admin-item';
    b.classList.toggle('active',row.id===activeId);
    b.innerHTML=`<strong></strong><div class="admin-item-meta"><span>${row.category} / ${row.kind}</span><span class="publish-dot ${row.is_published?'on':'off'}">${row.is_published?'● 公開':'○ 非公開'}</span></div>`;
    b.querySelector('strong').textContent=row.name;
    b.addEventListener('click',()=>editRow(row.id));
    adminList.appendChild(b);
  });
}

function clearForm(){
  activeId=null;
  fields.id.value=''; fields.name.value=''; fields.category.value='food'; fields.kind.value='place'; fields.published.value='true';
  fields.address.value=''; fields.phone.value=''; fields.site.value=''; fields.description.value=''; fields.tags.value='';
  fields.lat.value=''; fields.lng.value=''; fields.source.value=''; fields.sortOrder.value='100';
  $('editorTitle').textContent='新規施設';
  $('deleteButton').hidden=true;
  setStatus(saveStatus,'');
  renderList();
  fields.name.focus();
}

function editRow(id){
  const row=rows.find(r=>r.id===id); if(!row) return;
  activeId=id;
  fields.id.value=row.id; fields.name.value=row.name||''; fields.category.value=row.category||'food'; fields.kind.value=row.kind||'place';
  fields.published.value=String(row.is_published!==false); fields.address.value=row.address||''; fields.phone.value=row.phone||''; fields.site.value=row.site||'';
  fields.description.value=row.description||''; fields.tags.value=(row.tags||[]).join(', '); fields.lat.value=row.lat??''; fields.lng.value=row.lng??'';
  fields.source.value=row.source||''; fields.sortOrder.value=row.sort_order??100;
  $('editorTitle').textContent='施設を編集';
  $('deleteButton').hidden=false;
  renderList();
  if(window.innerWidth<850) document.querySelector('.editor-panel').scrollIntoView({behavior:'smooth',block:'start'});
}

function payloadFromForm(){
  const lat=fields.lat.value.trim(), lng=fields.lng.value.trim();
  return {
    id:fields.id.value || `p-${Date.now()}`,
    name:fields.name.value.trim(),
    category:fields.category.value,
    kind:fields.kind.value,
    is_published:fields.published.value==='true',
    address:fields.address.value.trim() || null,
    phone:fields.phone.value.trim() || null,
    site:fields.site.value.trim() || null,
    description:fields.description.value.trim() || null,
    tags:fields.tags.value.split(',').map(x=>x.trim()).filter(Boolean),
    lat:lat===''?null:Number(lat),
    lng:lng===''?null:Number(lng),
    source:fields.source.value.trim() || null,
    sort_order:Number(fields.sortOrder.value || 100)
  };
}

$('loginForm').addEventListener('submit',async e=>{
  e.preventDefault();
  if(!db?.configured){setStatus(loginStatus,'Supabaseが未接続です。config.js を設定してください。','error');return;}
  setStatus(loginStatus,'ログイン中…');
  const {data,error}=await db.client.auth.signInWithPassword({email:$('loginEmail').value.trim(),password:$('loginPassword').value});
  if(error){setStatus(loginStatus,error.message,'error');return;}
  try{await showAuthenticated(data.session);setStatus(loginStatus,'');}
  catch(err){setStatus(loginStatus,err.message,'error');}
});

$('placeForm').addEventListener('submit',async e=>{
  e.preventDefault();
  const payload=payloadFromForm();
  const saveButton=e.submitter || e.currentTarget.querySelector('button[type=\"submit\"]');

  if(!payload.name){
    setStatus(saveStatus,'名称を入力してください。','error');
    saveStatus.scrollIntoView({behavior:'smooth',block:'center'});
    return;
  }
  if((payload.lat==null)!==(payload.lng==null)){
    setStatus(saveStatus,'緯度と経度は両方入力するか、両方空欄にしてください。','error');
    saveStatus.scrollIntoView({behavior:'smooth',block:'center'});
    return;
  }

  const originalText=saveButton?.textContent || '保存';
  if(saveButton){ saveButton.disabled=true; saveButton.textContent='保存中…'; }
  setStatus(saveStatus,'保存中…');

  try{
    const {error}=await db.client.from('places').upsert(payload,{onConflict:'id'});
    if(error) throw error;

    activeId=payload.id;
    const {data,error:reloadError}=await db.client
      .from('places')
      .select('*')
      .order('sort_order',{ascending:true})
      .order('name',{ascending:true});
    if(reloadError) throw reloadError;

    rows=(data||[]).map(normalizeRow);
    renderList();
    editRow(payload.id);
    setStatus(saveStatus,'✓ 保存しました','ok');
    saveStatus.scrollIntoView({behavior:'smooth',block:'center'});
  }catch(err){
    console.error('Save failed',err);
    setStatus(saveStatus,`保存できませんでした: ${err.message || err}`,'error');
    saveStatus.scrollIntoView({behavior:'smooth',block:'center'});
  }finally{
    if(saveButton){ saveButton.disabled=false; saveButton.textContent=originalText; }
  }
});

$('deleteButton').addEventListener('click',async()=>{
  if(!activeId) return;
  const row=rows.find(r=>r.id===activeId);
  if(!confirm(`「${row?.name||'この施設'}」を削除しますか？`)) return;
  setStatus(saveStatus,'削除中…');
  const {error}=await db.client.from('places').delete().eq('id',activeId);
  if(error){setStatus(saveStatus,error.message,'error');return;}
  clearForm();
  await loadRows();
  setStatus(saveStatus,'削除しました','ok');
});

$('newPlaceButton').addEventListener('click',clearForm);
$('clearButton').addEventListener('click',clearForm);
$('reloadButton').addEventListener('click',loadRows);
$('logoutButton').addEventListener('click',async()=>{await db.client.auth.signOut();adminPanel.hidden=true;loginPanel.hidden=false;setStatus(loginStatus,'ログアウトしました。','ok');});
adminSearch.addEventListener('input',renderList);

async function boot(){
  if(!db?.configured){
    setupNotice.hidden=false;
    setStatus(loginStatus,'Supabase設定後に管理者ログインを利用できます。');
    return;
  }
  const {data}=await db.client.auth.getSession();
  if(data?.session){
    try{await showAuthenticated(data.session);}catch(err){setStatus(loginStatus,err.message,'error');}
  }
}
boot();
