const firebaseConfig = {
    apiKey: "AIzaSyBTXCib5A51iSmsZx6DYcVQwDs4GP3Hp8Q",
    authDomain: "pulpit-style.firebaseapp.com",
    projectId: "pulpit-style",
    storageBucket: "pulpit-style.firebasestorage.app",
    messagingSenderId: "439803530247",
    appId: "1:439803530247:web:1547136a7fa0e926beeea2",
    measurementId: "G-C5TTE9LPP1"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore(); 

function closepopup() {
    const popup = document.querySelector(".popup");
    const blur = document.getElementById("container");
    popup.classList.add('none');
    blur.classList.remove('blur');
}

function opensearchbar() {
    const searchbar = document.querySelector(".search-bar");
    searchbar.classList.toggle('none');
}

const searchInput = document.getElementById('searchInput');
const con = document.getElementById('con');

function displayResults(results) {
    con.innerHTML = '';

    if (results.length === 0) {
        con.innerHTML = '<h1 class="noresult">ไม่พบผลลัพธ์</h1>';
        return;
    }

    results.forEach(item => {
        const resultItem = document.createElement('div');
        resultItem.classList.add('con-amulet');
        
        resultItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="amulet-img">
            <h1>${item.name}</h1> 
            <h3>${item.year}</h3>
            <p>${item.description}</p> 
            <p>${item.price}</p>
        `;
        con.appendChild(resultItem);
    });
}


async function getAmuletsFromFirestore() {
    try {
        const amuletsCollection = await db.collection('amulets').get(); 
        const amulets = [];
        amuletsCollection.forEach(doc => {
            amulets.push({ id: doc.id, ...doc.data() }); 
        });
        return amulets;
    } catch (error) {
        console.error("Error fetching amulets:", error);
        Swal.fire({
            icon: "error",
            title: "เกิดข้อผิดพลาด",
            text: "ไม่สามารถดึงข้อมูลพระเครื่องได้",
        });
        return [];
    }
}

async function performSearch() {
    const query = searchInput.value.toLowerCase(); 
    const allAmulets = await getAmuletsFromFirestore();

    if (query.trim() === '') {
        displayResults(allAmulets); 
        return;
    }

    const filteredItems = allAmulets.filter(item => {
        return item.name.toLowerCase().includes(query) ||
               item.description.toLowerCase().includes(query);
    });

    displayResults(filteredItems);
}

searchInput.addEventListener('input', performSearch);

document.addEventListener('DOMContentLoaded', () => {
    performSearch();
});


function opencontrols() {
    const controls = document.querySelector(".controls");
    const container = document.getElementById("container");
    controls.classList.remove('none');
    container.classList.add('blur');
}

function closecontrols() {
    const controls = document.querySelector(".controls");
    const container = document.getElementById("container");
    controls.classList.add('none');
    container.classList.remove('blur');
}

const adminEmailInput = document.getElementById('adminEmail');
const adminPasswordInput = document.getElementById('adminPassword');
const adminLoginBtn = document.querySelector('.adminbtn');

const ADMIN_EMAIL_FOR_LOGIN = "miyamasuth@gmail.com"; 

adminLoginBtn.addEventListener('click', () => {
    const enteredEmail = adminEmailInput.value;
    const enteredPassword = adminPasswordInput.value;

    auth.signInWithEmailAndPassword(enteredEmail, enteredPassword)
        .then((userCredential) => {
            const user = userCredential.user;
            
            if (user.email === ADMIN_EMAIL_FOR_LOGIN) {
                Swal.fire({
                    icon: "success",
                    title: "เข้าสู่ระบบสำเร็จ!",
                    text: "กำลังนำทางไปยังหน้าผู้ดูแลระบบ",
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => {
                    window.location.href = "admin.html"; 
                });
            } else {
                auth.signOut(); 
                Swal.fire({
                    icon: "error",
                    title: "ไม่มีสิทธิ์เข้าถึง",
                    text: "บัญชีนี้ไม่มีสิทธิ์เข้าถึงหน้าผู้ดูแลระบบ",
                });
            }
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;

            let displayMessage = "เกิดข้อผิดพลาดในการเข้าสู่ระบบ";
            if (errorCode === 'auth/user-not-found' || errorCode === 'auth/wrong-password') {
                displayMessage = "อีเมลหรือรหัสผ่านไม่ถูกต้อง โปรดตรวจสอบอีกครั้ง";
            } else if (errorCode === 'auth/invalid-email') {
                displayMessage = "รูปแบบอีเมลไม่ถูกต้อง";
            } else {
                displayMessage = "เกิดข้อผิดพลาด: " + errorMessage;
            }

            Swal.fire({
                icon: "error",
                title: "เข้าสู่ระบบล้มเหลว",
                text: displayMessage,
            });
        });
});