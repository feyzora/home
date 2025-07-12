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
const swiperWrapper = document.querySelector('.swiper-wrapper');
let mySwiper;

function displayResults(results) {
    swiperWrapper.innerHTML = '';

    if (results.length === 0) {
        document.getElementById('no-results-container').style.display = 'block';
        con.style.display = 'none';
        if (mySwiper) {
            mySwiper.destroy(true, true);
        }
        return;
    } else {
        document.getElementById('no-results-container').style.display = 'none';
        con.style.display = 'block';
    }

    results.forEach(item => {
        const slide = document.createElement('div');
        slide.classList.add('swiper-slide');
        slide.classList.add('con-amulet');

        slide.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="amulet-img">
            <h1>${item.name}</h1>
            <h3>พ.ศ. ${item.year}</h3>
            <p>${item.description}</p>
            <p>฿ ${item.price}</p>
        `;
        swiperWrapper.appendChild(slide);
    });

    if (mySwiper) {
        mySwiper.update();
    } else {
        initializeSwiper();
    }
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

document.addEventListener('DOMContentLoaded', async () => {
    await performSearch();
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
    const enteredPassword = adminPassword.value;

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


window.addEventListener('load', function() {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        setTimeout(function() {
            preloader.style.display = 'none'; 
        }, 1250); 
    }
});

function initializeSwiper() {
    if (mySwiper) {
        mySwiper.destroy(true, true);
    }
    mySwiper = new Swiper('#con', {
        direction: 'horizontal',
        loop: false,
        slidesPerView: 'auto',
        spaceBetween: 25,
        centeredSlides: false,

        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },

        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        breakpoints: {
            0: {
                slidesPerView: 1,
                spaceBetween: 10,
            },
            640: {
                slidesPerView: 2,
                spaceBetween: 20,
            },
            1024: {
                slidesPerView: 3,
                spaceBetween: 25,
            },
        }
    });
}

function toggleMenu() {
    const navMenu = document.getElementById('navMenu');
    navMenu.classList.toggle('active');
}