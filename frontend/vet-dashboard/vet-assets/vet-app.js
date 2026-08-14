
const vetAppointments=[
 {time:"09:00 AM",pet:"Bruno",owner:"Gayatri",type:"General Checkup",icon:"🐕",status:"Confirmed",cls:"vet-green"},
 {time:"10:30 AM",pet:"Milo",owner:"Aarav",type:"Vaccination",icon:"🐈",status:"Confirmed",cls:"vet-green"},
 {time:"12:00 PM",pet:"Coco",owner:"Neha",type:"Skin Consultation",icon:"🦜",status:"Waiting",cls:"vet-orange"},
 {time:"03:30 PM",pet:"Bella",owner:"Riya",type:"Dental Checkup",icon:"🐶",status:"Confirmed",cls:"vet-green"}
];
const vetPatients=[
 {name:"Bruno",species:"Dog",breed:"Labrador Retriever",age:"2 years",owner:"Gayatri",icon:"🐕"},
 {name:"Kitty",species:"Cat",breed:"Persian Cat",age:"3 years",owner:"Aarav",icon:"🐈"},
 {name:"Coco",species:"Parrot",breed:"Eclectus Parrot",age:"4 years",owner:"Neha",icon:"🦜"},
 {name:"Bella",species:"Dog",breed:"Golden Retriever",age:"5 years",owner:"Riya",icon:"🐶"},
 {name:"Milo",species:"Cat",breed:"British Shorthair",age:"1 year",owner:"Aarav",icon:"🐱"},
 {name:"Rocky",species:"Dog",breed:"Beagle",age:"2 years",owner:"Kabir",icon:"🐶"}
];
function vetRenderShell(active){
 const nav=[
  ["vetdashboard.html","🏠","Dashboard"],
  ["vet-appointments.html","📅","Appointments"],
  ["vet-patients.html","🐾","Patients"],
  ["vet-records.html","🩺","Medical Records"],
  ["vet-prescriptions.html","💊","Prescriptions"],
  ["vet-profile.html","👨‍⚕️","My Profile"]
 ];
 document.getElementById("vet-sidebar").innerHTML=
 `<div class="vet-brand" style="margin:0 10px 28px"><div class="vet-brand-icon">🩺</div><span>VetCare</span></div>
 <div class="vet-section-label">WORKSPACE</div>`+
 nav.map(n=>`<a class="vet-nav-item ${active===n[2]?"active":""}" href="${n[0]}"><span class="vet-nav-icon">${n[1]}</span><span>${n[2]}</span></a>`).join("")+
 `<div class="vet-section-label">OTHER</div><a class="vet-nav-item" href="vet-settings.html"><span class="vet-nav-icon">⚙️</span><span>Settings</span></a>`;
 document.getElementById("vet-topbar").innerHTML=
 `<div class="vet-brand"><div class="vet-brand-icon">🐾</div><span>VetCare Dashboard</span></div>
 <div class="vet-top-actions"><div class="vet-search"><span>⌕</span><input placeholder="Search patients..."></div>
 <button class="vet-notification">🔔<span class="vet-badge">3</span></button>
 <div class="vet-doctor"><div class="vet-avatar">DS</div><span>Dr. Sharma</span></div></div>`;
}
function vetAppointmentRows(items=vetAppointments){
 return items.map(a=>`<div class="vet-appointment"><div class="vet-time">${a.time}</div><div class="vet-patient-avatar">${a.icon}</div><div class="vet-patient-info"><strong>${a.pet}</strong><small>${a.owner} · ${a.type}</small></div><span class="vet-status ${a.cls}">${a.status}</span></div>`).join("");
}
function vetPatientCards(items=vetPatients){
 return items.map(p=>`<div class="vet-card vet-patient-card"><div class="vet-pet-photo">${p.icon}</div><div><h3>${p.name}</h3><p>${p.breed}</p><p>${p.age} · ${p.species}</p><p>Owner: ${p.owner}</p></div></div>`).join("");
}
document.addEventListener("DOMContentLoaded",()=>{
 const page=document.body.dataset.vetpage;
 const names={dashboard:"Dashboard",appointments:"Appointments",patients:"Patients",records:"Medical Records",prescriptions:"Prescriptions",profile:"My Profile",settings:"Settings"};
 vetRenderShell(names[page]||"Dashboard");
});
