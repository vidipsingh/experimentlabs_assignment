import { Textarea as ShadTextarea } from '@shadcn/ui';

const Textarea = ({ value, onChange, placeholder }) => {
  return (
    <ShadTextarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="textarea-style"
    />
  );
};

export default Textarea;