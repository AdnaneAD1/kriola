import { XCircle, CheckCircle, XIcon } from 'lucide-react';

export function Alert({ children, type = 'error', onClose }) {
  const bgColor = type === 'error' ? 'bg-red-50' : 'bg-green-50';
  const textColor = type === 'error' ? 'text-red-800' : 'text-green-800';
  const borderColor = type === 'error' ? 'border-red-200' : 'border-green-200';
  const Icon = type === 'error' ? XCircle : CheckCircle;

  return (
    <div className={`rounded-md ${bgColor} border ${borderColor} p-4 relative`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon className={`h-5 w-5 ${textColor}`} aria-hidden="true" />
        </div>
        <div className="ml-3">
          <p className={`text-sm font-medium ${textColor}`}>{children}</p>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={onClose}
                className={`inline-flex rounded-md p-1.5 ${bgColor} ${textColor} hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-${type === 'error' ? 'red' : 'green'}-50 focus:ring-${type === 'error' ? 'red' : 'green'}-600`}
              >
                <span className="sr-only">Fermer</span>
                <XIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
