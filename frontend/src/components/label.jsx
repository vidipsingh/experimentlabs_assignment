import { Label as ShadLabel } from '@shadcn/ui';

const Label = ({ children, htmlFor }) => {
  return (
    <ShadLabel htmlFor={htmlFor} className="label-style">
      {children}
    </ShadLabel>
  );
};

export default Label;