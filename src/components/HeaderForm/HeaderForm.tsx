import Logo from "../../assets/logo.png";
import { useNavigate } from "react-router-dom";
import "./HeaderForm.css";

type HeaderFormProps = {
  titleForm: string;
  showButtonBack?: boolean;
};

export default function HeaderForm({
  titleForm,
  showButtonBack,
}: HeaderFormProps) {
  const navigate = useNavigate();
  return (
    <header className="header-form">
      {showButtonBack && (
        <button className="back-button" onClick={() => navigate(-1)}>
          Volver
        </button>
      )}
      <div className="logo-container">
        <img src={Logo} alt="Logo" className="logo" />
        <h2 className="logo-text">
          Asociación de Cooperativas Argentinas C.L.
        </h2>
      </div>
      <div className="container-title-form">
        <h1 className="title-form">{titleForm}</h1>
      </div>
    </header>
  );
}
