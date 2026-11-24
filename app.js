const SB_URL='https://wiqfibqjnhfclggjoupb.supabase.co';
const SB_KEY='sb_publishable_SDuSirqFDyyhjgFR-2eCrw_DxN_QN85';
const db=window.supabase.createClient(SB_URL,SB_KEY);
const CATS=[{id:'ma',n:'Masculino A',g:4},{id:'mb',n:'Masculino B',g:2},{id:'f',n:'Femenino Libre',g:2},{id:'p',n:'Femenino Promocional',g:2}];
const ng=c=>CATS.find(x=>x.id===c).g;
const L='ABCD',PAIRS=[[0,1],[0,2],[1,2]];
const QF=[[[0,0],[1,1]],[[1,0],[0,1]],[[2,0],[3,1]],[[3,0],[2,1]]];
const SF=[['qf0','qf2'],['qf1','qf3']];
const SF2=[[[0,0],[1,1]],[[1,0],[0,1]]];
const MAX_NAME=30,MAX_PLAYER=40,MAX_LOGO_BYTES=5*1024*1024,MAX_LOGO_CHARS=200000;
let S,view='ma',session=null,listo=false;
function fresh(){const o={};CATS.forEach(c=>{o[c.id]={t:Array.from({length:c.g*3},(_,i)=>'Equipo '+L[Math.floor(i/3)]+(i%3+1)),r:{},k:{},l:{},go:[]}});return o}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cleanScore=v=>{const s=String(v??'').trim();return/^\d{1,2}$/.test(s)?String(+s):''};
const cleanName=(v,fb)=>String(v??'').trim().slice(0,MAX_NAME)||fb;
const cleanLogo=u=>typeof u==='string'&&u.length<=MAX_LOGO_CHARS&&/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(u)?u:'';
const cleanMin=v=>{const n=parseInt(v,10);return n>=1&&n<=200?String(n):''};
const cleanRes=o=>{const out={};if(o&&typeof o==='object')Object.keys(o).forEach(k=>{if(!/^[a-z0-9-]{1,12}$/.test(k))return;const v=o[k];if(Array.isArray(v))out[k]=[cleanScore(v[0]),cleanScore(v[1])];else if(v==='0'||v==='1')out[k]=v});return out};
function sanitize(){
 const f=fresh();
 CATS.forEach(c=>{
  const d=S[c.id]=S[c.id]&&typeof S[c.id]==='object'?S[c.id]:f[c.id],n=c.g*3;
  d.t=f[c.id].t.map((x,i)=>cleanName(Array.isArray(d.t)?d.t[i]:'',x));
  d.r=cleanRes(d.r);d.k=cleanRes(d.k);
  const l={};if(d.l&&typeof d.l==='object')Object.keys(d.l).forEach(i=>{const u=cleanLogo(d.l[i]);if(u&&+i>=0&&+i<n)l[i]=u});d.l=l;
  d.go=(Array.isArray(d.go)?d.go:[]).filter(g=>g&&typeof g.m==='string'&&/^[a-z0-9-]{1,12}$/.test(g.m)&&Number.isInteger(+g.t)&&+g.t>=0&&+g.t<n&&String(g.p??'').trim()).map(g=>({m:g.m,t:+g.t,p:String(g.p).trim().slice(0,MAX_PLAYER),min:cleanMin(g.min)}));
 });
}
function guardarCopia(){try{localStorage.setItem('torneo-cache',JSON.stringify(S))}catch(e){}}
async function save(c){
 const ids=c?[c]:CATS.map(x=>x.id);
 guardarCopia();
 const {error}=await db.from('torneo').upsert(ids.map(id=>({categoria:id,datos:S[id],actualizado:new Date().toISOString()})));
 if(error)alert('No se pudo guardar: '+error.message)}
