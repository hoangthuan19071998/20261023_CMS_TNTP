import ChiTietBai from "@/components/ChiTietBai";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ChiTietBai baiId={id} />;
}
