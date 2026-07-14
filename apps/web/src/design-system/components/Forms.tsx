import styles from "./forms.module.css";

export function Input({
  label,
  id,
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const inputId = id ?? props.name ?? label.toLowerCase().replace(/\s+/g, "-");
  return (
    <label className={`${styles.field} ${className}`.trim()} htmlFor={inputId}>
      <span>{label}</span>
      <input id={inputId} className={styles.input} {...props} />
    </label>
  );
}

export function Toggle({
  label,
  checked,
  onChange,
  id,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  id?: string;
}) {
  const toggleId = id ?? label.toLowerCase().replace(/\s+/g, "-");
  return (
    <label className={styles.toggle} htmlFor={toggleId}>
      <span>{label}</span>
      <input
        id={toggleId}
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className={styles.switch} aria-hidden="true" />
    </label>
  );
}

export function Slider({
  label,
  value,
  min = 0,
  max = 1,
  step = 0.01,
  onChange,
}: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
}) {
  const sliderId = label.toLowerCase().replace(/\s+/g, "-");
  return (
    <label className={styles.slider} htmlFor={sliderId}>
      <div className={styles.sliderMeta}>
        <span>{label}</span>
        <span aria-live="polite">{Math.round(value * 100)}%</span>
      </div>
      <input
        id={sliderId}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}