let suscrito=false,sinConexion=false;
async function cargar(){
 const {data,error}=await db.from('torneo').select('categoria,datos');
 if(error){
  let copia=null;try{copia=JSON.parse(localStorage.getItem('torneo-cache'))}catch(e){}
  if(!copia){document.getElementById('app').innerHTML='<p class="sub">No se pudieron cargar los datos. Recargá la página.</p>';return}
  S=copia;sanitize();sinConexion=true;listo=true;render();return}
 S=fresh();
 (data||[]).forEach(r=>{if(r.datos&&typeof r.datos==='object')S[r.categoria]=r.datos});
 sanitize();sinConexion=false;listo=true;guardarCopia();render();
 if(suscrito)return;suscrito=true;
 db.channel('torneo').on('postgres_changes',{event:'*',schema:'public',table:'torneo'},p=>{
  const r=p.new;if(!r||!CATS.some(x=>x.id===r.categoria))return;
  S[r.categoria]=r.datos;sanitize();guardarCopia();render()}).subscribe()}
addEventListener('online',cargar);
const played=r=>!!r&&r[0]!==''&&r[1]!==''&&r[0]!=null&&r[1]!=null;
function stand(c,g){
  const d=S[c],rows=[0,1,2].map(k=>({i:g*3+k,pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0}));let n=0;
  PAIRS.forEach((p,m)=>{const r=d.r[g+'-'+m];if(!played(r))return;n++;
   const a=rows[p[0]],b=rows[p[1]],x=+r[0],y=+r[1];
   a.pj++;b.pj++;a.gf+=x;a.gc+=y;b.gf+=y;b.gc+=x;
   if(x>y){a.pts+=3}else if(x<y){b.pts+=3}else{a.pts++;b.pts++}});
  rows.sort((a,b)=>b.pts-a.pts||(b.gf-b.gc)-(a.gf-a.gc)||b.gf-a.gf||d.t[a.i].localeCompare(d.t[b.i]));
  return{rows,done:n===3}}
function slot(c,[g,pos]){const s=stand(c,g);return s.done?{i:s.rows[pos].i,l:null}:{i:null,l:(pos+1)+'º Grupo '+L[g]}}
function parts(c,id){
  if(id[0]==='q'){const m=QF[+id[2]];return[slot(c,m[0]),slot(c,m[1])]}
  if(id[0]==='s'&&ng(c)===2){const m=SF2[+id[2]];return[slot(c,m[0]),slot(c,m[1])]}
  if(id[0]==='s'){return SF[+id[2]].map(x=>({i:win(c,x),l:'Ganador CF'+(+x[2]+1)}))}
  return['sf0','sf1'].map((x,k)=>({i:win(c,x),l:'Ganador SF'+(k+1)}))}
function win(c,id){
  const p=parts(c,id);if(p[0].i==null||p[1].i==null)return null;
  const r=S[c].k[id];if(!played(r))return null;
  if(+r[0]>+r[1])return p[0].i;if(+r[0]<+r[1])return p[1].i;
  const pen=S[c].k[id+'p'];return pen==='0'?p[0].i:pen==='1'?p[1].i:null}
const lg=(c,i)=>{const u=cleanLogo(S[c].l[i]);return u?'<img class="lg" alt="" src="'+u+'">':'<span class="lg">'+esc((S[c].t[i]||'?').replace(/^Equipo\s*/,'').slice(0,2))+'</span>'};
const tn=(c,p)=>p.i!=null?lg(c,p.i)+esc(S[c].t[p.i]):'<em>'+esc(p.l)+'</em>';
const gs=(c,key,t)=>S[c].go.filter(x=>x.m===key&&x.t===t).sort((x,y)=>(+x.min||0)-(+y.min||0)).map(x=>esc(x.p)+(x.min?' '+esc(x.min)+'’':'')).join(', ');
function gsRow(c,key,a,b){
  const A=gs(c,key,a),B=gs(c,key,b);let h='';
  if(A||B)h+='<span class="gs a c2">'+A+'</span><span class="gs c5">'+B+'</span>';
  if(isAdm())h+='<button class="lk c2e" data-gl="'+key+'">+ Cargar goleadores</button>';
  return h}
