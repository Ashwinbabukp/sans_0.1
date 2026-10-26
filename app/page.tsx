import SansApp from '@/components/SansApp';
import { StoreProvider } from '@/lib/store';

export default function Page() {
  return (
    <StoreProvider>
      <SansApp />
    </StoreProvider>
  );
}
