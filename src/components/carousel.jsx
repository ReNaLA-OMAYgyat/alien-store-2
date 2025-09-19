// HomeCarousel.jsx
import React from "react";
import Images1 from "../assets/images/sepatu.jpg";
import Images2 from "../assets/images/sembako.jpg";
import Images3 from "../assets/images/snack.jpg";
export default function HomeCarousel() {
  const slides = [
    { id: 1, title: "Selamat Datang", subtitle: "Temukan produk favoritmu!", image: Images1, buttonText: "Belanja Sekarang", buttonLink: "#" },
    { id: 2, title: "Promo Spesial", subtitle: "Diskon hingga 50%", image: Images2, buttonText: "Lihat Promo", buttonLink: "#" },
    { id: 3, title: "Produk Baru", subtitle: "Jangan sampai ketinggalan tren terbaru", image: Images3, buttonText: "Cek Sekarang", buttonLink: "#" },
  ];

  return (
    <div className="container mt-4">
      <div id="homepageCarousel" className="carousel slide carousel-fade" data-bs-ride="carousel">
        <div className="carousel-indicators">
          {slides.map((slide, index) => (
            <button key={slide.id} type="button" data-bs-target="#homepageCarousel" data-bs-slide-to={index} className={index===0?"active":""} aria-current={index===0?"true":undefined} aria-label={`Slide ${index+1}`}></button>
          ))}
        </div>
        <div className="carousel-inner">
          {slides.map((slide, index) => (
            <div key={slide.id} className={`carousel-item ${index===0?"active":""}`}>
              <img src={slide.image} className="d-block w-100 rounded-sm" alt={slide.title} style={{maxHeight:"500px", objectFit:"cover"}} />
              <div className="carousel-caption d-none d-md-block bg-dark bg-opacity-50 rounded p-3">
                <h3>{slide.title}</h3>
                <p>{slide.subtitle}</p>
                <a href={slide.buttonLink} className="btn btn-primary">{slide.buttonText}</a>
              </div>
            </div>
          ))}
        </div>
        <button className="carousel-control-prev" type="button" data-bs-target="#homepageCarousel" data-bs-slide="prev">
          <span className="carousel-control-prev-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Previous</span>
        </button>
        <button className="carousel-control-next" type="button" data-bs-target="#homepageCarousel" data-bs-slide="next">
          <span className="carousel-control-next-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Next</span>
        </button>
      </div>
    </div>
  );
}
