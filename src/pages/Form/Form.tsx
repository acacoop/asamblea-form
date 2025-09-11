import "./Form.css";
import HeaderForm from "../../components/HeaderForm/HeaderForm";
import BodyForm from "../../components/BodyForm/BodyForm";
import Footer from "../../components/Footer/Footer";
import FormGroup from "../../components/FormGroup/FormGroup";

export default function Form() {
  return (
    <div className="form">
      <div className="form-container">
        <HeaderForm titleForm="Formulario" showButtonBack={true} />
        <BodyForm
          introText="Complete el siguiente formulario con sus datos personales. Los campos marcados con asterisco (*) son obligatorios."
          showCards={false}
          showButton={true}
          buttonLabel="Enviar formulario"
        >
          <FormGroup />
        </BodyForm>
        <Footer />
      </div>
    </div>
  );
}