function groupBlock(c,g){
  const d=S[c],st=stand(c,g);
  let h='<div class="g"><h4>Grupo '+L[g]+'</h4><table><tr><th>Equipo</th><th>PJ</th><th>DG</th><th>Pts</th></tr>';
  st.rows.forEach((r,k)=>{const dg=r.gf-r.gc;h+='<tr'+(k<2&&st.done?' class="q"':'')+'><td><span class="tf">'+lg(c,r.i)+'<input class="nm" maxlength="'+MAX_NAME+'" data-n="'+r.i+'" value="'+esc(d.t[r.i])+'" aria-label="Nombre del equipo"></span></td><td>'+r.pj+'</td><td>'+(dg>0?'+':'')+dg+'</td><td><b>'+r.pts+'</b></td></tr>'});
  h+='</table><div class="gtop">';
  PAIRS.forEach((p,m)=>{const r=d.r[g+'-'+m]||['',''];
   h+='<div class="m"><span class="dy">Día '+(m+1)+'</span><span class="a">'+lg(c,g*3+p[0])+esc(d.t[g*3+p[0]])+'</span>'+
   '<input class="sc" type="number" min="0" max="99" inputmode="numeric" aria-label="Goles local" value="'+r[0]+'" data-r="'+g+'-'+m+'" data-s="0">'+
   '<input class="sc" type="number" min="0" max="99" inputmode="numeric" aria-label="Goles visitante" value="'+r[1]+'" data-r="'+g+'-'+m+'" data-s="1">'+
   '<span>'+lg(c,g*3+p[1])+esc(d.t[g*3+p[1]])+'</span>'+gsRow(c,g+'-'+m,g*3+p[0],g*3+p[1])+'</div>'});
  return h+'</div></div>'}
function koMatch(c,id,title,big){
  const p=parts(c,id),r=S[c].k[id]||['',''],w=win(c,id),ok=p[0].i!=null&&p[1].i!=null;
  const row=(k)=>'<div class="r"><span class="'+(w!=null&&w===p[k].i?'win':'')+'">'+tn(c,p[k])+'</span><input class="sc" type="number" min="0" max="99" inputmode="numeric" '+(ok?'':'disabled')+' aria-label="Goles" value="'+r[k]+'" data-k="'+id+'" data-s="'+k+'"></div>'+(ok&&gs(c,id,p[k].i)?'<div class="gs">'+gs(c,id,p[k].i)+'</div>':'');
  let h='<div class="mt'+(big?' champ':'')+'">'+(big?'<div class="d">Final</div>':'')+row(0)+row(1)+(ok&&isAdm()?'<button class="lk" data-gl="'+id+'">+ Cargar goleadores</button>':'');
  if(ok&&played(r)&&+r[0]===+r[1]){const pv=S[c].k[id+'p'];
   h+='<div class="pen">Penales, gana: <select data-p="'+id+'"><option value="">Elegir</option><option value="0"'+(pv==='0'?' selected':'')+'>'+esc(S[c].t[p[0].i])+'</option><option value="1"'+(pv==='1'?' selected':'')+'>'+esc(S[c].t[p[1].i])+'</option></select></div>'}
  return h+'</div>'}
function catView(c){
  const n=ng(c),cat=CATS.find(x=>x.id===c);
  let h='<h2 class="d">'+cat.n+'</h2><p class="sub">'+(c==='f'?'Fútbol 6 femenino libre':c==='p'?'Fútbol 6 femenino promocional':'Fútbol 11 masculino')+'. '+n+' grupos de 3 equipos. Clasifican los dos primeros.</p><h3 class="d">Fase de grupos</h3><div class="groups">';
  for(let g=0;g<n;g++)h+=groupBlock(c,g);
  h+='</div><h3 class="d">Fase final</h3><div class="br">';
  if(n===4){h+='<div class="col"><small>Cuartos de final, día 4</small>';for(let i=0;i<4;i++)h+=koMatch(c,'qf'+i);h+='</div>'}
  h+='<div class="col"><small>Semifinales, día 5</small>'+koMatch(c,'sf0')+koMatch(c,'sf1')+'</div>';
  h+='<div class="col"><small>Final, día 6</small>'+koMatch(c,'fin','',true);
  const ch=win(c,'fin');if(ch!=null)h+='<div class="mt champ"><div class="d">Campeón</div><b class="cb">'+esc(S[c].t[ch])+'</b></div>';
  h+='</div></div>'+scorersView(c);return h}
