import "./Home.css";
import HeaderForm from "../../components/HeaderForm/HeaderForm";
import BodyForm from "../../components/BodyForm/BodyForm";
import Footer from "../../components/Footer/Footer";

export default function Home() {
  return (
    <div className="home">
      <div className="form-container">
        <HeaderForm titleForm="Título Formulario" showButtonBack={false} />
        <BodyForm
          introText="lorem ipsum dolor sit amet, consectetur adipisicing elit. Ipsa eveniet perferendis dolorem earum, voluptate ad nihil aliquid! Aspernatur beatae iure magni est tempore exercitationem, voluptates id earum! Quae, optio sed?"
          showCards={true}
          showButton={true}
          buttonLabel="Ir al formulario"
        />
        <Footer />
      </div>
    </div>
  );
}
