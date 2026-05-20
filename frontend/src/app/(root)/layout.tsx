import Header from "@/components/header";
import { Container } from "@/shared/ui/container";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main>
      <Container>
        <Header />
        {children}
      </Container>
    </main>
  );
}
