let tumVeriler = [];
let aktifSayfa = 'anasayfa';

async function verileriYukle() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) throw new Error("JSON yüklenemedi");
        tumVeriler = await response.json();
        ekranaBas(tumVeriler);
    } catch (hata) {
        console.error("Veri hatası:", hata);
    }
}

const yildizOlustur = (puan) => {
    const doluYildiz = Math.round(puan / 2);
    return "⭐".repeat(doluYildiz) + "☆".repeat(5 - doluYildiz);
};

function ekranaBas(veriler) {
    const list = document.getElementById('movie-list');
    if (!list) return;
    list.innerHTML = '';

    if (veriler.length === 0) {
        list.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 50px; color: #777;">
                <p style="font-size: 3rem;">🔍</p>
                <p>Aradığınız kriterlere uygun film bulunamadı.</p>
            </div>`;
        return;
    }

    veriler.forEach(film => {
        const isFav = favoriKontrol(film.id);
        const kart = `
            <div class="card">
                <div class="card-image-container">
                    <img src="${film.gorsel}" alt="${film.ad}" class="card-img" onclick="detayGoster(${film.id})" onerror="this.src='https://via.placeholder.com/300x450?text=Resim+Yok'">
                </div>
                <div class="card-content">
                    <h3 onclick="detayGoster(${film.id})" style="cursor:pointer">${film.ad}</h3>
                    <div class="rating" style="color:#f5c518; margin-bottom:10px;">
                        ${yildizOlustur(film.puan)} ${film.puan}
                    </div>
                    <button class="fav-btn" onclick="favoriIslem(${film.id})">
                        ${isFav ? '❌ Favorilerden Çıkar' : '❤️ Favorilere Ekle'}
                    </button>
                </div>
            </div>`;
        list.innerHTML += kart;
    });
}

function detayGoster(id) {
    const film = tumVeriler.find(f => f.id === id);
    const modal = document.getElementById('movieModal');
    const body = document.getElementById('modal-body');
    
    body.innerHTML = `
        <div class="modal-flex">
            <img src="${film.gorsel}" class="modal-img">
            <div class="modal-text">
                <h2>${film.ad} (${film.yil})</h2>
                <hr style="margin:10px 0; opacity:0.2">
                <p><strong>Yönetmen:</strong> ${film.yonetmen}</p>
                <p><strong>Oyuncular:</strong> ${film.oyuncular}</p>
                <p><strong>Tür:</strong> ${film.tur}</p>
                <p><strong>Özet:</strong> ${film.ozet}</p>
                <div class="rating" style="font-size:1.2rem; margin-top:10px;">${yildizOlustur(film.puan)} ${film.puan}</div>
            </div>
        </div>
    `;
    modal.style.display = "block";
}

const modalKapat = () => { document.getElementById('movieModal').style.display = "none"; };

window.onclick = function(event) {
    const modal = document.getElementById('movieModal');
    if (event.target == modal) modal.style.display = "none";
}

function mesajGoster(mesaj) {
    const toast = document.getElementById('toast');
    toast.innerText = mesaj;
    toast.className = "toast show";
    setTimeout(() => { toast.className = "toast"; }, 3000);
}

function favoriIslem(id) {
    let favlar = JSON.parse(localStorage.getItem('sau_final_odev')) || [];
    const film = tumVeriler.find(f => f.id === id);

    if(favlar.includes(id)) {
        favlar = favlar.filter(fId => fId !== id);
        mesajGoster(`${film.ad} favorilerden çıkarıldı.`);
    } else {
        favlar.push(id);
        mesajGoster(`${film.ad} favorilere eklendi.`);
    }
    
    localStorage.setItem('sau_final_odev', JSON.stringify(favlar));
    filtreleVeSirala();
}

function sayfaDegistir(sayfa) {
    aktifSayfa = sayfa;
    document.getElementById('pageTitle').innerText = sayfa === 'anasayfa' ? 'Tüm Filmler' : 'Favorilerim';
    filtreleVeSirala();
}

function filtreleVeSirala() {
    const aranan = document.getElementById('searchInput').value.toLowerCase();
    const kategori = document.getElementById('categoryFilter').value;
    const sira = document.getElementById('sortOrder').value;

    let veriler = aktifSayfa === 'anasayfa' ? tumVeriler : tumVeriler.filter(f => favoriKontrol(f.id));

    let sonuclar = veriler.filter(f => 
        f.ad.toLowerCase().includes(aranan) && 
        (kategori === "Hepsi" || f.tur === kategori)
    );

    if (sira === "puan-yuksek") {
        sonuclar.sort((a, b) => b.puan - a.puan);
    } else if (sira === "yil-yeni") {
        sonuclar.sort((a, b) => b.yil - a.yil);
    }

    ekranaBas(sonuclar);
}

const favoriKontrol = (id) => (JSON.parse(localStorage.getItem('sau_final_odev')) || []).includes(id);

document.getElementById('searchInput').addEventListener('input', filtreleVeSirala);
document.getElementById('categoryFilter').addEventListener('change', filtreleVeSirala);
document.getElementById('sortOrder').addEventListener('change', filtreleVeSirala);

verileriYukle();