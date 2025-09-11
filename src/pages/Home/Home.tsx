import "./Home.css";
import HeaderForm from "../../components/HeaderForm/HeaderForm";
import BodyForm from "../../components/BodyForm/BodyForm";
import Footer from "../../components/Footer/Footer";

export default function Home() {
  return (
    <div className="home">
      <div className="form-container">
        <HeaderForm
          titleForm="Asamblea General Ordinaria 2025"
          showButtonBack={false}
        />
        <BodyForm
          introText=""
          showCards={true}
          showButton={false}
          buttonLabel="Ir al formulario"
          showAccessForm={true}
        />
        <Footer />
      </div>
    </div>
  );
}