function calView(){
  const days=[[],[],[],[],[],[]],nm=['Fase de grupos, fecha 1','Fase de grupos, fecha 2','Fase de grupos, fecha 3','Cuartos de final','Semifinales','Finales'];
  CATS.forEach(cat=>{const c=cat.id,d=S[c];
   for(let g=0;g<cat.g;g++)PAIRS.forEach((p,m)=>{const r=d.r[g+'-'+m];days[m].push({cat:cat.n,tag:'Grupo '+L[g],a:esc(d.t[g*3+p[0]]),b:esc(d.t[g*3+p[1]]),sc:played(r)?r[0]+' - '+r[1]:''})});
   const add=(day,id,tag)=>{const p=parts(c,id),r=d.k[id];days[day].push({cat:cat.n,tag,a:tn(c,p[0]),b:tn(c,p[1]),sc:played(r)?r[0]+' - '+r[1]:''})};
   if(cat.g===4)for(let i=0;i<4;i++)add(3,'qf'+i,'CF'+(i+1));
   add(4,'sf0','SF1');add(4,'sf1','SF2');add(5,'fin','Final')});
  let h='<h2 class="d">Calendario</h2><p class="sub">Cada grupo juega un partido por día y un equipo descansa.</p>';
  days.forEach((x,i)=>{h+='<h3 class="d">Día '+(i+1)+' <span class="dn">'+nm[i]+'</span></h3><div class="cal">';
   x.forEach(m=>h+='<div class="row"><span class="t">'+m.cat+', '+m.tag+'</span><span>'+m.a+' <span class="mu">vs</span> '+m.b+'</span><b>'+m.sc+'</b></div>');
   h+='</div>'});
  return h}
function stageDone(i){
  if(i<3)return CATS.every(c=>{for(let g=0;g<c.g;g++)if(!played(S[c.id].r[g+'-'+i]))return false;return true});
  const ids=i===3?['qf0','qf1','qf2','qf3']:i===4?['sf0','sf1']:['fin'];
  return CATS.every(c=>(i===3&&c.g===2)||ids.every(id=>win(c.id,id)!=null))}
let pc='ma',pm='',upIdx=0;
function matchList(c){
  const o=[];
  for(let g=0;g<ng(c);g++)PAIRS.forEach((p,m)=>o.push({key:g+'-'+m,label:'Grupo '+L[g]+', día '+(m+1),a:g*3+p[0],b:g*3+p[1]}));
  (ng(c)===4?['qf0','qf1','qf2','qf3']:[]).concat(['sf0','sf1','fin']).forEach(id=>{const p=parts(c,id);if(p[0].i!=null&&p[1].i!=null)o.push({key:id,label:id==='fin'?'Final':id[0]==='q'?'Cuartos '+(+id[2]+1):'Semifinal '+(+id[2]+1),a:p[0].i,b:p[1].i})});
  return o}
function setScore(c,m){
  const x=S[c].go.filter(g=>g.m===m.key),grp=m.key.includes('-'),box=grp?S[c].r:S[c].k;
  if(!x.length){delete box[m.key];return}
  box[m.key]=[x.filter(g=>g.t===m.a).length,x.filter(g=>g.t===m.b).length]}
function scorers(c){
  const o={};S[c].go.forEach(g=>{const k=g.t+'|'+g.p.trim().toLowerCase();(o[k]=o[k]||{p:g.p.trim(),t:g.t,n:0}).n++});
  return Object.values(o).sort((a,b)=>b.n-a.n||a.p.localeCompare(b.p))}
function scorersView(c){
  const s=scorers(c).slice(0,8);if(!s.length)return '';
  let h='<h3 class="d">Goleadores</h3><div class="cal">';
  s.forEach((x,i)=>h+='<div class="row"><b class="rk">'+(i+1)+'</b><span>'+esc(x.p)+'</span><span class="t">'+lg(c,x.t)+esc(S[c].t[x.t])+'</span><b>'+x.n+'</b></div>');
  return h+'</div>'}
