import PublicSiteFooter from "@/components/clinic/PublicSiteFooter";
import PublicSiteHeader from "@/components/clinic/PublicSiteHeader";

export default function PublicLayout({ children }: { children: any }) {
  return (
    <div className="min-h-screen">
      <PublicSiteHeader />
      <main>{children}</main>
      <PublicSiteFooter />
    </div>
  );
}
