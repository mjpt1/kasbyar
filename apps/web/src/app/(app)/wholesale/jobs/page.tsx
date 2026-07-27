import { Wave4PackJobsPage } from '@/components/packs/wave4-pack-pages';

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  return <Wave4PackJobsPage pack="WHOLESALE" searchParams={searchParams} />;
}
