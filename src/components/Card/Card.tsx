import "./Card.css";

type CardProps = {
  title: string;
  description: string;
  description2?: string;
  description3?: string;
};

export default function Card({ title, description }: CardProps) {
  return (
    <div className="card">
      <h2 className="title-card">{title}</h2>
      <p className="content-card">{description}</p>
    </div>
  );
}
