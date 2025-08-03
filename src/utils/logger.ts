export default function Logger(log: string, type: keyof Console) {
  console[type].call(console, log);
}
