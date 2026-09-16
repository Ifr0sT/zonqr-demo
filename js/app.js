(function(){
var D=window.ZONQR_DATA||{businesses:[],categories:[],zone:{center:[25.5608,-108.4676]}};
var businesses=D.businesses||[],categories=D.categories||[],zone=D.zone||{center:[25.5608,-108.4676]};
var userPos=null,cat='all',q='',map=null,markers=null,view='list';
var $=function(s){return document.querySelector(s)};
function hav(a,b,c,d){var R=6371e3,p1=a*Math.PI/180,p2=c*Math.PI/180,dp=(c-a)*Math.PI/180,dl=(d-b)*Math.PI/180;var x=Math.sin(dp/2)**2+Math.cos(p1)*Math.cos(p2)*Math.sin(dl/2)**2;return 2*R*Math.atan2(Math.sqrt(x),Math.sqrt(1-x))}
function dt(m){return m==null?'':(m<1000?Math.round(m)+' m':(m/1000).toFixed(1)+' km')}
function revs(id){try{return JSON.parse(localStorage.getItem('zonqr_reviews')||'{}')[id]||[]}catch(e){return[]}}
function saveR(id,r){var a=JSON.parse(localStorage.getItem('zonqr_reviews')||'{}');a[id]=a[id]||[];a[id].unshift(r);localStorage.setItem('zonqr_reviews',JSON.stringify(a))}
function avg(b){var rs=revs(b.id);if(!rs.length)return b.rating||0;return Math.round(rs.reduce(function(n,x){return n+x.stars},0)/rs.length*10)/10}
function list(){return businesses.map(function(b){var c=Object.assign({},b);c.distance=userPos?hav(userPos[0],userPos[1],b.lat,b.lng):hav(zone.center[0],zone.center[1],b.lat,b.lng);return c}).filter(function(b){if(cat!=='all'&&b.category!==cat)return false;if(!q)return true;return (b.name+' '+b.description+' '+b.categoryLabel).toLowerCase().indexOf(q)>=0}).sort(function(a,b){return a.distance-b.distance})}
function render(){
  var el=$('#categories'); if(el){el.innerHTML=categories.map(function(c){return '<button type="button" data-cat="'+c.id+'" class="'+(c.id===cat?'active':'')+'">'+c.label+'</button>'}).join('');el.querySelectorAll('button').forEach(function(btn){btn.onclick=function(){cat=btn.dataset.cat;render()}})}
  var L=list(), box=$('#list-view'), cnt=$('#result-count'); if(cnt)cnt.textContent=L.length+' lugares';
  if(box){box.innerHTML=L.map(function(b){var img=(b.photos&&b.photos[0])||'';return '<article class="card-biz" data-id="'+b.id+'">'+(img?'<img src="'+img+'" alt="">':'<div class="ph"></div>')+'<div><h3>'+b.name+(b.destacado?' <span class="tag">Destacado</span>':'')+'</h3><p>'+b.categoryLabel+' · ★ '+avg(b).toFixed(1)+' · '+dt(b.distance)+'</p>'+(b.promo?'<p class="promo">'+b.promo+'</p>':'')+'</div></article>'}).join('')||'<p class="empty">Sin resultados</p>';box.querySelectorAll('.card-biz').forEach(function(n){n.onclick=function(){open(n.dataset.id)}})}
  if(view==='map'){initMap();upd()}
}
function initMap(){if(map||typeof L==='undefined'){if(map&&map.invalidateSize)map.invalidateSize();return}map=L.map('map').setView(zone.center,15);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19}).addTo(map);markers=L.layerGroup().addTo(map);upd();var ld=$('#map-loading');if(ld)ld.classList.add('hidden')}
function upd(){if(!markers)return;markers.clearLayers();list().forEach(function(b){var m=L.marker([b.lat,b.lng]).addTo(markers);m.bindPopup('<strong>'+b.name+'</strong><br><a href="#" class="pop" data-id="'+b.id+'">Ver detalle</a>');m.on('popupopen',function(){var a=document.querySelector('.pop[data-id="'+b.id+'"]');if(a)a.onclick=function(e){e.preventDefault();open(b.id)}}})}
function open(id){var b=businesses.find(function(x){return x.id===id});if(!b)return;var d=userPos?hav(userPos[0],userPos[1],b.lat,b.lng):hav(zone.center[0],zone.center[1],b.lat,b.lng);var rs=revs(id);var ov=$('#modal-overlay'),md=$('#modal-content');
 md.innerHTML='<button class="modal-close" id="mc">×</button><h2>'+b.name+'</h2><p>★ '+avg(b).toFixed(1)+' · '+dt(d)+' · '+b.status+'</p><p>'+b.description+'</p>'+(b.promo?'<p class="promo">'+b.promo+'</p>':'')+'<p>'+b.address+' · '+b.hours+'</p><div class="row"><a class="btn lime" href="https://wa.me/'+b.whatsapp+'" target="_blank">WhatsApp</a><a class="btn ghost" href="https://www.google.com/maps/dir/?api=1&destination='+b.lat+','+b.lng+'" target="_blank">Cómo llegar</a></div>'+(b.photos||[]).map(function(s){return '<img class="gal" src="'+s+'" alt="">'}).join('')+'<h3>Reseñas</h3><form id="rf"><select id="st"><option>5</option><option>4</option><option>3</option><option>2</option><option>1</option></select><input id="rt" placeholder="Tu opinión" required><button class="btn lime" type="submit">Publicar</button></form><div>'+(rs.map(function(r){return '<p>★'+r.stars+' — '+r.text+'</p>'}).join('')||'<p>Sé el primero.</p>')+'</div>';
 ov.classList.add('open');$('#mc').onclick=function(){ov.classList.remove('open')};$('#rf').onsubmit=function(e){e.preventDefault();saveR(id,{stars:+$('#st').value,text:$('#rt').value});open(id);render()}}
function setView(v){view=v;document.querySelectorAll('.view-toggle button').forEach(function(b){b.classList.toggle('active',b.dataset.view===v)});if(v==='list'){$('#list-view').classList.remove('hidden');$('#map-view').classList.remove('active')}else{$('#list-view').classList.add('hidden');$('#map-view').classList.add('active');setTimeout(initMap,50)}}
if($('#search-input'))$('#search-input').addEventListener('input',function(e){q=e.target.value.toLowerCase().trim();render()});
document.querySelectorAll('.view-toggle button').forEach(function(b){b.addEventListener('click',function(){setView(b.dataset.view)})});
if($('#modal-overlay'))$('#modal-overlay').addEventListener('click',function(e){if(e.target.id==='modal-overlay')e.target.classList.remove('open')});
if(navigator.geolocation)navigator.geolocation.getCurrentPosition(function(p){userPos=[p.coords.latitude,p.coords.longitude];render()},function(){},{timeout:8000});
if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js').catch(function(){});
render();
})();
