/*
  1) Supabase project yarating.
  2) Quyidagi ikkita qiymatni Supabase dashboarddan olingan URL va publishable/anon key bilan almashtiring.
  3) supabase.sql faylidagi SQL ni SQL Editor'da ishga tushiring.
*/
const SUPABASE_URL = "https://crcolnkwgqlhhwnmxvil.supabase.co";
const SUPABASE_KEY = "YOUR_SUPABASE_PUBLISHABLE_KEY";

const demoWords = [
  {word:"abandon",meaning:"tark etmoq",pron:"/əˈbændən/",example:"He decided to abandon the plan.",level:"B1"},
  {word:"achieve",meaning:"erishmoq",pron:"/əˈtʃiːv/",example:"She worked hard to achieve her goal.",level:"B1"},
  {word:"benefit",meaning:"foyda",pron:"/ˈbenɪfɪt/",example:"Exercise has many benefits.",level:"B1"},
  {word:"challenge",meaning:"qiyinchilik",pron:"/ˈtʃælɪndʒ/",example:"Learning English is a challenge.",level:"B1"},
  {word:"reliable",meaning:"ishonchli",pron:"/rɪˈlaɪəbəl/",example:"He is a reliable friend.",level:"B2"},
  {word:"significant",meaning:"muhim, sezilarli",pron:"/sɪɡˈnɪfɪkənt/",example:"There was a significant change.",level:"B2"},
  {word:"perspective",meaning:"nuqtai nazar",pron:"/pərˈspektɪv/",example:"Try to see it from my perspective.",level:"B2"},
  {word:"enhance",meaning:"yaxshilamoq",pron:"/ɪnˈhæns/",example:"This course will enhance your skills.",level:"C1"},
  {word:"inevitable",meaning:"muqarrar",pron:"/ɪnˈevɪtəbəl/",example:"Change is inevitable.",level:"C1"},
  {word:"compelling",meaning:"ishontiruvchi",pron:"/kəmˈpelɪŋ/",example:"She gave a compelling argument.",level:"C1"}
];

let sb = null;
let user = null;
let words = [...demoWords];
let filtered = words;
let idx = 0, shown = false, levelNow = "all";
let quiz = [], qi = 0, qscore = 0, answered = false;
let authMode = "login";

function configured(){return !SUPABASE_URL.startsWith("YOUR_") && !SUPABASE_KEY.startsWith("YOUR_")}

