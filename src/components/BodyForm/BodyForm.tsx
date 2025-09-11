import "./BodyForm.css";
import Card from "../Card/Card";
import Button from "../Button/Button";
import { useNavigate } from "react-router-dom";

interface BodyFormProps {
  introText?: string;
  showCards?: boolean;
  showButton?: boolean;
  buttonLabel?: string;
  children?: React.ReactNode;
}

const BodyForm: React.FC<BodyFormProps> = ({
  introText,
  showCards = false,
  showButton = true,
  buttonLabel,
  children,
}) => {
  const navigate = useNavigate();

  return (
    <div className="body-form">
      {introText && <p className="intro-form">{introText}</p>}

      {showCards && (
        <>
          <Card
            title="Título de la tarjeta"
            description="Esta es una descripción de ejemplo para la tarjeta."
            description2="Lorem ipsum dolor sit amet, consectetur adipiscing elit..."
          />
          <Card
            title="Título de la tarjeta"
            description="Otra tarjeta de ejemplo"
            description2="Lorem ipsum dolor sit amet, consectetur adipiscing elit..."
          />
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
