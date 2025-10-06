// pre_sat_app.js
// -----------------------------
//  REPLACE THESE with your Supabase project values:
const SUPABASE_URL = 'https://piwfimfusutmuqjnhayy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpd2ZpbWZ1c3V0bXVxam5oYXl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1NjA2NDgsImV4cCI6MjA3NTEzNjY0OH0.DPBp3cmdQsyGzsUc7uQoXZB4y6kb6x7mR7wRlXG-Ulg';
// -----------------------------
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM refs
const tabLogin = document.getElementById('tabLogin');
const tabRegister = document.getElementById('tabRegister');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

const avatarList = document.getElementById('avatarList');
const regName = document.getElementById('regName');
const regEmail = document.getElementById('regEmail');
const regPassword = document.getElementById('regPassword');

const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');

const authBox = document.getElementById('authBox');
const profileBox = document.getElementById('profileBox');

const profileName = document.getElementById('profileName');
const profileAvatar = document.getElementById('profileAvatar');
const welcomeSmall = document.getElementById('welcomeSmall');

const btnLogin = document.getElementById('btnLogin');
const btnRegister = document.getElementById('btnRegister');
const btnLogout = document.getElementById('btnLogout');

const btnTakeTest = document.getElementById('btnTakeTest');
const btnDashboard = document.getElementById('btnDashboard');
const btnHistory = document.getElementById('btnHistory');

const dashboard = document.getElementById('dashboard');
const testChooser = document.getElementById('testChooser');
const testPanel = document.getElementById('testPanel');
const resultPanel = document.getElementById('resultPanel');
const historyPanel = document.getElementById('historyPanel');

const statTotalTests = document.getElementById('statTotalTests');
const statAvgScore = document.getElementById('statAvgScore');
const statAvgTime = document.getElementById('statAvgTime');
const statPassChance = document.getElementById('statPassChance');

const scoresChartCtx = document.getElementById('scoresChart').getContext('2d');
let scoresChart = null;

const recentList = document.getElementById('recentList');
const allHistory = document.getElementById('allHistory');

const quoteText = document.getElementById('quoteText');

const testTitle = document.getElementById('testTitle');
const questionBox = document.getElementById('questionBox');
const prevQbtn = document.getElementById('prevQ');
const nextQbtn = document.getElementById('nextQ');
const submitTestBtn = document.getElementById('submitTestBtn');
const timeRemaining = document.getElementById('timeRemaining');

const backToDash = document.getElementById('backToDash');

// small helper utilities
const formatTime = s => {
  const mm = Math.floor(s/60).toString().padStart(2,'0');
  const ss = Math.floor(s%60).toString().padStart(2,'0');
  return `${mm}:${ss}`;
};

// built-in motivational quotes (randomized)
const QUOTES = [
  "Small progress each day adds up to big results.",
  "Practice beats talent when talent doesn't practice.",
  "Mistakes are proof you're trying. Keep pushing.",
  "Focus on progress, not perfection.",
  "A little more practice — you'll be surprised how fast you improve."
];

// avatar options (fun cartoon/adventurer style)
const AVATARS = [
  'https://api.dicebear.com/6.x/adventurer/svg?seed=cartoon1',
  'https://api.dicebear.com/6.x/adventurer/svg?seed=cartoon2',
  'https://api.dicebear.com/6.x/adventurer/svg?seed=cartoon3',
  'https://api.dicebear.com/6.x/adventurer/svg?seed=cartoon4',
  'https://api.dicebear.com/6.x/adventurer/svg?seed=cartoon5'
];

