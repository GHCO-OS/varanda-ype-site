import React from "react";

export function Reveal({ children, className = "", as: Tag = "div", delay: _delay = 0, ...rest }) {
  return (
    <Tag
      className={className}
      {...rest}
    >
      {children}
    </Tag>
  );
}
