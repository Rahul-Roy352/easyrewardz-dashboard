  const HOME_CATS = ['Roster','Credentials','Training'];
  const COUNTRY_CATS = ['Trackers','Validation'];
  const COUNTRIES = ['IN','BD','PK','MY','ID','TH','SG'];
const COUNTRY_NAMES = {
  IN:'<img class="title-flag" src="https://flagcdn.com/in.svg"> India',
  BD:'<img class="title-flag" src="https://flagcdn.com/bd.svg"> Bangladesh',
  PK:'<img class="title-flag" src="https://flagcdn.com/pk.svg"> Pakistan',
  MY:'<img class="title-flag" src="https://flagcdn.com/my.svg"> Malaysia',
  ID:'<img class="title-flag" src="https://flagcdn.com/id.svg"> Indonesia',
  TH:'<img class="title-flag" src="https://flagcdn.com/th.svg"> Thailand',
  SG:'<img class="title-flag" src="https://flagcdn.com/sg.svg"> Singapore'
};
  const STORE_KEY = 'dashboard_data_v1';
  const RECENTS_KEY = 'dashboard_recents_v1';
  let recents = JSON.parse(localStorage.getItem(RECENTS_KEY) || '[]');
  function saveRecents(){ localStorage.setItem(RECENTS_KEY, JSON.stringify(recents)); }
  function addRecent(link, view, cat){
    recents = recents.filter(r => !(r.url===link.url && r.view===view));
    recents.unshift({ name:link.name, url:link.url, view, cat, t:Date.now() });
    recents = recents.slice(0, 8);
    saveRecents();
  }
  let data = null;
  if(!data){
    data = { home: {}, countries: {} };
    HOME_CATS.forEach(c => data.home[c] = []);
    COUNTRIES.forEach(co => {
      data.countries[co] = {};
      COUNTRY_CATS.forEach(c => data.countries[co][c] = []);
    });
  }
  function save(){}

  let currentView = 'home';
  let editingRef = null;

  function getCats(view){ return view==='home' ? HOME_CATS : COUNTRY_CATS; }
  function getBucket(view){ return view==='home' ? data.home : data.countries[view]; }

  function refreshCategoryDropdown(){

  const sel = document.getElementById('linkCategory');

  if(!sel) return;

  sel.innerHTML='';

  getCats(currentView).forEach(c=>{

    const o=document.createElement('option');

    o.value = c;
    o.textContent = c;

    sel.appendChild(o);

  });

}

  function uid(){ return Date.now().toString(36)+Math.random().toString(36).slice(2,7); }

  function render(){
    document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active', b.dataset.view===currentView));
document.getElementById('viewTitle').innerHTML =
  currentView==='home'
    ? '🏠 Home'
    : COUNTRY_NAMES[currentView];    refreshCategoryDropdown();
    const bucket = getBucket(currentView);
    const cats = getCats(currentView);
    const search = document.getElementById('search').value.trim().toLowerCase();
    const content = document.getElementById('content');
    content.innerHTML='';

    // Recents section
    if(recents.length){
      const recSection = document.createElement('div');
      recSection.className='category';
      recSection.innerHTML = `<div class="cat-header">🕘 Recents <span class="count">${recents.length}</span></div>`;
      const recCards = document.createElement('div'); recCards.className='cards';
      recents.forEach(r=>{
        const d = document.createElement('div'); d.className='card';
        const loc = r.view === 'home'
  ? 'Home'
  : r.view;
//         d.innerHTML = `
//   <button class="recent-del">✕</button>

//   <a class="link" href="${escapeAttr(r.url)}" target="_blank" rel="noopener">
//     ${escapeHtml(r.name)}
//   </a>

//   <div style="font-size:11px;opacity:0.7;margin-top:4px;">
//     ${loc} · ${escapeHtml(r.cat||'')}
//   </div>
// `;
d.innerHTML = `
  <button class="recent-del">✕</button>

  <a
    class="full-card-link recent-link"
    href="${escapeAttr(r.url)}"
    target="_blank"
    rel="noopener"
  >
    ${escapeHtml(r.name)}
  </a>

<div
  style="
    position:absolute;
    bottom:14px;
    line-height:1.4;
    left:50%;
    transform:translateX(-50%);
    font-size:12px;
    opacity:0.75;
    text-align:center;
    width:100%;
  "
>

    ${loc} · ${escapeHtml(r.cat||'')}
  </div>
`;
        d.querySelector('.recent-del').onclick = (e)=>{
  e.stopPropagation();

  recents = recents.filter(item =>
    !(item.url === r.url && item.view === r.view)
  );

  saveRecents();
  render();
};
        recCards.appendChild(d);
      });
      recSection.appendChild(recCards);
      content.appendChild(recSection);
    }

    // // Pinned section (only for country views per spec, but useful for home too)
    // const allLinks = [];
    // cats.forEach(c => bucket[c].forEach(l => allLinks.push({...l, _cat:c})));
    // const pinned = allLinks.filter(l => l.pinned && matches(l, search));
    // if(currentView !== 'home'){
    //   const pinSection = document.createElement('div');
    //   pinSection.className='category';
    //   pinSection.innerHTML = `<div class="cat-header">📌 Pinned <span class="count">${pinned.length}</span></div>`;
    //   const pinCards = document.createElement('div'); pinCards.className='cards';
    //   if(pinned.length===0) pinCards.innerHTML='<div class="empty">No pinned links yet.</div>';
    //   else pinned.forEach(l => pinCards.appendChild(makeCard(l, l._cat)));
    //   pinSection.appendChild(pinCards);
    //   content.appendChild(pinSection);
    // }

    cats.forEach(cat=>{
      const items = bucket[cat].filter(l => matches(l, search))
        // .sort((a,b)=> (b.pinned?1:0)-(a.pinned?1:0));
      const section = document.createElement('div'); section.className='category';
      section.innerHTML = `<div class="cat-header">${catIcon(cat)} ${cat} <span class="count">${items.length}</span></div>`;
      const cards = document.createElement('div'); cards.className='cards';
      if(items.length===0) cards.innerHTML='<div class="empty">No links yet.</div>';
      else items.forEach(l => cards.appendChild(makeCard(l, cat)));
      section.appendChild(cards);
      content.appendChild(section);
    });
  }

  function matches(l, q){ if(!q) return true; return (l.name||'').toLowerCase().includes(q) || (l.url||'').toLowerCase().includes(q); }
  function catIcon(c){ return ({Roster:'👥',Credentials:'🔐',Training:'🎓',Trackers:'📊',Validation:'✅'})[c]||'📁'; }

  function makeCard(link, cat){

  const div = document.createElement('div');

  div.className = 'card' + (link.pinned ? ' pinned' : '');

    div.innerHTML = `
    <a
      class="full-card-link"
      href="${escapeAttr(link.url)}"
      target="_blank"
      rel="noopener"
    >
      ${escapeHtml(link.name)}
    </a>
  `;

  div.querySelector('.full-card-link')
    .addEventListener('click', ()=>{

      addRecent(link, currentView, cat);

    });

  return div;
}

  function escapeHtml(s){ return (s||'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function escapeAttr(s){ return escapeHtml(s); }

  function findInBucket(cat, id){ return getBucket(currentView)[cat].find(l=>l.id===id); }

  function togglePin(cat, id){ const l=findInBucket(cat,id); if(l){ l.pinned=!l.pinned; save(); render(); } }
  function deleteLink(cat, id){ const arr=getBucket(currentView)[cat]; const i=arr.findIndex(l=>l.id===id); if(i>=0){ arr.splice(i,1); save(); render(); } }

  function openEdit(cat, id){
    const l = findInBucket(cat, id); if(!l) return;
    editingRef = { cat, id };
    document.getElementById('editName').value = l.name;
    document.getElementById('editUrl').value = l.url;
    const sel = document.getElementById('editCategory'); sel.innerHTML='';
    getCats(currentView).forEach(c=>{
      const o=document.createElement('option'); o.value=c; o.textContent=c; if(c===cat) o.selected=true; sel.appendChild(o);
    });
    document.getElementById('modal').classList.add('show');
  }

  document.getElementById('cancelEdit').onclick = ()=> document.getElementById('modal').classList.remove('show');
  document.getElementById('saveEdit').onclick = ()=>{
    if(!editingRef) return;
    const name = document.getElementById('editName').value.trim();
    let url = document.getElementById('editUrl').value.trim();
    const newCat = document.getElementById('editCategory').value;
    if(!name || !url) return alert('Name and URL required');
    if(!/^https?:\/\//i.test(url)) url = 'https://'+url;
    const bucket = getBucket(currentView);
    const arr = bucket[editingRef.cat];
    const i = arr.findIndex(l=>l.id===editingRef.id);
    if(i<0) return;
    const link = arr[i];
    link.name = name; link.url = url;
    if(newCat !== editingRef.cat){ arr.splice(i,1); bucket[newCat].push(link); }
    save(); editingRef=null;
    document.getElementById('modal').classList.remove('show');
    render();
  };

  // document.getElementById('addBtn').onclick = ()=>{
  //   const name = document.getElementById('linkName').value.trim();
  //   let url = document.getElementById('linkUrl').value.trim();
  //   const cat = document.getElementById('linkCategory').value;
  //   if(!name || !url) return alert('Please enter both name and URL');
  //   if(!/^https?:\/\//i.test(url)) url = 'https://'+url;
  //   getBucket(currentView)[cat].push({ id: uid(), name, url, pinned:false });
  //   document.getElementById('linkName').value='';
  //   document.getElementById('linkUrl').value='';
  //   save(); render();
  // };

  document.getElementById('search').oninput = render;

//   document.querySelectorAll('.nav-btn').forEach(b=>{
//     b.onclick = ()=>{ currentView = b.dataset.view; document.getElementById('search').value=''; render(); };
//   });
const sidebar = document.querySelector('.sidebar');

document.querySelectorAll('.nav-btn').forEach(b=>{

  b.onclick = ()=>{

    currentView = b.dataset.view;

    document.getElementById('search').value='';

    sidebar.classList.remove('show');

    render();

  };

});
/* =========================
   MANUAL STATIC LINKS
========================= */

const STATIC_LINKS = {

  home: {

    Roster: [

      {
        id: 's1',
        name: 'Roster',
        url: 'https://shorturl.at/WpCv2',
        pinned: false
      }

    ],

    Credentials: [

      {
        id: 's2',
        name: 'Credentials Sheet',
        url: 'https://shorturl.at/qStgu',
        pinned: false
      }

    ],

    Training: [

      {
        id: 's3',
        name: 'Training Videos',
        url: 'https://shorturl.at/4s4hG',
        pinned: false
      },
	  {
        id: 'BRD',
        name: 'BRD',
        url: 'https://shorturl.at/HM985',
        pinned: false
      }
    ]

  },

  countries: {

    IN: {

      Trackers: [

        {
          id: 's4',
          name: 'Coupon Issuance Tracker (BATA INDIA & HP)',
          url: 'https://shorturl.at/mUBA4',
          pinned: false
        },

        {
          id: 's5',
          name: 'Coupon Setup Tracker(Bata India & HP)',
          url: 'https://tinyurl.com/3eykw23t',
          pinned: false
        },

        {
          id: 's6',
          name: 'New Store Tracker(Bata India & HP)',
          url: 'https://tinyurl.com/fdmmydpx',
          pinned: false
        },
		{
          id: 'b1',
          name: 'POS Promo Tracker (Bata India & HP)',
          url: 'https://tinyurl.com/49t5ahz6',
          pinned: false
        }

      ],

      Validation: [

        {
          id: 's7',
          name: 'GV Issuance Check (Bata India & HP)',
          url: 'https://tinyurl.com/37kph8kp',
          pinned: false
        },
		{
          id: 'c1',
          name: 'Contact Details Check (Bata India)',
          url: 'https://tinyurl.com/v695t7kz',
          pinned: false
        }

      ]

    },

    BD: {
      Trackers: [
        {
          id: 's8',
          name: 'Unfraud Tracker',
          url: 'https://tinyurl.com/hmd5x37y',
          pinned: false
        },
		 {
          id: 't10',
          name: 'Coupon Setup Tracker(BATA SEA)',
          url: 'https://tinyurl.com/4wcw7mf8',
          pinned: false
        }
      ],
      Validation: [
          {
            id: 's9',
            name: 'NID Bangladesh',
            url: 'https://nidw.gov.bd',
            pinned: false
          }
      ]
    },

    PK: {
      Trackers: [
         {
          id: 's10',
          name: 'Unfraud Tracker',
          url: 'https://tinyurl.com/hmd5x37y',
          pinned: false
        },
		 {
          id: 't11',
          name: 'Coupon Setup Tracker(BATA SEA)',
          url: 'https://tinyurl.com/4wcw7mf8',
          pinned: false
        }
      ],
      Validation: [
        
         {
          id: 's11',
          name: 'NADRA',
          url: 'https://nadra.gov.pk',
          pinned: false
        }
      ]
    },

    MY: {
      Trackers: [
          {
            id: 's12',
            name: 'Unfraud Tracker',
            url: 'https://tinyurl.com/hmd5x37y',
            pinned: false
          },
		   {
          id: 't12',
          name: 'Coupon Setup Tracker(BATA SEA)',
          url: 'https://tinyurl.com/4wcw7mf8',
          pinned: false
        }
      ],
      Validation: [
          {
            id: 's13',
            name: 'MyKad',
            url: 'https://google.com',
            pinned: false
          }
      ]
    },

    ID: {
      Trackers: [
          {
            id: 's14',
            name: 'Unfraud Tracker',
            url: 'https://tinyurl.com/hmd5x37y',
            pinned: false
          },
		   {
          id: 't13',
          name: 'Coupon Setup Tracker(BATA SEA)',
          url: 'https://tinyurl.com/4wcw7mf8',
          pinned: false
        }
      ],
      Validation: [
          {
            id: 's15',
            name: 'e-KTP Indonesia',
            url: 'https://ektp.go.id',
            pinned: false
          }
      ]
    },

    TH: {
      Trackers: [
          {
            id: 's16',
            name: 'Unfraud Tracker',
            url: 'https://tinyurl.com/hmd5x37y',
            pinned: false
          },
		   {
          id: 't14',
          name: 'Coupon Setup Tracker(BATA SEA)',
          url: 'https://tinyurl.com/4wcw7mf8',
          pinned: false
        }
      ],
      Validation: [
          {
            id: 's17',
            name: 'Thamd',
            url: 'https://thaiid.go.th',
            pinned: false
          }
      ]
    },

    SG: {
      Trackers: [
          {
            id: 's18',
            name: 'Unfraud Tracker',
            url: 'https://tinyurl.com/hmd5x37y',
            pinned: false
          },
		   {
          id: 't15',
          name: 'Coupon Setup Tracker(BATA SEA)',
          url: 'https://tinyurl.com/4wcw7mf8',
          pinned: false
        },
		   {
          id: 't16',
          name: 'Staff Coupon Setup Trackers (Singapore)',
          url: 'https://tinyurl.com/3ervtcjv',
          pinned: false
        }
      ],
      Validation: [
          {
            id: 's19',
            name: 'Singapore NRIC',
            url: 'https://nric.gov.sg',
            pinned: false
          }
      ]
    }

  }

};


/* =========================
   MERGE STATIC LINKS
========================= */

function mergeStaticLinks() {

  // HOME LINKS
  Object.keys(STATIC_LINKS.home).forEach(cat => {

    STATIC_LINKS.home[cat].forEach(link => {

      const exists = data.home[cat]
        .some(l => l.id === link.id);

      if (!exists) {
        data.home[cat].push(link);
      }

    });

  });


  // COUNTRY LINKS
  Object.keys(STATIC_LINKS.countries).forEach(country => {

    Object.keys(STATIC_LINKS.countries[country]).forEach(cat => {

      STATIC_LINKS.countries[country][cat].forEach(link => {

        const exists =
          data.countries[country][cat]
          .some(l => l.id === link.id);

        if (!exists) {
          data.countries[country][cat].push(link);
        }

      });

    });

  });

}


/* =========================
   PREVENT DELETE OF STATIC LINKS
========================= */

deleteLink = function(cat, id){

  // Static links cannot be deleted
  if(id.startsWith('s')){
    return alert('Permanent link cannot be deleted');
  }

  const arr = getBucket(currentView)[cat];
  const i = arr.findIndex(l => l.id === id);

  if(i >= 0){
    arr.splice(i, 1);
    save();
    render();
  }

};

/* =========================
   LOAD STATIC LINKS
========================= */

// mergeStaticLinks();
//   render();
mergeStaticLinks();

const menuToggle = document.getElementById('menuToggle');

menuToggle.onclick = ()=>{

  sidebar.classList.toggle('show');

};

render();

/* =========================
   PASSWORD PROTECTION
========================= */

const WEBSITE_PASSWORD = "Easy@2026"; // Change this to your desired password

const loginScreen =
  document.getElementById("vanta-bg");

const loginBtn =
  document.getElementById("loginBtn");

const passwordInput =
  document.getElementById("passwordInput");

const loginStatus =
  document.getElementById("loginStatus");

const loginBox =
  document.getElementById("loginBox");

  document.querySelector(".app")
  .classList.add("hidden");

/* AUTO LOGIN */

if(localStorage.getItem("dashboard_auth")==="true"){

  document.querySelector(".app")
    .classList.remove("hidden");

  loginScreen.style.display = "none";

}


/* LOGIN BUTTON */

loginBtn.onclick = ()=>{

  loginStatus.style.display = "block";

  loginStatus.className = "";

  loginStatus.innerHTML = `
  > Initializing secure connection...<br>
  > Verifying credentials...<br>
  > Accessing protected gateway...<br>
  `;

  setTimeout(()=>{

    /* =========================
       CORRECT PASSWORD
    ========================= */

    if(passwordInput.value === WEBSITE_PASSWORD){

      loginStatus.classList.add(
        "status-granted"
      );

      loginStatus.innerHTML += `
      > Security clearance verified<br>
      > ✅ ACCESS GRANTED<br>
      > Loading dashboard...
      `;

      localStorage.setItem(
        "dashboard_auth",
        "true"
      );

      loginBox.classList.remove(
        "animate__shakeX"
      );

      loginBox.classList.add(
        "animate__animated",
        "animate__pulse"
      );

      setTimeout(()=>{

        loginBox.classList.remove(
          "animate__animated",
          "animate__pulse"
        );

      },900);


      setTimeout(()=>{

  document.querySelector(".app")
    .classList.remove("hidden");

  loginScreen.style.display = "none";

},1200);

    }


    /* =========================
       WRONG PASSWORD
    ========================= */

    else{

      loginBox.classList.remove(
        "animate__animated",
        "animate__shakeX"
      );

      void loginBox.offsetWidth;

      loginBox.classList.add(
        "animate__animated",
        "animate__shakeX"
      );

      setTimeout(()=>{

        loginBox.classList.remove(
          "animate__animated",
          "animate__shakeX"
        );

      },700);

      loginStatus.classList.add(
        "status-denied"
      );

      loginStatus.innerHTML += `
      > Intrusion attempt detected<br>
      > ❌ ACCESS DENIED<br>
      > Unauthorized credentials
      `;

    }

  },1200);

};


/* ENTER KEY SUPPORT */

passwordInput.addEventListener(
  "keypress",
  (e)=>{

    if(e.key==="Enter"){

      loginBtn.click();

    }

  }
);

// window.addEventListener("load", ()=>{

//   particlesJS("particles-js", {

//     particles: {

//       number: {
//         value: 70
//       },

//       color: {
//         value: "#ffffff"
//       },

//       shape: {
//         type: "circle"
//       },

//       opacity: {
//         value: 0.35
//       },

//       size: {
//         value: 3
//       },

//       line_linked: {

//         enable: true,

//         distance: 150,

//         color: "#ffffff",

//         opacity: 0.25,

//         width: 1

//       },

//       move: {

//         enable: true,

//         speed: 2

//       }

//     },

//     interactivity: {

//       events: {

//         onhover: {

//           enable: true,

//           mode: "grab"

//         }

//       }

//     },

//     retina_detect: true

//   });

// });

// VANTA.BIRDS({

//   el: "#vanta-bg",

//   mouseControls: true,

//   touchControls: true,

//   gyroControls: false,

//   minHeight: 200.00,

//   minWidth: 200.00,

//   scale: 1.00,

//   scaleMobile: 1.00,

//   backgroundColor: 0x5f72ff,

//   color1: 0xffffff,

//   color2: 0xd65db1,

//   quantity: 4,

//   birdSize: 1.2,

//   wingSpan: 28,

//   speedLimit: 4,

//   separation: 40,

//   alignment: 30,

//   cohesion: 35

// });
VANTA.BIRDS({

  el: "#vanta-bg",

  mouseControls: true,
  touchControls: true,
  gyroControls: false,

  minHeight: 200.00,
  minWidth: 200.00,

  scale: 1.00,
  scaleMobile: 1.00,

  backgroundColor: 0x07192f,

  backgroundAlpha: 1,

  color1: 0xff6bd6,

  color2: 0xffc371,

  colorMode: "varianceGradient",

  quantity: 5,

  birdSize: 1,

  wingSpan: 30,

  speedLimit: 5,

  separation: 20,

  alignment: 20,

  cohesion: 20

});