// QUESTIONS DATABASE: 3 subjects × 2 levels × 10 Q each (simplified SAT-ish)
const QUESTION_DB = {
  "Maths": {
    "Intermediate": [
      {q:"if 3x - 7 = 11, what is the value of x?", options:["2","3","5","6"], a:"6"},
      {q:"A rectanglw has a perimeter of 50 units. If the length is 15 units , what is the width?", options:["10","12","20","25"], a:"10"},
      {q:"if f(x) = 2x^2 -3x = 1, what is f(2)?", options:["3","5","7","9"], a:"3"},
      {q:"if x^2 - 5x + 6 = 0, what are the possible values of x?", options:["1,6","2,3","2,-3","3,6"], a:"2,3"},
      {q:"(Open) A train travels at a constant speed of 60 miles per hour.How far will it travel in 2 hours and 30 minutes?", input:true +"  miles", a:"150"},
      {q:"The sum of three consecutive integers is 72.What is the largest integer?", options:["23","24","25","26"], a:"25"},
      {q:"A circle has a radius of 7 units.What is its area? ( Use π )", options:["14π","49π","28π","21π"], a:"49π"},
      {q:"f 5x+2=3x+10, then x=?", options:["2","3","4","5"], a:"4"},
      {q:"A store reduces the price of a jacket by 20%.If the orignal price is $180, what is the sale price?", options:["$60","$144","$65","$216"], a:"144"},
      {q:"Solve for y: 2(y−3)=4y+2", options:["-4","-2","2","4"], a:"-4"}
    ],
    "Hard": [
      {q:"2^5 = ?", options:["16","32","64","8"], a:"32"},
      {q:"Integral of 2x dx = ?", options:["x^2","x^2 + C","2x^2","x^3"], a:"x^2 + C"},
      {q:"Solve: 3x - 6 = 9, x = ?", options:["3","4","5","1"], a:"5"},
      {q:"(Open) What is 17 × 6?", input:true, a:"102"},
      {q:"Which is prime? 49, 51, 53, 57", options:["49","51","53","57"], a:"53"},
      {q:"sqrt(144) = ?", options:["11","12","13","14"], a:"12"},
      {q:"If perimeter of square is 20, side = ?", options:["5","4","6","10"], a:"5"},
      {q:"LCM of 4 and 6 = ?", options:["12","10","8","6"], a:"12"},
      {q:"2^8 = ?", options:["128","256","512","64"], a:"256"},
      {q:"Sum of angles in triangle = ?", options:["90","180","270","360"], a:"180"}
    ],
    "Easy": [
      {q:"2^5 = ?", options:["16","32","64","8"], a:"32"},
      {q:"Integral of 2x dx = ?", options:["x^2","x^2 + C","2x^2","x^3"], a:"x^2 + C"},
      {q:"Solve: 3x - 6 = 9, x = ?", options:["3","4","5","1"], a:"5"},
      {q:"(Open) What is 17 × 6?", input:true, a:"102"},
      {q:"(Open) 13 × 7 = ?", input:true, a:"91"},
      {q:"If x=3, 2x+4=?", options:["10","8","6","12"], a:"10"},
      {q:"What is 20% of 200?", options:["20","40","30","50"], a:"40"},
      {q:"3² = ?", options:["6","9","12","15"], a:"9"},
      {q:"5 + 7 = ?", options:["11","12","13","10"], a:"12"},
      {q:"Which is prime? 9, 11, 15, 21", options:["9","11","15","21"], a:"11"}
    ]
  },

  "General Knowledge": {
    "Intermediate": [
      {q:"Capital of France?", options:["Paris","Rome","Berlin","Madrid"], a:"Paris"},
      {q:"Which planet has rings?", options:["Earth","Mars","Saturn","Venus"], a:"Saturn"},
      {q:"Largest ocean?", options:["Atlantic","Indian","Pacific","Arctic"], a:"Pacific"},
      {q:"(Open) Name largest continent.", input:true, a:"Asia"},
      {q:"Who wrote Hamlet?", options:["Shakespeare","Dickens","Homer","Plato"], a:"Shakespeare"},
      {q:"Which gas we breathe in?", options:["Oxygen","Carbon Dioxide","Hydrogen","Helium"], a:"Oxygen"},
      {q:"Which is a mammal?", options:["Shark","Dolphin","Tuna","Octopus"], a:"Dolphin"},
      {q:"Which city is the capital of India?", options:["New Delhi","Mumbai","Kolkata","Chennai"], a:"New Delhi"},
      {q:"Which country built the Great Wall?", options:["China","India","Egypt","Greece"], a:"China"},
      {q:"Which is the smallest prime?", options:["1","2","3","0"], a:"2"}
    ],
    "Hard": [
      {q:"Who discovered penicillin?", options:["Curie","Newton","Fleming","Edison"], a:"Fleming"},
      {q:"(Open) Who painted Mona Lisa?", input:true, a:"Leonardo da Vinci"},
      {q:"What is the largest planet in our solar system?", options:["Mars","Saturn","Jupiter","Earth"], a:"Jupiter"},
      {q:"UN HQ is in which city?", options:["Geneva","New York","Paris","London"], a:"New York"},
      {q:"Which element's symbol is O?", options:["Gold","Oxygen","Silver","Hydrogen"], a:"Oxygen"},
      {q:"Which year did WW2 end?", options:["1940","1945","1950","1939"], a:"1945"},
      {q:"Currency of Japan?", options:["Yen","Dollar","Euro","Rupee"], a:"Yen"},
      {q:"Biggest planet?", options:["Earth","Mars","Jupiter","Saturn"], a:"Jupiter"},
      {q:"What is photosynthesis produce?", options:["CO2","O2","N2","H2"], a:"O2"},
      {q:"Smallest continent?", options:["Europe","Australia","Antarctica","South America"], a:"Australia"}
    ],
    "Easy": [
      {q:"WWho wrote Romeo and juliet", options:["Charles Dickens","William Shakespeare","J.K Rowling","Mark Twain"], a:"William Shakespeare"},
      {q:"(Open) Capital of south korea", input:true, a:"Seoul"},
      {q:"Which country has largest population?", options:["USA","India","China","Russia"], a:"China"},
      {q:"The Great Wall is in which country?", options:["India","China","Japan","Mongolia"], a:"China"},
      {q:"Who discovered gravity?", options:["Albert Einstein","Issac Newton","Galileo Galilei","Nikola Tesla"], a:"Issac Newton"},
      {q:"India's first prime minister?", options:["Mahatma Gandhi","Jawaharlal Nehru","Sardar Patel","Indra gandhi"], a:"Jawaharlal Nehru"},
      {q:"Which festival Is known as festival of lights ", options:["holi","Diwali","Baisakhi","Ganeshutsav"], a:"Diwali"},
      {q:"Biggest planet?", options:["Earth","Mars","Jupiter","Saturn"], a:"Jupiter"},
      {q:"Longest river in the world is: ", options:["Amazon","Ganga","Nile","Mississippi"], a:"Nile"},
      {q:"Smallest continent?", options:["Europe","Australia","Antarctica","South America"], a:"Australia"}
    ]
  },

  "Aptitude": {
    "Intermediate": [
      {q:"5 + 7 = ?", options:["11","12","13","10"], a:"12"},
      {q:"If ratio 2:3 and total 25, larger is?", options:["10","15","15","20"], a:"15"},
      {q:"317 X 25 = ?", options:["7925","7920","7930","7900"], a:"7925"},
      {q:"(Open) A car travels 150km in 3 hours and 30 minutes.What is its average speed in km/h?", input:true, a:"42.86" + " km/h"},
      {q:"if 20% of a number is 50, what is the number?", options:["200","250","300","350"], a:"250"},
      {q:"which number comes next in the series:2,6,12,20,30,..?", options:["36","40","42","50"], a:"42"},
      {q:"A shopkeeper buys an article for $500 and sells it for $600.Whar is the profit percentage?", options:["15%","24%","18%","20%"], a:"20%"},
      {q:"A bag contains 6 red,4 blue and 5 green balls,What is the probability of picking a blue ball?", options:["5/13","5/14","5/17","6/15"], a:"5/15"},
      {q:"(Open)A train travels 150km in 2 hours and 30 minutes.What is its average speed?", input:true, a:"60" + " km/h"},
      {q:"A clock shows 3:00.What is the angle between the hour and minutes hands?", options:["75°","90°","95°","100°"], a:"90°"}
    ],
    "Hard": [
      {q:"7 × 8 = ?", options:["54","56","58","60"], a:"56"},
      {q:"Factorial of 4?", options:["12","24","18","16"], a:"24"},
      {q:"(Open) 11 × 14 = ?", input:true, a:"154"},
      {q:"GCD of 30 and 45?", options:["5","10","15","20"], a:"15"},
      {q:"10% of 250?", options:["25","20","30","15"], a:"25"},
      {q:"If 5x=20 then x=?", options:["2","3","4","5"], a:"4"},
      {q:"Which is square number?", options:["20","25","26","27"], a:"25"},
      {q:"If x+y=10 and x=6, y=?", options:["4","3","5","6"], a:"4"},
      {q:"What is 2^6 ?", options:["64","32","16","128"], a:"64"},
      {q:"Sum of 1 to 5 = ?", options:["10","15","12","20"], a:"15"}
    ],
    "Easy": [
      {q:"The area of a square is 49sq unit.What is the length of one side?", options:["5","6","7","8"], a:"7"},
      {q:"A bag has 5red and 3 blue balls.If one ball is picked at random,what is the probability it is blue?", options:["1/8","1/4","3/8","3/5"], a:"3/8"},
      {q:"12 ÷ 4 = ?", options:["2","3","4","6"], a:"3"},
      {q:"(Open) How many degrees in triangle?", input:true, a:"180"},
      {q:"10 × 2 = ?", options:["12","20","18","22"], a:"20"},
      {q:"Which is even prime?", options:["1","2","3","5"], a:"2"},
      {q:"Next in series 2,4,8,16,?", options:["20","24","32","30"], a:"32"},
      {q:"Probability of heads in fair coin?", options:["1/2","1/3","1/4","1/6"], a:"1/2"},
      {q:"LCM of 3 and 4?", options:["6","7","12","9"], a:"12"},
      {q:"Square root of 36?", options:["5","6","7","8"], a:"6"}
    ]
  }
};

