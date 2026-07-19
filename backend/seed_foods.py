"""Veritabanına temel malzemeleri ekler - gram gram tartılan yemekler için."""
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models.food import Food

RAW_INGREDIENTS = [
    # Etler
    {"name": "Tavuk Göğsü", "calorie_100g": 165, "protein_100g": 31, "fat_100g": 3.6, "carb_100g": 0},
    {"name": "Tavuk But", "calorie_100g": 209, "protein_100g": 26, "fat_100g": 10.9, "carb_100g": 0},
    {"name": "Tavuk Kanat", "calorie_100g": 203, "protein_100g": 18, "fat_100g": 14, "carb_100g": 0},
    {"name": "Tavuk Ciğeri", "calorie_100g": 172, "protein_100g": 17, "fat_100g": 9, "carb_100g": 0},
    {"name": "Dana Bonfile", "calorie_100g": 158, "protein_100g": 26, "fat_100g": 6, "carb_100g": 0},
    {"name": "Dana Kuşbaşı", "calorie_100g": 250, "protein_100g": 21, "fat_100g": 17, "carb_100g": 0},
    {"name": "Dana Kıyma (Yağlı)", "calorie_100g": 254, "protein_100g": 17, "fat_100g": 20, "carb_100g": 0},
    {"name": "Dana Kıyma (Yağsız)", "calorie_100g": 137, "protein_100g": 21, "fat_100g": 6, "carb_100g": 0},
    {"name": "Kuzu Kuşbaşı", "calorie_100g": 282, "protein_100g": 25, "fat_100g": 19, "carb_100g": 0},
    {"name": "Kuzu Pirzola", "calorie_100g": 285, "protein_100g": 24, "fat_100g": 20, "carb_100g": 0},
    {"name": "Kuzu Kıyma", "calorie_100g": 280, "protein_100g": 22, "fat_100g": 20, "carb_100g": 0},
    {"name": "Antrikot", "calorie_100g": 220, "protein_100g": 24, "fat_100g": 13, "carb_100g": 0},
    {"name": "Sucuk", "calorie_100g": 455, "protein_100g": 18, "fat_100g": 40, "carb_100g": 4},
    {"name": "Pastırma", "calorie_100g": 380, "protein_100g": 35, "fat_100g": 26, "carb_100g": 2},
    {"name": "Sosis", "calorie_100g": 301, "protein_100g": 12, "fat_100g": 25, "carb_100g": 5},
    {"name": "Salamura Et", "calorie_100g": 260, "protein_100g": 30, "fat_100g": 15, "carb_100g": 0},

    # Balıklar
    {"name": "Levrek", "calorie_100g": 97, "protein_100g": 19, "fat_100g": 1.5, "carb_100g": 0},
    {"name": "Çipura", "calorie_100g": 105, "protein_100g": 19, "fat_100g": 2.5, "carb_100g": 0},
    {"name": "Somon", "calorie_100g": 208, "protein_100g": 20, "fat_100g": 13, "carb_100g": 0},
    {"name": "Palamut", "calorie_100g": 139, "protein_100g": 21, "fat_100g": 6, "carb_100g": 0},
    {"name": "Hamsi", "calorie_100g": 158, "protein_100g": 21, "fat_100g": 8, "carb_100g": 0},
    {"name": "Uskumru", "calorie_100g": 205, "protein_100g": 22, "fat_100g": 13, "carb_100g": 0},
    {"name": "Karides", "calorie_100g": 99, "protein_100g": 21, "fat_100g": 0.3, "carb_100g": 0.2},
    {"name": "Ahtapot", "calorie_100g": 82, "protein_100g": 15, "fat_100g": 1, "carb_100g": 2},

    # Yumurta & Süt Ürünleri
    {"name": "Yumurta", "calorie_100g": 155, "protein_100g": 13, "fat_100g": 11, "carb_100g": 1.1},
    {"name": "Yumurta Beyazı", "calorie_100g": 52, "protein_100g": 11, "fat_100g": 0.2, "carb_100g": 0.7},
    {"name": "Yumurta Sarısı", "calorie_100g": 322, "protein_100g": 16, "fat_100g": 27, "carb_100g": 3.6},
    {"name": "Beyaz Peynir", "calorie_100g": 264, "protein_100g": 18, "fat_100g": 21, "carb_100g": 3},
    {"name": "Kaşar Peyniri", "calorie_100g": 358, "protein_100g": 25, "fat_100g": 28, "carb_100g": 1},
    {"name": "Tulum Peyniri", "calorie_100g": 210, "protein_100g": 18, "fat_100g": 14, "carb_100g": 1},
    {"name": "Lor Peyniri", "calorie_100g": 98, "protein_100g": 11, "fat_100g": 4.3, "carb_100g": 3},
    {"name": "Mozzarella", "calorie_100g": 280, "protein_100g": 22, "fat_100g": 22, "carb_100g": 2},
    {"name": "Süzme Yoğurt", "calorie_100g": 98, "protein_100g": 9, "fat_100g": 5, "carb_100g": 4},
    {"name": "Yoğurt", "calorie_100g": 65, "protein_100g": 5.5, "fat_100g": 3, "carb_100g": 4.5},
    {"name": "Ayran", "calorie_100g": 35, "protein_100g": 2, "fat_100g": 1.5, "carb_100g": 3},
    {"name": "Süt", "calorie_100g": 60, "protein_100g": 3.3, "fat_100g": 3.5, "carb_100g": 4.8},
    {"name": "Kefir", "calorie_100g": 62, "protein_100g": 3.5, "fat_100g": 3.5, "carb_100g": 4.5},
    {"name": "Krema", "calorie_100g": 340, "protein_100g": 2, "fat_100g": 36, "carb_100g": 3},
    {"name": "Tereyağı", "calorie_100g": 717, "protein_100g": 0.9, "fat_100g": 81, "carb_100g": 0.1},
    {"name": "Kaymak", "calorie_100g": 580, "protein_100g": 3, "fat_100g": 60, "carb_100g": 2},

    # Tahıllar & Baklagiller
    {"name": "Pirinç (Beyaz)", "calorie_100g": 130, "protein_100g": 2.7, "fat_100g": 0.3, "carb_100g": 28},
    {"name": "Pirinç (Kahverengi)", "calorie_100g": 112, "protein_100g": 2.6, "fat_100g": 0.9, "carb_100g": 23},
    {"name": "Bulgur", "calorie_100g": 83, "protein_100g": 3.1, "fat_100g": 0.7, "carb_100g": 18.6},
    {"name": "Kuskus", "calorie_100g": 112, "protein_100g": 3.8, "fat_100g": 0.2, "carb_100g": 23},
    {"name": "Makarna", "calorie_100g": 131, "protein_100g": 5, "fat_100g": 1.1, "carb_100g": 25},
    {"name": "Makarna (Tam Buğday)", "calorie_100g": 124, "protein_100g": 5.3, "fat_100g": 0.5, "carb_100g": 26},
    {"name": "Yulaf Ezmesi", "calorie_100g": 389, "protein_100g": 17, "fat_100g": 7, "carb_100g": 66},
    {"name": "Ekmek (Beyaz)", "calorie_100g": 265, "protein_100g": 9, "fat_100g": 3, "carb_100g": 49},
    {"name": "Ekmek (Tam Buğday)", "calorie_100g": 245, "protein_100g": 10, "fat_100g": 3, "carb_100g": 41},
    {"name": "Çavdar Ekmeği", "calorie_100g": 230, "protein_100g": 8, "fat_100g": 2, "carb_100g": 45},
    {"name": "Tortilla", "calorie_100g": 237, "protein_100g": 6, "fat_100g": 5, "carb_100g": 42},
    {"name": "Kinoa", "calorie_100g": 120, "protein_100g": 4.4, "fat_100g": 1.9, "carb_100g": 21},
    {"name": "Arpa", "calorie_100g": 123, "protein_100g": 2.3, "fat_100g": 0.4, "carb_100g": 28},
    {"name": "Nohut", "calorie_100g": 164, "protein_100g": 9, "fat_100g": 2.6, "carb_100g": 27},
    {"name": "Mercimek (Kırmızı)", "calorie_100g": 116, "protein_100g": 9, "fat_100g": 0.4, "carb_100g": 20},
    {"name": "Mercimek (Yeşil)", "calorie_100g": 112, "protein_100g": 7.5, "fat_100g": 0.4, "carb_100g": 20},
    {"name": "Fasulye (Kuru)", "calorie_100g": 127, "protein_100g": 8.7, "fat_100g": 0.5, "carb_100g": 23},
    {"name": "Fasulye (Taze)", "calorie_100g": 31, "protein_100g": 1.8, "fat_100g": 0.1, "carb_100g": 7},
    {"name": "Bezelye", "calorie_100g": 81, "protein_100g": 5.4, "fat_100g": 0.4, "carb_100g": 14},
    {"name": "Mısır", "calorie_100g": 86, "protein_100g": 3.2, "fat_100g": 1.2, "carb_100g": 19},
    {"name": "Buğday", "calorie_100g": 340, "protein_100g": 13, "fat_100g": 2.5, "carb_100g": 72},

    # Sebzeler
    {"name": "Domates", "calorie_100g": 18, "protein_100g": 0.9, "fat_100g": 0.2, "carb_100g": 3.9},
    {"name": "Salatalık", "calorie_100g": 15, "protein_100g": 0.7, "fat_100g": 0.1, "carb_100g": 3.6},
    {"name": "Biber (Yeşil)", "calorie_100g": 20, "protein_100g": 0.9, "fat_100g": 0.2, "carb_100g": 4.6},
    {"name": "Biber (Kırmızı)", "calorie_100g": 31, "protein_100g": 1, "fat_100g": 0.3, "carb_100g": 6},
    {"name": "Soğan", "calorie_100g": 40, "protein_100g": 1.1, "fat_100g": 0.1, "carb_100g": 9},
    {"name": "Sarımsak", "calorie_100g": 149, "protein_100g": 6.4, "fat_100g": 0.5, "carb_100g": 33},
    {"name": "Patates", "calorie_100g": 77, "protein_100g": 2, "fat_100g": 0.1, "carb_100g": 17},
    {"name": "Tatlı Patates", "calorie_100g": 86, "protein_100g": 1.6, "fat_100g": 0.1, "carb_100g": 20},
    {"name": "Havuç", "calorie_100g": 41, "protein_100g": 0.9, "fat_100g": 0.2, "carb_100g": 10},
    {"name": "Ispanak", "calorie_100g": 23, "protein_100g": 2.9, "fat_100g": 0.4, "carb_100g": 3.6},
    {"name": "Marul", "calorie_100g": 15, "protein_100g": 1.4, "fat_100g": 0.2, "carb_100g": 2.9},
    {"name": "Roka", "calorie_100g": 25, "protein_100g": 2.6, "fat_100g": 0.7, "carb_100g": 3.7},
    {"name": "Mantar", "calorie_100g": 22, "protein_100g": 3.1, "fat_100g": 0.3, "carb_100g": 3.3},
    {"name": "Kabak", "calorie_100g": 17, "protein_100g": 1.2, "fat_100g": 0.3, "carb_100g": 3.1},
    {"name": "Patlıcan", "calorie_100g": 25, "protein_100g": 1, "fat_100g": 0.2, "carb_100g": 6},
    {"name": "Brokoli", "calorie_100g": 34, "protein_100g": 2.8, "fat_100g": 0.4, "carb_100g": 7},
    {"name": "Karnıbahar", "calorie_100g": 25, "protein_100g": 1.9, "fat_100g": 0.3, "carb_100g": 5},
    {"name": "Bezelye (Taze)", "calorie_100g": 81, "protein_100g": 5.4, "fat_100g": 0.4, "carb_100g": 14},
    {"name": "Mısır (Tane)", "calorie_100g": 86, "protein_100g": 3.2, "fat_100g": 1.2, "carb_100g": 19},
    {"name": "Enginar", "calorie_100g": 47, "protein_100g": 3.3, "fat_100g": 0.2, "carb_100g": 11},
    {"name": "Zeytin (Siyah)", "calorie_100g": 115, "protein_100g": 0.8, "fat_100g": 11, "carb_100g": 3},
    {"name": "Zeytin (Yeşil)", "calorie_100g": 145, "protein_100g": 1, "fat_100g": 15, "carb_100g": 3.8},
    {"name": "Turşu", "calorie_100g": 14, "protein_100g": 0.8, "fat_100g": 0.2, "carb_100g": 2.6},

    # Meyveler
    {"name": "Muz", "calorie_100g": 89, "protein_100g": 1.1, "fat_100g": 0.3, "carb_100g": 20},
    {"name": "Elma", "calorie_100g": 52, "protein_100g": 0.3, "fat_100g": 0.2, "carb_100g": 12},
    {"name": "Armut", "calorie_100g": 57, "protein_100g": 0.4, "fat_100g": 0.1, "carb_100g": 15},
    {"name": "Portakal", "calorie_100g": 47, "protein_100g": 0.9, "fat_100g": 0.1, "carb_100g": 10},
    {"name": "Mandalina", "calorie_100g": 45, "protein_100g": 0.8, "fat_100g": 0.1, "carb_100g": 10},
    {"name": "Karpuz", "calorie_100g": 30, "protein_100g": 0.6, "fat_100g": 0.2, "carb_100g": 8},
    {"name": "Kavun", "calorie_100g": 34, "protein_100g": 0.8, "fat_100g": 0.1, "carb_100g": 8},
    {"name": "Çilek", "calorie_100g": 32, "protein_100g": 0.7, "fat_100g": 0.3, "carb_100g": 8},
    {"name": "Üzüm", "calorie_100g": 69, "protein_100g": 0.7, "fat_100g": 0.2, "carb_100g": 18},
    {"name": "Kiraz", "calorie_100g": 50, "protein_100g": 1, "fat_100g": 0.3, "carb_100g": 12},
    {"name": "Kayısı", "calorie_100g": 48, "protein_100g": 1.4, "fat_100g": 0.4, "carb_100g": 11},
    {"name": "Şeftali", "calorie_100g": 39, "protein_100g": 0.9, "fat_100g": 0.3, "carb_100g": 10},
    {"name": "İncir (Taze)", "calorie_100g": 74, "protein_100g": 0.8, "fat_100g": 0.3, "carb_100g": 19},
    {"name": "İncir (Kuru)", "calorie_100g": 249, "protein_100g": 3.3, "fat_100g": 0.9, "carb_100g": 64},
    {"name": "Hurma", "calorie_100g": 277, "protein_100g": 1.8, "fat_100g": 0.2, "carb_100g": 75},
    {"name": "Kuru Üzüm", "calorie_100g": 299, "protein_100g": 3.1, "fat_100g": 0.5, "carb_100g": 79},
    {"name": "Ceviz", "calorie_100g": 654, "protein_100g": 15, "fat_100g": 65, "carb_100g": 14},
    {"name": "Badem", "calorie_100g": 579, "protein_100g": 21, "fat_100g": 50, "carb_100g": 22},
    {"name": "Fındık", "calorie_100g": 628, "protein_100g": 15, "fat_100g": 61, "carb_100g": 17},
    {"name": "Kaju", "calorie_100g": 553, "protein_100g": 18, "fat_100g": 44, "carb_100g": 30},
    {"name": "Antep Fıstığı", "calorie_100g": 567, "protein_100g": 20, "fat_100g": 46, "carb_100g": 27},
    {"name": "Yer Fıstığı Ezmesi", "calorie_100g": 588, "protein_100g": 25, "fat_100g": 50, "carb_100g": 20},
    {"name": "Chia Tohumu", "calorie_100g": 486, "protein_100g": 17, "fat_100g": 31, "carb_100g": 42},
    {"name": "Keten Tohumu", "calorie_100g": 534, "protein_100g": 18, "fat_100g": 42, "carb_100g": 29},
    {"name": "Ayçiçeği Tohumu", "calorie_100g": 584, "protein_100g": 21, "fat_100g": 51, "carb_100g": 20},
    {"name": "Kabak Çekirdeği", "calorie_100g": 559, "protein_100g": 30, "fat_100g": 49, "carb_100g": 11},

    # Yağlar & Soslar
    {"name": "Zeytinyağı", "calorie_100g": 884, "protein_100g": 0, "fat_100g": 100, "carb_100g": 0},
    {"name": "Ayçiçek Yağı", "calorie_100g": 884, "protein_100g": 0, "fat_100g": 100, "carb_100g": 0},
    {"name": "Tereyağı (Eritilmiş)", "calorie_100g": 717, "protein_100g": 0.9, "fat_100g": 81, "carb_100g": 0.1},
    {"name": "Hindistan Cevizi Yağı", "calorie_100g": 862, "protein_100g": 0, "fat_100g": 100, "carb_100g": 0},
    {"name": "Soya Sosu", "calorie_100g": 53, "protein_100g": 8, "fat_100g": 0, "carb_100g": 5},
    {"name": "Sirke", "calorie_100g": 18, "protein_100g": 0, "fat_100g": 0, "carb_100g": 0.6},
    {"name": "Domates Salçası", "calorie_100g": 74, "protein_100g": 3.5, "fat_100g": 1, "carb_100g": 14},
    {"name": "Biber Salçası", "calorie_100g": 82, "protein_100g": 3, "fat_100g": 1.5, "carb_100g": 15},
    {"name": "Ketçap", "calorie_100g": 112, "protein_100g": 1.7, "fat_100g": 1, "carb_100g": 26},
    {"name": "Mayonez", "calorie_100g": 680, "protein_100g": 1, "fat_100g": 75, "carb_100g": 1},
    {"name": "Hardal", "calorie_100g": 60, "protein_100g": 4, "fat_100g": 4, "carb_100g": 4},
    {"name": "Bal", "calorie_100g": 304, "protein_100g": 0.3, "fat_100g": 0, "carb_100g": 82},
    {"name": "Pekmez", "calorie_100g": 290, "protein_100g": 0.5, "fat_100g": 0.1, "carb_100g": 75},
    {"name": "Sosluk (Barbekü)", "calorie_100g": 172, "protein_100g": 0.6, "fat_100g": 0.6, "carb_100g": 40},

    # İçecekler
    {"name": "Su", "calorie_100g": 0, "protein_100g": 0, "fat_100g": 0, "carb_100g": 0},
    {"name": "Çay", "calorie_100g": 2, "protein_100g": 0, "fat_100g": 0, "carb_100g": 0.5},
    {"name": "Türk Kahvesi", "calorie_100g": 4, "protein_100g": 0.1, "fat_100g": 0, "carb_100g": 0.7},
    {"name": "Filtre Kahve", "calorie_100g": 2, "protein_100g": 0.1, "fat_100g": 0, "carb_100g": 0.3},
    {"name": "Espresso", "calorie_100g": 9, "protein_100g": 0.1, "fat_100g": 0.2, "carb_100g": 1.7},
    {"name": "Meyve Suyu (Portakal)", "calorie_100g": 45, "protein_100g": 0.7, "fat_100g": 0.2, "carb_100g": 10},
    {"name": "Smoothie (Meyveli)", "calorie_100g": 60, "protein_100g": 1, "fat_100g": 0.5, "carb_100g": 14},
    {"name": "Protein Tozu", "calorie_100g": 370, "protein_100g": 80, "fat_100g": 4, "carb_100g": 8},
    {"name": "Kola", "calorie_100g": 42, "protein_100g": 0, "fat_100g": 0, "carb_100g": 10.6},
    {"name": "Maden Suyu", "calorie_100g": 0, "protein_100g": 0, "fat_100g": 0, "carb_100g": 0},
    {"name": "Bira", "calorie_100g": 43, "protein_100g": 0.5, "fat_100g": 0, "carb_100g": 3.6},
    {"name": "Şarap (Kırmızı)", "calorie_100g": 85, "protein_100g": 0.1, "fat_100g": 0, "carb_100g": 2.6},
    {"name": "Şarap (Beyaz)", "calorie_100g": 82, "protein_100g": 0.1, "fat_100g": 0, "carb_100g": 2.1},
    {"name": "Rakı", "calorie_100g": 225, "protein_100g": 0, "fat_100g": 0, "carb_100g": 0},
    {"name": "Viski", "calorie_100g": 250, "protein_100g": 0, "fat_100g": 0, "carb_100g": 0},

    # Atıştırmalık & Tatlı
    {"name": "Çikolata (Bitter %70)", "calorie_100g": 598, "protein_100g": 8, "fat_100g": 43, "carb_100g": 46},
    {"name": "Çikolata (Süt)", "calorie_100g": 535, "protein_100g": 7, "fat_100g": 30, "carb_100g": 59},
    {"name": "Çikolatalı Gofret", "calorie_100g": 510, "protein_100g": 5, "fat_100g": 25, "carb_100g": 63},
    {"name": "Bisküvi", "calorie_100g": 475, "protein_100g": 6, "fat_100g": 20, "carb_100g": 65},
    {"name": "Kurabiye", "calorie_100g": 480, "protein_100g": 5, "fat_100g": 22, "carb_100g": 65},
    {"name": "Kek", "calorie_100g": 350, "protein_100g": 5, "fat_100g": 15, "carb_100g": 50},
    {"name": "Pastane Kek", "calorie_100g": 380, "protein_100g": 6, "fat_100g": 18, "carb_100g": 50},
    {"name": "Puding", "calorie_100g": 120, "protein_100g": 3, "fat_100g": 3, "carb_100g": 19},
    {"name": "Dondurma", "calorie_100g": 207, "protein_100g": 3.5, "fat_100g": 11, "carb_100g": 24},
    {"name": "Meyve Kurusu", "calorie_100g": 240, "protein_100g": 2, "fat_100g": 0.5, "carb_100g": 60},
    {"name": "Kuru Kayısı", "calorie_100g": 241, "protein_100g": 3.4, "fat_100g": 0.5, "carb_100g": 63},
    {"name": "Patlamış Mısır (Tereyağlı)", "calorie_100g": 500, "protein_100g": 7, "fat_100g": 28, "carb_100g": 54},
    {"name": "Cips (Patates)", "calorie_100g": 536, "protein_100g": 7, "fat_100g": 35, "carb_100g": 50},

    # Hazır Ürünler
    {"name": "Ton Balığı (Konserve)", "calorie_100g": 116, "protein_100g": 26, "fat_100g": 1, "carb_100g": 0},
    {"name": "Hummus", "calorie_100g": 166, "protein_100g": 8, "fat_100g": 10, "carb_100g": 14},
    {"name": "Tahin", "calorie_100g": 595, "protein_100g": 17, "fat_100g": 54, "carb_100g": 21},
    {"name": "Fıstık Ezmesi", "calorie_100g": 588, "protein_100g": 25, "fat_100g": 50, "carb_100g": 20},
    {"name": "Avokado", "calorie_100g": 160, "protein_100g": 2, "fat_100g": 15, "carb_100g": 9},
    {"name": "Mısır Gevrekleri", "calorie_100g": 357, "protein_100g": 7, "fat_100g": 1, "carb_100g": 85},
    {"name": "Granola", "calorie_100g": 470, "protein_100g": 12, "fat_100g": 18, "carb_100g": 62},
    {"name": "Bal (Karışım)", "calorie_100g": 304, "protein_100g": 0.3, "fat_100g": 0, "carb_100g": 82},
    {"name": "Nugget (Tavuk)", "calorie_100g": 250, "protein_100g": 16, "fat_100g": 15, "carb_100g": 13},
    {"name": "Pizza Hamuru", "calorie_100g": 218, "protein_100g": 8, "fat_100g": 3, "carb_100g": 40},
    {"name": "Fırında Patates", "calorie_100g": 93, "protein_100g": 2.5, "fat_100g": 0.2, "carb_100g": 21},
    {"name": "Patates Kızartması", "calorie_100g": 312, "protein_100g": 3.5, "fat_100g": 15, "carb_100g": 38},
]


def seed_foods():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        existing = db.query(Food).count()
        if existing > 0:
            print(f"Veritabanında zaten {existing} malzeme var, temizlenip yeniden ekleniyor...")
            db.query(Food).delete()
            db.commit()

        for food_data in RAW_INGREDIENTS:
            food = Food(**food_data, source="seed")
            db.add(food)

        db.commit()
        print(f"{len(RAW_INGREDIENTS)} malzeme eklendi!")
    finally:
        db.close()


if __name__ == "__main__":
    seed_foods()
