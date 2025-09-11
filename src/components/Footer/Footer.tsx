import "./Footer.css";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="footer">
      <p>© {currentYear} Asociación de Cooperativas Argentinas C.L.</p>
    </footer>
  );
}
