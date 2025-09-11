import "./Card.css";

type CardProps = {
  title: string;
  description: string;
  description2?: string;
  description3?: string;
};

export default function Card({
  title,
  description,
  description2,
  description3,
}: CardProps) {
  return (
    <div className="card">
      <h2 className="title-card">{title}</h2>
      <p className="content-card">{description}</p>
      {description2 && <p className="content-card">{description2}</p>}
      {description3 && <p className="content-card">{description3}</p>}
    </div>
  );
}