// --------------- app state ---------------
let currentUser = null;     // supabase user object
let profile = null;         // profile row
let selectedAvatar = AVATARS[0]; // default avatar when registering

// test state
let currentTest = null;     // {subject, level, questions, index, answers[], questionTimes[], startedAt, timeLeft, timerInterval}

// randomly choose quote
quoteText.innerText = QUOTES[Math.floor(Math.random()*QUOTES.length)];

// avatars render
// render avatars in registration
function renderAvatars(){
  avatarList.innerHTML = '';
  AVATARS.forEach((url, i) => {
    const img = document.createElement('img');
    img.src = url;
    img.className = 'avatar';
    if(i===0) img.classList.add('selected');  // default selected
    img.onclick = () => {
      document.querySelectorAll('.avatar').forEach(a=>a.classList.remove('selected'));
      img.classList.add('selected');
      selectedAvatar = url;
    };
    avatarList.appendChild(img);
  });
}
renderAvatars();

// tabs
tabLogin.onclick = ()=>{ tabLogin.classList.add('active'); tabRegister.classList.remove('active'); loginForm.classList.remove('hidden'); registerForm.classList.add('hidden'); };
tabRegister.onclick = ()=>{ tabRegister.classList.add('active'); tabLogin.classList.remove('active'); loginForm.classList.add('hidden'); registerForm.classList.remove('hidden'); };

