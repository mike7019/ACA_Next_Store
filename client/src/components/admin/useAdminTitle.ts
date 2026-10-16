import { useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { SetAdminTitle } from './AdminLayout.tsx';

export function useAdminTitle(title: string) {
  const setTitle = useOutletContext<SetAdminTitle>();
  useEffect(() => setTitle(title), [title, setTitle]);
}
