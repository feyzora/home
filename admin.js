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

const ADMIN_EMAIL = "miyamasuth@gmail.com";

const CLOUDINARY_CLOUD_NAME = 'dh8vkktbi'; 
const CLOUDINARY_UPLOAD_PRESET = 'Pulpit style'; 

let currentUploadedImageUrl = ''; 

function logoutAdmin() {
    auth.signOut().then(() => {
        Swal.fire({
            icon: "success",
            title: "ออกจากระบบแล้ว",
            text: "กำลังกลับสู่หน้าหลัก",
            showConfirmButton: false,
            timer: 1500
        }).then(() => {
            window.location.href = "index.html";
        });
    }).catch((error) => {
        Swal.fire({
            icon: "error",
            title: "เกิดข้อผิดพลาด",
            text: "เกิดข้อผิดพลาดในการออกจากระบบ",
        });
    });
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
            <h3>พ.ศ. ${item.year}</h3>
            <p>${item.description}</p> 
            <p>฿ ${item.price}</p>
            <i class="fa-solid fa-pen"></i>
            <i class="fa-solid fa-trash delete-btn" data-id="${item.id}"></i>
        `;
        con.appendChild(resultItem);
    });

    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const amuletId = event.target.dataset.id;
            deleteAmulet(amuletId);
        });
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

async function deleteAmulet(amuletId) {
    Swal.fire({
        title: "คุณแน่ใจหรือไม่?",
        text: "คุณต้องการลบโพสต์นี้หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#f00",
        cancelButtonColor: "#198900",
        confirmButtonText: "ใช่",
        cancelButtonText: "ยกเลิก"
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                await db.collection('amulets').doc(amuletId).delete();
                Swal.fire(
                    "ลบสำเร็จ!",
                    "โพสต์ถูกลบเรียบร้อยแล้ว",
                    "success"
                );
                performSearch(); 
            } catch (error) {
                Swal.fire({
                    icon: "error",
                    title: "เกิดข้อผิดพลาด",
                    text: "ไม่สามารถลบโพสต์ได้: " + error.message,
                });
            }
        }
    });
}

async function uploadAmuletImage() {
    const fileInput = document.getElementById('amuletImageUpload');
    const file = fileInput.files[0];

    if (!file) {
        Swal.fire({
            icon: "warning",
            title: "ไม่มีไฟล์",
            text: "กรุณาเลือกรูปภาพที่ต้องการอัปโหลด"
        });
        return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
        Swal.fire({
            title: "กำลังอัปโหลด...",
            text: "กรุณารอสักครู่",
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            const imageUrl = data.secure_url;
            currentUploadedImageUrl = imageUrl; 
            document.getElementById('uploadedAmuletImagePreview').src = imageUrl;
            document.getElementById('uploadedAmuletImagePreview').style.display = 'block';
            document.getElementById('uploadedAmuletImageUrlDisplay').textContent = 'URL รูปภาพ: ' + imageUrl;

            Swal.fire({
                icon: "success",
                title: "อัปโหลดสำเร็จ!",
                text: "รูปภาพถูกอัปโหลดเรียบร้อยแล้ว"
            });

            fileInput.value = ''; 

        } else {
            Swal.fire({
                icon: "error",
                title: "อัปโหลดล้มเหลว",
                text: data.error.message || "เกิดข้อผิดพลาดในการอัปโหลด"
            });
        }
    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "เกิดข้อผิดพลาด",
            text: "ไม่สามารถเชื่อมต่อเพื่ออัปโหลดได้: " + error.message
        });
    }
}

async function saveNewAmulet() {
    const name = document.getElementById('amuletName').value;
    const year = document.getElementById('amuletYear').value;
    const description = document.getElementById('amuletDescription').value;
    const price = document.getElementById('amuletPrice').value;

    if (!name || !year || !description || !price) {
        Swal.fire({
            icon: "warning",
            title: "ข้อมูลไม่ครบถ้วน",
            text: "กรุณากรอกข้อมูลพระเครื่องให้ครบทุกช่อง"
        });
        return;
    }

    if (!currentUploadedImageUrl) {
        Swal.fire({
            icon: "warning",
            title: "รูปภาพไม่พร้อม",
            text: "กรุณาอัปโหลดรูปภาพพระเครื่องก่อนบันทึก"
        });
        return;
    }

    try {
        await db.collection('amulets').add({
            name: name,
            year: year,
            description: description,
            price: price,
            image: currentUploadedImageUrl 
        });

        Swal.fire({
            icon: "success",
            title: "เพิ่มพระเครื่องสำเร็จ!",
            text: "ข้อมูลพระเครื่องถูกบันทึกพร้อมรูปภาพแล้ว"
        });

        document.getElementById('amuletName').value = '';
        document.getElementById('amuletYear').value = '';
        document.getElementById('amuletDescription').value = '';
        document.getElementById('amuletPrice').value = '';
        document.getElementById('amuletImageUpload').value = '';
        document.getElementById('uploadedAmuletImagePreview').src = '';
        document.getElementById('uploadedAmuletImagePreview').style.display = 'none';
        document.getElementById('uploadedAmuletImageUrlDisplay').textContent = '';
        currentUploadedImageUrl = ''; 

        performSearch(); 

    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "เกิดข้อผิดพลาด",
            text: "ไม่สามารถเพิ่มพระเครื่องได้: " + error.message
        });
    }
}


searchInput.addEventListener('input', performSearch);

auth.onAuthStateChanged(user => {
    const adminContainer = document.getElementById('container');
    const adminContent = document.getElementById('admin-content'); 

    if (user && user.email === ADMIN_EMAIL) {
        adminContainer.style.display = 'block'; 
        adminContent.style.display = 'block'; 
        performSearch(); 
    } else {
        if (adminContainer) adminContainer.style.display = 'none'; 
        if (adminContent) adminContent.style.display = 'none'; 

        Swal.fire({
            icon: "error",
            title: "ไม่ได้รับอนุญาต",
            text: "คุณไม่มีสิทธิ์เข้าถึงหน้านี้",
            showConfirmButton: false,
            timer: 2000
        }).then(() => {
            window.location.href = "index.html";
        });
    }
});

function openaddpost() {
    const postform = document.querySelector(".post-form");
    postform.classList.toggle('none');
}