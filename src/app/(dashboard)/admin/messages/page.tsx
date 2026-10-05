import { ContactMessagesList } from "@/components/module/contact";

export default function AdminMessagesPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Messages</h1>
        <p className="text-sm text-muted-foreground">Messages sent from the public contact page.</p>
      </div>
      <ContactMessagesList />
    </div>
  );
}