// register
btnRegister.addEventListener('click', async (e)=>{
  e.preventDefault();
  const name = regName.value.trim();
  const email = regEmail.value.trim();
  const password = regPassword.value;
  if(!name || !email || password.length < 6){ alert('Please fill name/email and password (min 6 chars).'); return; }
  btnRegister.disabled = true;
  const { data, error } = await sb.auth.signUp({ email, password });
  if(error){ alert('Sign up error: '+error.message); btnRegister.disabled = false; return; }
  // signUp succeeded; create profile
  const user = data.user;
  try{
    await sb.from('profiles').insert([{ id: user.id, full_name: name, avatar: selectedAvatar }]);
    alert('Registration successful. You may now log in.');
    // switch to login tab automatically
    tabLogin.click();
    regName.value=''; regEmail.value=''; regPassword.value='';
  }catch(err){
    console.error(err);
    alert('Error creating profile.');
  }
  btnRegister.disabled = false;
});

// login
btnLogin.addEventListener('click', async (e)=>{
  e.preventDefault();
  const email = loginEmail.value.trim();
  const password = loginPassword.value;
  if(!email || !password){ alert('Enter email and password'); return; }
  btnLogin.disabled = true;
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if(error){ alert('Login error: '+error.message); btnLogin.disabled = false; return; }
  currentUser = data.user;
  await afterLogin();
  btnLogin.disabled = false;
});

