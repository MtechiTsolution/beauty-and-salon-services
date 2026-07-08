import { Navigate } from 'react-router-dom';

/** @deprecated Use `/salons` — kept for any old links. */
export default function BranchesPage() {
  return <Navigate to="/salons" replace />;
}