function panelView(){
  const c=pc,ms=matchList(c);
  if(!ms.find(x=>x.key===pm))pm=ms[0].key;
  const m=ms.find(x=>x.key===pm),T=S[c].t,gl=S[c].go.map((g,i)=>({...g,i})).filter(g=>g.m===pm);
  const r=m.key.includes('-')?S[c].r[m.key]:S[c].k[m.key];
  let h='<h2 class="d">Panel</h2><p class="sub">Equipos, logos y goles de cada categoría.</p><div class="fm ft"><select data-pc aria-label="Categoría">'+CATS.map(x=>'<option value="'+x.id+'"'+(x.id===c?' selected':'')+'>'+x.n+'</option>').join('')+'</select></div>';
  h+='<h3 class="d">Equipos y logos</h3><input type="file" id="fi" accept="image/*" hidden><div class="tl">';
  T.forEach((n,i)=>h+='<div class="tr"><button class="up" data-up="'+i+'" aria-label="Subir logo">'+lg(c,i)+'</button><input class="nm" maxlength="'+MAX_NAME+'" data-n="'+i+'" value="'+esc(n)+'" aria-label="Nombre del equipo"></div>');
  h+='</div><p class="sub">Tocá el círculo para subir el logo. Se achica solo.</p>';
  h+='<h3 class="d">Goles</h3><div class="fm"><select data-pm aria-label="Partido">'+ms.map(x=>'<option value="'+x.key+'"'+(x.key===pm?' selected':'')+'>'+esc(x.label)+': '+esc(T[x.a])+' vs '+esc(T[x.b])+'</option>').join('')+'</select></div>';
  h+='<p class="sl">'+lg(c,m.a)+esc(T[m.a])+' '+(played(r)?r[0]+' - '+r[1]:'vs')+' '+lg(c,m.b)+esc(T[m.b])+'</p>';
  h+='<div class="fm"><select id="gt" aria-label="Equipo"><option value="'+m.a+'">'+esc(T[m.a])+'</option><option value="'+m.b+'">'+esc(T[m.b])+'</option></select><input id="gp" maxlength="'+MAX_PLAYER+'" placeholder="Jugador" aria-label="Jugador"><input id="gm" class="mi" type="number" min="1" max="200" placeholder="Min" aria-label="Minuto"><button class="btn" data-add>Agregar gol</button></div>';
  gl.forEach(g=>h+='<div class="gl"><span class="dy mn">'+(g.min?g.min+'’':'')+'</span><span>'+esc(g.p)+'</span><span class="dy">'+esc(T[g.t])+'</span><button data-del="'+g.i+'">Quitar</button></div>');
  return h+'<p class="sub">El resultado del partido se calcula con los goles cargados.</p>'}
function loginView(){
  return '<h2 class="d">Administración</h2><p class="sub">Ingresá con la cuenta de administrador para cargar resultados.</p><form id="login" class="fm"><input type="email" name="email" autocomplete="username" required placeholder="Email" aria-label="Email"><input type="password" name="password" autocomplete="current-password" required placeholder="Contraseña" aria-label="Contraseña"><button class="btn">Entrar</button></form><p class="sub" id="lerr"></p>'}
