import { initializeApp } from "https://www.gstatic.com/firebasejs/13.3.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/13.3.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, collection, addDoc, getDocs, deleteDoc, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/13.3.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const $ = id => document.getElementById(id);
const configured = firebaseConfig.apiKey !== "PASTE_API_KEY" && firebaseConfig.projectId !== "PASTE_PROJECT_ID";
let auth, db, currentUser = null, postsCache = [], galleryCache = [];
const defaults = {
  hero: "Welcome to FF ID STORE. Explore community posts, gaming highlights and official group links.",
  whatsapp: "", telegram: "", instagram: "", phone: "",
  contact: "For questions and support, reach us through our social channels."
};
const safeLink = value => { try { const u = new URL(value); return ["https:","http:"].includes(u.protocol) ? u.href : "#"; } catch { return "#"; } };
const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function setMessage(id, msg) { $(id).textContent = msg; }
function waUrl(phone) { const digits = String(phone || "").replace(/\D/g,""); return digits ? `https://wa.me/${digits}` : "#"; }

async function readSettings() {
  if (!configured) return defaults;
  try { const snap = await getDoc(doc(db,"site","settings")); return snap.exists() ? {...defaults,...snap.data()} : defaults; }
  catch (e) { console.warn(e); return defaults; }
}
async function renderSettings() {
  const s = await readSettings();
  $("heroText").textContent = s.hero;
  $("contactText").textContent = s.contact;
  $("heroWa").href = safeLink(s.whatsapp);
  $("heroTg").href = safeLink(s.telegram);
  $("contactWa").href = waUrl(s.phone);
  const links = [
    ["WhatsApp","WhatsApp community group","🟢",s.whatsapp],
    ["Instagram","Instagram community or profile","📸",s.instagram],
    ["Telegram","Telegram announcements and group","✈️",s.telegram]
  ];
  $("groupCards").innerHTML = links.map(([name,desc,emoji,url]) => `<article class="group"><div class="emoji">${emoji}</div><h3>${name}</h3><p>${desc}</p><a class="btn outline" href="${safeLink(url)}" target="_blank" rel="noopener">Open ${name}</a></article>`).join("");
}
async function renderPosts() {
  if (!configured) { $("listingCards").innerHTML = '<p class="muted">Connect Firebase to publish live store posts.</p>'; return; }
  try {
    const snap = await getDocs(query(collection(db,"listings"),orderBy("createdAt","desc")));
    postsCache = snap.docs.map(d => ({id:d.id,...d.data()}));
    $("listingCards").innerHTML = postsCache.length ? postsCache.map(p => `<article class="card"><div class="card-top">🎮</div><div class="card-body"><span class="tag">${escapeHtml(p.type || "UPDATE")}</span><h3>${escapeHtml(p.title)}</h3><p>${escapeHtml(p.description)}</p><div class="card-foot"><b>${escapeHtml(p.priceLabel || "")}</b>${p.infoUrl ? `<a class="btn outline small" href="${safeLink(p.infoUrl)}" target="_blank" rel="noopener">Official info</a>` : ""}</div></div></article>`).join("") : '<p class="muted">No posts published yet.</p>';
  } catch(e) { $("listingCards").innerHTML = '<p class="muted">Could not load posts. Check Firestore setup and security rules.</p>'; console.error(e); }
}
async function renderGallery() {
  if (!configured) { $("galleryCards").innerHTML = '<p class="muted">Connect Firebase to publish gallery images.</p>'; return; }
  try {
    const snap = await getDocs(query(collection(db,"gallery"),orderBy("createdAt","desc")));
    galleryCache = snap.docs.map(d=>({id:d.id,...d.data()}));
    $("galleryCards").innerHTML = galleryCache.length ? galleryCache.map(g=>`<article class="gallery-item"><img src="${safeLink(g.imageUrl)}" alt="${escapeHtml(g.caption)}" loading="lazy"><p>${escapeHtml(g.caption)}</p></article>`).join("") : '<p class="muted">Gallery is waiting for its first image.</p>';
  } catch(e) { $("galleryCards").innerHTML = '<p class="muted">Could not load gallery.</p>'; console.error(e); }
}
async function refreshAll(){await renderSettings();await Promise.all([renderPosts(),renderGallery()]);}
function showDashboard(user){
  currentUser=user; $("loginPanel").hidden=true; $("dashboard").hidden=false; $("signedInAs").textContent=user.email || "Admin signed in"; loadSettingsIntoForm();
  refreshManageLists();
}
async function loadSettingsIntoForm(){const s=await readSettings();$("setHero").value=s.hero;$("setWa").value=s.whatsapp;$("setTg").value=s.telegram;$("setInsta").value=s.instagram;$("setPhone").value=s.phone;$("setContact").value=s.contact;}
async function refreshManageLists(){
  const p=await getDocs(query(collection(db,"listings"),orderBy("createdAt","desc")));
  $("adminPostList").innerHTML=p.docs.map(d=>`<div class="manage-row"><span>${escapeHtml(d.data().title || "Untitled")}</span><button class="delete" data-delete-post="${d.id}">Delete</button></div>`).join("") || '<p class="muted">No posts yet.</p>';
  const g=await getDocs(query(collection(db,"gallery"),orderBy("createdAt","desc")));
  $("adminGalleryList").innerHTML=g.docs.map(d=>`<div class="manage-row"><span>${escapeHtml(d.data().caption || "Image")}</span><button class="delete" data-delete-gallery="${d.id}">Delete</button></div>`).join("") || '<p class="muted">No gallery images yet.</p>';
}
if (configured) {
  const app=initializeApp(firebaseConfig); auth=getAuth(app); db=getFirestore(app);
  onAuthStateChanged(auth,user=>{if(user && !$("adminDialog").open) { currentUser=user; }});
} else { $("setupNotice").hidden=false; $("loginBtn").disabled=true; setMessage("loginMsg","Firebase config has not been added yet."); }
await refreshAll();

