import { IntakeForm } from "./intake-form";

export default async function IntakePage(
  props: PageProps<"/intake/[sessionId]">,
) {
  const { sessionId } = await props.params;
  const today = new Date().toISOString().slice(0, 10);
  return <IntakeForm sessionId={sessionId} today={today} />;
}