async function boot(){
  if(configured()){
    sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    const {data} = await sb.auth.getSession();
    user = data.session?.user || null;
    sb.auth.onAuthStateChange((_e,session)=>{user=session?.user||null; updateUserUI(); loadUserData()});
  }
  updateUserUI(); renderCard(); renderList(); updateStats();
}
async function loadUserData(){
  if(!user){words=[...demoWords];renderList();updateStats();return}
  const {data,error}=await sb.from("user_words").select("*").order("created_at",{ascending:false});
  if(!error && data) words=[...demoWords,...data.map(x=>({id:x.id,word:x.word,meaning:x.meaning,pron:x.pron||"—",example:x.example||"",level:x.level}))];
  filtered=levelNow==="all"?words:words.filter(w=>w.level===levelNow);
  renderCard();renderList();updateStats();
}
function updateUserUI(){
  const area=document.getElementById("userArea"), notice=document.getElementById("authNotice");
  if(user){
    area.innerHTML=`<span class="muted">${escapeHtml(user.email||"Foydalanuvchi")}</span><button class="danger" onclick="logout()">Chiqish</button>`;
    notice.style.display="none";
    document.getElementById("profileName").textContent="WordUp foydalanuvchisi";
    document.getElementById("profileEmail").textContent=user.email||"";
    document.getElementById("logout").style.display="inline-block";
  }else{
    area.innerHTML=`<button class="ghost" onclick="openAuth('login')">Kirish</button><button class="primary small" onclick="openAuth('signup')">Ro‘yxatdan o‘tish</button>`;
    notice.style.display="flex";
    document.getElementById("profileName").textContent="Mehmon";
    document.getElementById("profileEmail").textContent="Akkauntga kirmagansiz";
    document.getElementById("logout").style.display="none";
  }
}
function show(id,btn){
  document.querySelectorAll(".page").forEach(x=>x.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  if(btn){document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));btn.classList.add("active")}
  if(id==="quiz")startQuiz();
  if(id==="words")renderList();
  if(id==="profile")updateStats();
}
function setLevel(l,b){
  document.querySelectorAll(".level").forEach(x=>x.classList.remove("active"));b.classList.add("active");
  levelNow=l;filtered=l==="all"?words:words.filter(w=>w.level===l);idx=0;shown=false;renderCard();
}
function renderCard(){
  if(!filtered.length)return;
  const w=filtered[idx%filtered.length];
  document.getElementById("word").textContent=w.word;
  document.getElementById("pron").textContent=w.pron;
  document.getElementById("badge").textContent=w.level;
  document.getElementById("example").textContent=w.example;
  document.getElementById("meaning").textContent=shown?w.meaning:"••••••••";
  document.getElementById("reveal").textContent=shown?"Tarjimasini yashir":"Tarjimasini ko‘rsat";
  document.getElementById("current").textContent=idx%filtered.length+1;
  document.getElementById("count").textContent=filtered.length;
}
function reveal(){shown=!shown;renderCard()}
function speak(){const u=new SpeechSynthesisUtterance(filtered[idx%filtered.length].word);u.lang="en-US";speechSynthesis.speak(u)}
async function nextWord(known){
  const w=filtered[idx%filtered.length];
  if(known && user && sb) await sb.from("learned_words").upsert({user_id:user.id,word:w.word},{onConflict:"user_id,word"});
  idx++;shown=false;renderCard();updateStats();
}
async function addWord(){
  const word=document.getElementById("newWord").value.trim(), meaning=document.getElementById("newMeaning").value.trim();
  if(!word||!meaning)return alert("English so‘z va tarjimasini kiriting.");
  const obj={word,meaning,pron:document.getElementById("newPron").value.trim()||"—",example:document.getElementById("newExample").value.trim()||"Own example.",level:document.getElementById("newLevel").value};
  if(!user||!sb){alert("Avval akkauntga kiring — shunda so‘z online saqlanadi.");openAuth("login");return}
  const {error}=await sb.from("user_words").insert({...obj,user_id:user.id});
  if(error)return alert("Saqlashda xatolik: "+error.message);
  ["newWord","newMeaning","newPron","newExample"].forEach(id=>document.getElementById(id).value="");
  await loadUserData();alert("✅ So‘z online saqlandi!");
}
function renderList(){
  const box=document.getElementById("myWords");
  const mine=user?words.filter(w=>w.id):[];
  document.getElementById("wordTotal").textContent=mine.length;
  if(!user){box.innerHTML="<p class='muted'>So‘zlaringizni saqlash uchun akkauntga kiring.</p>";return}
  if(!mine.length){box.innerHTML="<p class='muted'>Hali so‘z qo‘shilmagan.</p>";return}
  box.innerHTML=mine.map(w=>`<div class="word-item"><div><b>${escapeHtml(w.word)}</b><br><small>${escapeHtml(w.meaning)} · ${w.level}</small></div><button class="del" onclick="deleteWord('${w.id}')">✕</button></div>`).join("");
}
async function deleteWord(id){
  if(!user||!sb)return;
  const {error}=await sb.from("user_words").delete().eq("id",id);
  if(error)return alert(error.message);
  loadUserData();
}
function startQuiz(){quiz=[...words].sort(()=>Math.random()-.5).slice(0,Math.min(10,words.length));qi=0;qscore=0;document.getElementById("quizResult").innerHTML="";showQuiz()}
function showQuiz(){
  if(qi>=quiz.length){document.getElementById("answers").innerHTML="";document.getElementById("quizWord").textContent="";document.getElementById("quizResult").innerHTML=`<div class="center"><h3>🎉 Natija: ${qscore}/${quiz.length}</h3><button class="primary" onclick="startQuiz()">Qayta boshlash</button></div>`;document.getElementById("statQuiz").textContent=qscore;return}
  answered=false;document.getElementById("nextQuizBtn").disabled=true;document.getElementById("quizNo").textContent=`${qi+1} / ${quiz.length}`;
  const w=quiz[qi];document.getElementById("quizWord").textContent=w.word;
  const opts=[w.meaning,...words.filter(x=>x.word!==w.word).sort(()=>Math.random()-.5).slice(0,3).map(x=>x.meaning)].sort(()=>Math.random()-.5);
  document.getElementById("answers").innerHTML=opts.map(o=>`<button class="answer" onclick="answer(this,${JSON.stringify(w.meaning)})">${escapeHtml(o)}</button>`).join("");
}
function answer(btn,correct){
  if(answered)return;answered=true;const ok=btn.textContent===correct;
  if(ok){btn.classList.add("correct");qscore++}else{btn.classList.add("wrong");document.querySelectorAll(".answer").forEach(x=>{if(x.textContent===correct)x.classList.add("correct")})}
  document.getElementById("nextQuizBtn").disabled=false;
}
function nextQuiz(){qi++;showQuiz()}
function openAuth(mode){authMode=mode;document.getElementById("authModal").classList.remove("hidden");document.getElementById("authMsg").textContent="";setAuthText()}
function closeAuth(){document.getElementById("authModal").classList.add("hidden")}
function switchAuth(){authMode=authMode==="login"?"signup":"login";setAuthText()}
function setAuthText(){
  document.getElementById("authTitle").textContent=authMode==="login"?"Kirish":"Ro‘yxatdan o‘tish";
  document.getElementById("authText").textContent=authMode==="login"?"Email va parolingizni kiriting.":"Email va yangi parolingizni kiriting.";
  document.getElementById("authBtn").textContent=authMode==="login"?"Kirish":"Ro‘yxatdan o‘tish";
  document.getElementById("switchAuth").textContent=authMode==="login"?"Ro‘yxatdan o‘tish":"Kirish";
}
async function submitAuth(){
  if(!sb)return document.getElementById("authMsg").textContent="Avval app.js ichidagi Supabase URL va key ni sozlash kerak.";
  const email=document.getElementById("authEmail").value.trim(),password=document.getElementById("authPassword").value;
  if(!email||!password)return;
  const res=authMode==="signup"?await sb.auth.signUp({email,password}):await sb.auth.signInWithPassword({email,password});
  if(res.error){document.getElementById("authMsg").textContent=res.error.message;return}
  document.getElementById("authMsg").className="msg ok";
  document.getElementById("authMsg").textContent=authMode==="signup"?"Akkaunt yaratildi. Email tasdiqlash kerak bo‘lishi mumkin.":"Muvaffaqiyatli kirdingiz.";
  if(authMode==="login")setTimeout(closeAuth,500);
}
async function logout(){if(sb)await sb.auth.signOut();user=null;updateUserUI();loadUserData()}
async function updateStats(){
  document.getElementById("statWords").textContent=user?words.filter(w=>w.id).length:0;
  if(user&&sb){const {count}=await sb.from("learned_words").select("*",{count:"exact",head:true}).eq("user_id",user.id);document.getElementById("statLearned").textContent=count||0}else document.getElementById("statLearned").textContent=0;
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m]))}
boot();