// after login: load profile and show dashboard
async function afterLogin(){
  if(!currentUser){
    // get session user
    const r = await sb.auth.getUser();
    currentUser = r.data.user;
    if(!currentUser) return;
  }
  // fetch profile
  const { data, error } = await sb.from('profiles').select('*').eq('id', currentUser.id).single();
  profile = data;
  showProfileUI();
  await loadDashboardData();
}

// show profile UI
function showProfileUI(){
  authBox.classList.add('hidden');
  profileBox.classList.remove('hidden');
  profileName.innerText = profile?.full_name || currentUser?.email;
  profileAvatar.src = profile?.avatar || selectedAvatar;
  welcomeSmall.innerText = `Welcome, ${profile?.full_name || currentUser?.email}`;
  // default show dashboard
  showDashboard();
}

// logout
btnLogout.addEventListener('click', async ()=>{
  await sb.auth.signOut();
  currentUser = null; profile = null;
  profileBox.classList.add('hidden');
  authBox.classList.remove('hidden');
  // reset visible panels
  hideAllPanels();
  loginForm.classList.remove('hidden');
  tabLogin.click();
});

// navigation
btnDashboard.addEventListener('click', showDashboard);
btnTakeTest.addEventListener('click', ()=>{ hideAllPanels(); testChooser.classList.remove('hidden'); });
btnHistory.addEventListener('click', async ()=>{ hideAllPanels(); historyPanel.classList.remove('hidden'); await renderAllHistory(); });

backToDash.addEventListener('click', showDashboard);

// hide all right-side panels
function hideAllPanels(){
  dashboard.classList.add('hidden');
  testChooser.classList.add('hidden');
  testPanel.classList.add('hidden');
  resultPanel.classList.add('hidden');
  historyPanel.classList.add('hidden');
}

// show dashboard and load stats
async function showDashboard(){
  hideAllPanels();
  dashboard.classList.remove('hidden');
  await loadDashboardData();
}

