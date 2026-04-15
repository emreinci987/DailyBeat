import { Outlet } from 'react-router-dom'
import Sidebar from '../Sidebar/Sidebar'
import './AppLayout.css'

function AppLayout() {
    return (
        <div className="app-layout">
            <Sidebar />
            <div className="app-layout__content">
                <Outlet />
            </div>
        </div>
    )
}

export default AppLayout
