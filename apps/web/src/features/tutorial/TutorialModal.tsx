"use client";

import { Button, Modal } from "@/design-system/components";
import { useSettings } from "@/providers/SettingsProvider";

const STEPS = [
  {
    title: "Practice first",
    body: "Practice runs entirely on your device. No wallet, no blockchain, and no effect on future wagered play.",
  },
  {
    title: "Play with SOL later",
    body: "Real-value play stays disabled until architecture gates pass. Play With SOL will arrive in a later phase.",
  },
  {
    title: "Rounds and timer",
    body: "Each round gives you 20 seconds to choose Rock, Paper, or Scissors. If time expires, a random move is chosen.",
  },
  {
    title: "Reveal and scoring",
    body: "Moves reveal after both sides lock in. Ties replay the round. First to two non-tied round wins takes the match.",
  },
  {
    title: "Winning locally",
    body: "Beat the CPU in best-of-three practice, review round history, and rematch as often as you like.",
  },
] as const;

export function TutorialModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { completeTutorial } = useSettings();

  const dismiss = () => {
    completeTutorial();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={dismiss}
      title="Welcome to RPS"
      footer={<Button onClick={dismiss}>Got it — start exploring</Button>}
    >
      <div style={{ display: "grid", gap: "16px" }}>
        {STEPS.map((step, index) => (
          <section key={step.title}>
            <strong>
              {index + 1}. {step.title}
            </strong>
            <p style={{ margin: "8px 0 0" }}>{step.body}</p>
          </section>
        ))}
      </div>
    </Modal>
  );
}