function logoUp(f,c){
  if(!f)return;
  if(!/^image\//.test(f.type)||f.size>MAX_LOGO_BYTES){alert('Elegí una imagen de hasta 5 MB.');return}
  const fr=new FileReader();
  fr.onload=()=>{const im=new Image();im.onload=()=>{const z=128,cv=document.createElement('canvas');cv.width=cv.height=z;const k=Math.min(z/im.width,z/im.height),w=im.width*k,h=im.height*k;cv.getContext('2d').drawImage(im,(z-w)/2,(z-h)/2,w,h);S[c].l[upIdx]=cleanLogo(cv.toDataURL('image/png'));save(c);render()};im.src=fr.result};
  fr.readAsDataURL(f)}
const quiereAdmin=()=>location.pathname.replace(/\/+$/,'')==='/admin'||location.hash==='#admin';
const isAdm=()=>!!session;
function ro(){
  const a=document.getElementById('app'),sw=(i,cl,t)=>{const x=document.createElement('span');x.className=cl;x.textContent=t;i.replaceWith(x)};
  a.querySelectorAll('input.sc').forEach(i=>sw(i,'sc ro',i.value===''?'–':i.value));
  a.querySelectorAll('input.nm').forEach(i=>sw(i,'nm ro',i.value));
  a.querySelectorAll('select').forEach(i=>sw(i,'',i.options[i.selectedIndex].text))}
function render(){
  const login=quiereAdmin()&&!session;
  if(view==='panel'&&!isAdm())view='ma';
  document.getElementById('track').innerHTML=[0,1,2,3,4,5].map(i=>'<i'+(listo&&stageDone(i)?' class="on"':'')+'></i>').join('');
  document.getElementById('tabs').innerHTML=CATS.concat([{id:'cal',n:'Calendario'}],isAdm()?[{id:'panel',n:'Panel'}]:[]).map(c=>'<button role="tab" aria-selected="'+(view===c.id)+'" tabindex="'+(view===c.id?0:-1)+'" data-v="'+c.id+'">'+c.n+'</button>').join('');
  let body;
  if(!listo)body='<p class="sub">Cargando los datos…</p>';
  else if(login)body=loginView();
  else body=(view==='cal'?calView():view==='panel'?panelView():catView(view))+(isAdm()?'<button class="reset">Borrar todos los datos</button> <button class="lk" data-logout>Cerrar sesión</button>':'');
  document.getElementById('app').innerHTML=(sinConexion?'<p class="sub">Sin conexión: se muestran los últimos datos guardados en este dispositivo.</p>':'')+body;
  document.getElementById('adm').hidden=!isAdm();
  if(listo&&!isAdm()&&!login)ro()}
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-v]');if(b){view=b.dataset.v;render();scrollTo(0,0)}
  const gl=e.target.closest('[data-gl]');if(gl){pc=view;pm=gl.dataset.gl;view='panel';render();scrollTo(0,0)}
  const u=e.target.closest('[data-up]');if(u){upIdx=+u.dataset.up;document.getElementById('fi').click()}
  if(e.target.closest('[data-logout]'))db.auth.signOut();
  if(e.target.dataset.add!==undefined){const p=document.getElementById('gp').value.trim().slice(0,MAX_PLAYER);if(p){S[pc].go.push({m:pm,t:+document.getElementById('gt').value,p,min:cleanMin(document.getElementById('gm').value)});setScore(pc,matchList(pc).find(x=>x.key===pm));save(pc);render()}}
  const dl=e.target.closest('[data-del]');if(dl){S[pc].go.splice(+dl.dataset.del,1);setScore(pc,matchList(pc).find(x=>x.key===pm));save(pc);render()}
  if(e.target.classList.contains('reset')&&confirm('¿Borrar todos los equipos y resultados?')){S=fresh();save();render()}});
document.addEventListener('change',e=>{
  const t=e.target,c=(view==='panel'?pc:view);
  if(t.id==='fi'){logoUp(t.files[0],c);return}
  if(t.dataset.pc!==undefined){pc=t.value;pm='';render();return}
  if(t.dataset.pm!==undefined){pm=t.value;render();return}
  if(t.dataset.r!==undefined){const r=S[c].r[t.dataset.r]||['',''];r[+t.dataset.s]=cleanScore(t.value);S[c].r[t.dataset.r]=r}
  else if(t.dataset.k!==undefined){const r=S[c].k[t.dataset.k]||['',''];r[+t.dataset.s]=cleanScore(t.value);S[c].k[t.dataset.k]=r}
  else if(t.dataset.p!==undefined)S[c].k[t.dataset.p+'p']=t.value==='0'||t.value==='1'?t.value:'';
  else if(t.dataset.n!==undefined)S[c].t[+t.dataset.n]=cleanName(t.value,'Equipo '+(+t.dataset.n+1));
  else return;
  save(c);render()});
document.addEventListener('submit',async e=>{
  if(e.target.id!=='login')return;
  e.preventDefault();
  const f=e.target,{error}=await db.auth.signInWithPassword({email:f.email.value.trim(),password:f.password.value});
  if(error){const m=document.getElementById('lerr');if(m)m.textContent='Email o contraseña incorrectos.'}});
document.getElementById('tabs').addEventListener('keydown',e=>{
  if(e.key!=='ArrowRight'&&e.key!=='ArrowLeft')return;
  const b=[...document.querySelectorAll('#tabs [data-v]')],i=b.indexOf(document.activeElement);
  if(i<0)return;
  view=b[(i+(e.key==='ArrowRight'?1:b.length-1))%b.length].dataset.v;render();scrollTo(0,0);
  document.querySelector('#tabs [data-v="'+view+'"]').focus()});
addEventListener('hashchange',render);
db.auth.onAuthStateChange((_e,s)=>{session=s;render()});
S=fresh();
render();
cargar();
if('serviceWorker' in navigator)navigator.serviceWorker.register('/sw.js');
