import "./BodyForm.css";
import Card from "../Card/Card";
import Button from "../Button/Button";
import AccessToForm from "../AccessToForm/AccessToForm";
import { useNavigate } from "react-router-dom";

interface BodyFormProps {
  introText?: string;
  showCards?: boolean;
  showButton?: boolean;
  buttonLabel?: string;
  children?: React.ReactNode;
  showAccessForm?: boolean;
}

const BodyForm: React.FC<BodyFormProps> = ({
  introText,
  showCards = false,
  showButton = true,
  buttonLabel,
  children,
  showAccessForm = false,
}) => {
  const navigate = useNavigate();

  return (
    <div className="body-form">
      {introText && <p className="intro-form">{introText}</p>}

      {showCards && (
        <>
          <Card
            title="📅 Fecha de la Asamblea"
            description="27 de Octubre de 2025"
          />
          <Card
            title="📋 Descripción"
            description="Documentación para nominar delegados con derecho a voto en la Asamblea General Ordinaria de la Asociación de Cooperativas Argentinas Coop. Ltda."
          />
          <Card
            title="🔐 Acceso Seguro"
            description="Para acceder al formulario, ingrese el código de su cooperativa y el código verificador proporcionado. Este sistema garantiza que solo personal autorizado pueda registrar los datos de cada cooperativa."
          />
          <Card
            title="ℹ️ Información Importante"
            description="Esta documentación permitirá registrar a los delegados titulares y suplentes que representarán a su cooperativa en la asamblea, así como las cartas poder correspondientes. Asegúrese de completar toda la información requerida y verificar los datos antes de enviar el formulario."
          />
          {showAccessForm && <AccessToForm />}
        </>
      )}

      {/* Renderizar cualquier contenido pasado como children */}
      {children}

      {showButton && (
        <Button
          label={buttonLabel || "Ingreso formulario"}
          onClick={() => navigate("/form")}
        />
      )}
    </div>
  );
};

export default BodyForm;
