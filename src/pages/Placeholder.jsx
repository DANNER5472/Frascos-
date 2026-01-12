import { Construction } from 'lucide-react';

export default function Placeholder({ title, description, icon: Icon = Construction }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-100 rounded-full mb-6">
          <Icon className="w-10 h-10 text-primary-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          {title}
        </h2>
        <p className="text-gray-600">
          {description || 'Esta sección estará disponible próximamente.'}
        </p>
      </div>
    </div>
  );
}