import { RefreshCw } from 'lucide-react'
import {memo} from 'react'
import toast from 'react-hot-toast';
interface SyncButtonProps {
    fetchData: () => void
}
function SyncButton(props: SyncButtonProps) {
    const handleSync = () => {
        localStorage.clear();
        props.fetchData();
        toast.success('Cache cleared. latest data fetched...');
    }
    return (
        <button
            onClick={handleSync}
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            title="Sync"
        >
            <RefreshCw size={16} className="text-white" />
        </button>
    )
}
export default memo(SyncButton);