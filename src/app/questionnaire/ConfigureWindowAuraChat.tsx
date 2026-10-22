import PermitAssistant from '../PermitAssistant';

export default function ConfigureWindowAuraChat(props: { onClose: () => void; scopeLabel?: string }) {
  return <PermitAssistant {...props} />;
}
