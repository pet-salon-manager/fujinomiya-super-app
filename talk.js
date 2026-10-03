const channelDefs={
  guide:{title:'旅とも案内',avatar:'🗻',subtitle:'富士宮の観光・暮らしをチャット形式で案内します。',quick:['おすすめ観光コース','行きたい観光スポット','おすすめの飲食店・宿泊施設','集合場所を決める','現在地からの行き方','富士宮焼きそばについて']},
  friend:{title:'友だちトーク',avatar:'👥',subtitle:'旅行中の相談や集合メッセージをLINE風に残せます。',quick:['おすすめ観光コースを共有','行きたい観光スポット','おすすめの飲食店・宿泊施設','集合場所','現在地からの行き方','トークを始める']},
  shop:{title:'お店トーク',avatar:'🏪',subtitle:'お店へ聞きたい内容をテンプレートですばやく作れます。',quick:['営業時間を教えてください','空席・予約方法を教えてください','駐車場はありますか？','ペット同伴できますか？','売り切れ情報を教えてください','体験受付時間を教えてください']}
};
let current='guide';
const messagesEl=document.getElementById('messages');
const quickGrid=document.getElementById('quickGrid');
const titleEl=document.getElementById('channelTitle');
const subtitleEl=document.getElementById('channelSubtitle');
const avatarEl=document.getElementById('channelAvatar');
const input=document.getElementById('messageInput');

function storageKey(){return `fujinomiya-talk-v19-${current}`}
function now(){return new Date().toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit'})}
function initialMessages(){
  if(current==='guide') return [{who:'bot',text:'こんにちは。富士宮トークです。\n観光・グルメ・移動・暮らしのことを、下のボタンやメッセージから聞いてください。',time:now()}];
  if(current==='friend') return [{who:'bot',text:'友だちと相談したい内容をここにメモできます。下の定型文をタップすると、すぐトークに追加できます。',time:now()}];
  return [{who:'bot',text:'お店へ確認したい質問を選んでください。定型文をそのまま使えます。',time:now()}];
}
function load(){try{return JSON.parse(localStorage.getItem(storageKey()))||initialMessages()}catch{return initialMessages()}}
function save(items){localStorage.setItem(storageKey(),JSON.stringify(items))}
function render(){
  const def=channelDefs[current];titleEl.textContent=def.title;subtitleEl.textContent=def.subtitle;avatarEl.textContent=def.avatar;
  document.querySelectorAll('.channel').forEach(b=>b.classList.toggle('active',b.dataset.channel===current));
  quickGrid.innerHTML='';def.quick.forEach(q=>{const b=document.createElement('button');b.type='button';b.className='quick-btn';b.textContent=q;b.addEventListener('click',()=>send(q,true));quickGrid.appendChild(b)});
  const items=load();messagesEl.innerHTML='';items.forEach(m=>{const row=document.createElement('div');row.className=`message-row ${m.who==='me'?'me':'bot'}`;const bubble=document.createElement('div');bubble.className='bubble';bubble.textContent=m.text;const t=document.createElement('span');t.className='time';t.textContent=m.time||'';if(m.who==='me'){row.append(t,bubble)}else{row.append(bubble,t)}messagesEl.appendChild(row)});messagesEl.scrollTop=messagesEl.scrollHeight;
}
function answer(text){const s=text.toLowerCase();
  if(current==='friend') return 'このメッセージを友だちとの相談用に保存しました。右上の共有ボタンから、このトーク内容を共有できます。';
  if(current==='shop') return '質問テンプレートを作成しました。お店の公式サイトや電話番号は、ホームの施設カードから確認できます。';
  if(s.includes('焼きそば')) return '富士宮焼きそばは、コシのある蒸し麺・肉かす・だし粉などが特徴です。ホームで「富士宮焼きそば」と検索すると登録店を探せます。';
  if(s.includes('コース')) return '定番なら「富士山本宮浅間大社 → 静岡県富士山世界遺産センター → 富士宮焼きそば → 白糸ノ滝」の流れが組みやすいです。';
  if(s.includes('スポット')) return '富士山本宮浅間大社、静岡県富士山世界遺産センター、白糸ノ滝などがあります。ホームの「遊ぶ・観光」から探せます。';
  if(s.includes('飲食')||s.includes('宿泊')) return 'ホームの「食べる」「泊まる」を押すと、登録施設を10件ずつ確認できます。条件で絞り込むこともできます。';
  if(s.includes('集合')) return '集合場所は、富士宮駅・浅間大社周辺など目印の分かりやすい場所を候補にすると便利です。';
  if(s.includes('行き方')||s.includes('現在地')) return 'ホームの施設カードで「行き方」を押すと、現在地からのルートを確認できます。';
  return '「'+text+'」について、ホームの検索やカテゴリから関連する登録情報を探せます。必要なら、場所・グルメ・移動など具体的に入力してください。';
}
function send(text,autoReply=false){text=String(text||'').trim();if(!text)return;const items=load();items.push({who:'me',text,time:now()});save(items);render();input.value='';setTimeout(()=>{const next=load();next.push({who:'bot',text:answer(text),time:now()});save(next);render()},220)}

document.querySelectorAll('.channel').forEach(b=>b.addEventListener('click',()=>{current=b.dataset.channel;render()}));
document.getElementById('composer').addEventListener('submit',e=>{e.preventDefault();send(input.value)});
document.getElementById('clearTalk').addEventListener('click',()=>{if(confirm('このトーク履歴をリセットしますか？')){localStorage.removeItem(storageKey());render()}});
document.getElementById('shareTalk').addEventListener('click',async()=>{const def=channelDefs[current];const text=[`【${def.title}】`,...load().map(m=>`${m.who==='me'?'自分':'富士宮トーク'}: ${m.text}`)].join('\n');try{if(navigator.share){await navigator.share({title:def.title,text})}else{await navigator.clipboard.writeText(text);alert('トーク内容をコピーしました。')}}catch{}});
render();
