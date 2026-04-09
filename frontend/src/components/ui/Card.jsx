export default function Card({ children, className = '', ...props }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm p-5 ${className}`} {...props}>
      {children}
    </div>
  );
}
