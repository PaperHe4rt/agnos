import { IntakeForm } from "./intake-form";

export default function IntakePage() {
  const today = new Date().toISOString().slice(0, 10);
  return <IntakeForm today={today} />;
}