$("openAdmin").addEventListener("click",()=> $("adminDialog").showModal());
$("closeAdmin").addEventListener("click",()=> $("adminDialog").close());
$("loginBtn").addEventListener("click",async()=>{
  if(!configured)return;
  setMessage("loginMsg","Signing in…");
  try{const cred=await signInWithEmailAndPassword(auth,$("adminEmail").value.trim(),$("adminPass").value);showDashboard(cred.user);setMessage("loginMsg","");}
  catch(e){setMessage("loginMsg","Sign-in failed: "+(e.code || e.message));}
});
$("logoutBtn").addEventListener("click",async()=>{await signOut(auth);currentUser=null;$("dashboard").hidden=true;$("loginPanel").hidden=false;});
$("saveSettings").addEventListener("click",async()=>{
 try{await setDoc(doc(db,"site","settings"),{hero:$("setHero").value.trim(),whatsapp:$("setWa").value.trim(),telegram:$("setTg").value.trim(),instagram:$("setInsta").value.trim(),phone:$("setPhone").value.trim(),contact:$("setContact").value.trim(),updatedAt:serverTimestamp()});setMessage("settingsMsg","Saved. Visitors will see the update.");await renderSettings();}
 catch(e){setMessage("settingsMsg","Could not save: "+e.message);}
});
$("addPost").addEventListener("click",async()=>{
 const title=$("postTitle").value.trim(),description=$("postDesc").value.trim();
 if(!title||!description){alert("Add a title and description.");return;}
 try{await addDoc(collection(db,"listings"),{type:$("postType").value,title,description,priceLabel:$("postPrice").value.trim(),infoUrl:$("postUrl").value.trim(),createdAt:serverTimestamp()});$("postTitle").value="";$("postDesc").value="";$("postPrice").value="";$("postUrl").value="";await renderPosts();await refreshManageLists();alert("Post published.");}
 catch(e){alert("Could not publish: "+e.message);}
});
$("addGallery").addEventListener("click",async()=>{
 const imageUrl=$("galleryUrl").value.trim(),caption=$("galleryCaption").value.trim();
 if(safeLink(imageUrl)==="#"||!caption){alert("Enter a valid https image URL and caption.");return;}
 try{await addDoc(collection(db,"gallery"),{imageUrl,caption,createdAt:serverTimestamp()});$("galleryUrl").value="";$("galleryCaption").value="";await renderGallery();await refreshManageLists();alert("Gallery image added.");}
 catch(e){alert("Could not add image: "+e.message);}
});
document.addEventListener("click",async e=>{
 const p=e.target.closest("[data-delete-post]"),g=e.target.closest("[data-delete-gallery]");
 if(p&&confirm("Delete this post?")){await deleteDoc(doc(db,"listings",p.dataset.deletePost));await renderPosts();await refreshManageLists();}
 if(g&&confirm("Delete this gallery image?")){await deleteDoc(doc(db,"gallery",g.dataset.deleteGallery));await renderGallery();await refreshManageLists();}
});
document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>{
 document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x===b));
 ["settings","posts","galleryAdmin"].forEach(id=>$( "tab-"+id).hidden=id!==b.dataset.tab);
}));
$("year").textContent=new Date().getFullYear();
