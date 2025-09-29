import "./Card.css";

type CardProps = {
  title: string;
  description: string | React.ReactNode;
  description2?: string | React.ReactNode;
  description3?: string | React.ReactNode;
};

export default function Card({ title, description }: CardProps) {
  return (
    <div className="card">
      <h2 className="title-card">{title}</h2>
      <p className="content-card">{description}</p>
    </div>
  );
}
