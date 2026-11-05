import React from "react";

export const Header = ({ children }: React.PropsWithChildren) => <header className="header">{children}</header>;
export const Footer = ({ children }: React.PropsWithChildren) => <footer className="footer">{children}</footer>;
export const Sidebar = ({ children }: React.PropsWithChildren) => <aside className="sidebar">{children}</aside>;
export const Navbar = ({ children }: React.PropsWithChildren) => <nav className="navbar">{children}</nav>;
export const Button = (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => <button className="button" {...props} />;
export const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => <input className="input" {...props} />;
export const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => <select className="select" {...props} />;
export const Checkbox = (props: React.InputHTMLAttributes<HTMLInputElement>) => <input type="checkbox" className="checkbox" {...props} />;
export const RadioGroup = ({ children }: React.PropsWithChildren) => <div className="radio-group">{children}</div>;
export const Modal = ({ children }: React.PropsWithChildren) => <div className="modal">{children}</div>;
export const Drawer = ({ children }: React.PropsWithChildren) => <div className="drawer">{children}</div>;
export const Tabs = ({
  children,
  className = ""
}: React.PropsWithChildren<{ className?: string }>) => (
  <div className={`tabs ${className}`.trim()}>{children}</div>
);
export const Accordion = ({ children }: React.PropsWithChildren) => <div className="accordion">{children}</div>;
export const Card = ({
  children,
  className = ""
}: React.PropsWithChildren<{ className?: string }>) => (
  <article className={`card ${className}`.trim()}>{children}</article>
);
export const Badge = ({ children }: React.PropsWithChildren) => <span className="badge">{children}</span>;
export const Tag = ({ children }: React.PropsWithChildren) => <span className="tag">{children}</span>;
export const DataTable = ({ children }: React.PropsWithChildren) => <table className="table">{children}</table>;
export const Pagination = ({ children }: React.PropsWithChildren) => <div className="pagination">{children}</div>;
export const Breadcrumbs = ({ children }: React.PropsWithChildren) => <div className="breadcrumbs">{children}</div>;
export const Snackbar = ({
  children,
  onClick,
  type = "info"
}: React.PropsWithChildren<{ onClick?: () => void; type?: "success" | "error" | "info" }>) => {
  const bgColor = type === "error" ? "#b91c1c" : type === "success" ? "#166534" : "#10b981";
  const borderColor = type === "error" ? "#ef4444" : type === "success" ? "#10b981" : "#34d399";
  
  return (
    <div
      className="snackbar"
      onClick={onClick}
      role="status"
      style={{ background: bgColor, borderColor }}
    >
      {children}
    </div>
  );
};
export const DatePicker = (props: React.InputHTMLAttributes<HTMLInputElement>) => <input type="date" className="input" {...props} />;
export const Loader = () => <div className="loader">Loading...</div>;
export const EmptyState = ({ text }: { text: string }) => <div className="empty-state">{text}</div>;
export const ChartBlock = ({ title, value }: { title: string; value: number | string }) => (
  <div className="chart-block">
    <strong>{title}</strong>
    <span>{value}</span>
  </div>
);