// load dashboard stats and chart
async function loadDashboardData(){
  if(!currentUser) {
    // try to load session user
    const r = await sb.auth.getUser();
    currentUser = r.data.user;
    if(!currentUser) return;
  }
  const { data: records, error } = await sb.from('results').select('*').eq('user_id', currentUser.id).order('created_at',{ascending:false});
  const recs = records || [];

  // compute stats
  const totalTests = recs.length;
  const totalScore = recs.reduce((s,r)=>s+(r.score||0),0);
  const avgScore = totalTests ? (totalScore / totalTests).toFixed(2) : 0;
  // average time per question: sum(time_taken_seconds) / (totalTests * 10) (assuming 10 q/test)
  const avgTime = totalTests ? (recs.reduce((s,r)=>s+(r.time_taken_seconds||0),0) / (totalTests*10)).toFixed(1) : 0;
  // pass chance heuristic: percentage of tests where score >= 6 (out of 10)
  const passCount = recs.filter(r=>r.score>=6).length;
  const passChance = totalTests ? Math.round((passCount/totalTests)*100) : 0;

  statTotalTests.innerText = totalTests;
  statAvgScore.innerText = avgScore;
  statAvgTime.innerText = avgTime;
  statPassChance.innerText = passChance + '%';

  // recent list
  recentList.innerHTML = '';
  recs.slice(0,5).forEach(r=>{
    const li = document.createElement('li');
    li.innerText = `${new Date(r.created_at).toLocaleString()} — ${r.subject} (${r.level}): ${r.score}/10 — ${Math.round((r.time_taken_seconds||0))}s`;
    recentList.appendChild(li);
  });

  // chart: group by subject-level (e.g. Maths-Hard -> show latest score)
  const labels = recs.map(r => `${r.subject} (${r.level[0]})`);
  const values = recs.map(r => r.score);
  if(scoresChart) scoresChart.destroy();
  scoresChart = new Chart(scoresChartCtx, {
    type: 'bar',
    data: {
      labels: labels.reverse(),
      datasets: [{ label: 'Score (last attempts first)', data: values.reverse(), backgroundColor: '#9b8cff' }]
    },
    options: {
      indexAxis: 'x',
      scales: { y: { beginAtZero: true, max: 10 } },
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

// render all history
async function renderAllHistory(){
  if(!currentUser) return;
  const { data: results } = await sb.from('results').select('*').eq('user_id', currentUser.id).order('created_at', {ascending:false});
  allHistory.innerHTML = '';
  results.forEach(r=>{
    const li = document.createElement('li');
    li.innerHTML = `<strong>${r.subject} (${r.level})</strong> — Score: ${r.score}/10 — Time: ${Math.round(r.time_taken_seconds)}s — ${new Date(r.created_at).toLocaleString()}`;
    allHistory.appendChild(li);
  });
}

// ----------------- TEST FLOW -----------------

// startTest called from HTML buttons
async function startTest(subject, level){
  if(!currentUser){ alert('Please login first'); return; }
  hideAllPanels();
  testPanel.classList.remove('hidden');
  testTitle.innerText = `${subject} — ${level}`;
  // prepare test
  const qset = (QUESTION_DB[subject] && QUESTION_DB[subject][level]) ? QUESTION_DB[subject][level] : [];
  const questions = JSON.parse(JSON.stringify(qset)); // clone
  // state
  currentTest = {
    subject,
    level,
    questions,
    index: 0,
    answers: new Array(questions.length).fill(null),
    questionTimes: new Array(questions.length).fill(0),
    startedAt: Date.now(),
    timeLeft: 10 * 60, // seconds (10 minutes) - adjust if you want smaller
    timerInterval: null,
    questionStartAt: Date.now()
  };
  // start timer
  timeRemaining.innerText = formatTime(currentTest.timeLeft);
  if(currentTest.timerInterval) clearInterval(currentTest.timerInterval);
  currentTest.timerInterval = setInterval(()=>{
    currentTest.timeLeft--;
    timeRemaining.innerText = formatTime(currentTest.timeLeft);
    if(currentTest.timeLeft <= 0){
      clearInterval(currentTest.timerInterval);
      alert('Time is up! Submitting test automatically.');
      submitTest();
    }
  }, 1000);

  renderQuestion();
}

// render a single question (index = currentTest.index)
function renderQuestion(){
  const i = currentTest.index;
  const q = currentTest.questions[i];
  // record time start for this question
  currentTest.questionStartAt = Date.now();

  questionBox.innerHTML = '';
  const qnum = document.createElement('div');
  qnum.innerHTML = `<strong>Q${i+1}.</strong> ${q.q}`;
  questionBox.appendChild(qnum);

  const opts = document.createElement('div');
  opts.className = 'options';

  if(q.input){
    const inp = document.createElement('input');
    inp.type = 'text';
    inp.name = 'answer';
    inp.value = currentTest.answers[i] || '';
    inp.placeholder = 'Type your answer';
    inp.style.padding = '10px';
    inp.style.width = '100%';
    inp.onchange = ()=> currentTest.answers[i] = inp.value.trim();
    opts.appendChild(inp);
  } else {
    (q.options || []).forEach(opt=>{
      const label = document.createElement('label');
      label.className = 'optionLabel';
      label.innerHTML = `<input type="radio" name="opt" value="${opt}" ${currentTest.answers[i]===opt ? 'checked' : ''}> ${opt}`;
      label.onclick = ()=>{
        currentTest.answers[i] = opt;
        // record time for the question: time between questionStartAt and this click
        const t = (Date.now() - currentTest.questionStartAt) / 1000;
        currentTest.questionTimes[i] = (currentTest.questionTimes[i] || 0) + t;
      };
      opts.appendChild(label);
    });
  }
  questionBox.appendChild(opts);

  // update nav buttons
  prevQbtn.style.display = i>0 ? 'inline-block' : 'none';
  nextQbtn.style.display = i < currentTest.questions.length-1 ? 'inline-block' : 'none';
}

// navigation
prevQbtn.addEventListener('click', ()=>{
  // record if input present save text
  if(currentTest.questions[currentTest.index].input){
    const el = questionBox.querySelector('input[name="answer"]');
    if(el) currentTest.answers[currentTest.index] = el.value.trim();
    // record time
    currentTest.questionTimes[currentTest.index] = currentTest.questionTimes[currentTest.index] || ((Date.now() - currentTest.questionStartAt)/1000);
  }
  currentTest.index = Math.max(0, currentTest.index-1);
  renderQuestion();
});

nextQbtn.addEventListener('click', ()=>{
  if(currentTest.questions[currentTest.index].input){
    const el = questionBox.querySelector('input[name="answer"]');
    if(el) currentTest.answers[currentTest.index] = el.value.trim();
    // record time
    currentTest.questionTimes[currentTest.index] = currentTest.questionTimes[currentTest.index] || ((Date.now() - currentTest.questionStartAt)/1000);
  }
  currentTest.index = Math.min(currentTest.questions.length-1, currentTest.index+1);
  renderQuestion();
});

// submit test
submitTestBtn.addEventListener('click', submitTest);

async function submitTest(){
  if(!currentTest) return;
  // stop timer
  clearInterval(currentTest.timerInterval);
  // ensure last question saved
  if(currentTest.questions[currentTest.index].input){
    const el = questionBox.querySelector('input[name="answer"]');
    if(el) currentTest.answers[currentTest.index] = el.value.trim();
    currentTest.questionTimes[currentTest.index] = currentTest.questionTimes[currentTest.index] || ((Date.now() - currentTest.questionStartAt)/1000);
  }

  // grade
  const qlen = currentTest.questions.length;
  let score = 0;
  for(let i=0;i<qlen;i++){
    const q = currentTest.questions[i];
    const ans = (currentTest.answers[i] || '').toString().trim().toLowerCase();
    const correct = (q.a || '').toString().trim().toLowerCase();
    if(ans && ans === correct) score++;
  }
  const timeTaken = (Date.now() - currentTest.startedAt) / 1000; // seconds

  // store to supabase results
  try{
    const payload = {
      user_id: currentUser.id,
      subject: currentTest.subject,
      level: currentTest.level,
      score: score,
      time_taken_seconds: timeTaken,
      per_question_times: currentTest.questionTimes
    };
    await sb.from('results').insert([payload]);
  }catch(e){
    console.error('store error', e);
  }

  // show result panel
  hideAllPanels();
  resultPanel.classList.remove('hidden');
  const resultText = document.getElementById('resultText');
  resultText.innerText = `You scored ${score} out of ${qlen} — Time: ${Math.round(timeTaken)} seconds (avg ${(timeTaken/qlen).toFixed(1)}s / question).`;

  const details = document.getElementById('resultDetails');
  details.innerHTML = '<h4>Question detail</h4>';
  const ul = document.createElement('ol');
  for(let i=0;i<qlen;i++){
    const li = document.createElement('li');
    const q = currentTest.questions[i];
    const given = currentTest.answers[i] || '(no answer)';
    const ok = ((given.toString().trim().toLowerCase()) === (q.a || '').toString().trim().toLowerCase());
    li.innerHTML = `<div><strong>${q.q}</strong><div>Your answer: ${given} — ${ok ? '<span style="color:green">✔</span>' : '<span style="color:red">✖</span>'} (correct: ${q.a})</div><small>Time on Q: ${Math.round(currentTest.questionTimes[i]||0)}s</small></div>`;
    ul.appendChild(li);
  }
  details.appendChild(ul);

  // cleanup test state
  currentTest = null;

  // refresh dashboard data
  await loadDashboardData();
}

// on load: check if session exists
(async function init(){
  // check active session
  const s = await sb.auth.getSession();
  if(s?.data?.session?.user){
    currentUser = s.data.session.user;
    await afterLogin();
  } else {
    // show auth box
    authBox.classList.remove('hidden');
    profileBox.classList.add('hidden');
  }
})();

// utility to show/hide
function hideAllPanels(){
  dashboard.classList.add('hidden');
  testChooser.classList.add('hidden');
  testPanel.classList.add('hidden');
  resultPanel.classList.add('hidden');
  historyPanel.classList.add('hidden');
}

// initial visible: auth
hideAllPanels();
authBox.classList.remove('hidden');
loginForm.classList.remove('hidden');
tabLogin.classList.add('active');