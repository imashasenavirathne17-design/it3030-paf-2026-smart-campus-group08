import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar  from './Topbar'
import RightPanel from './RightPanel'
import useNotifications from '../../hooks/useNotifications'
import CriticalAnnouncementOverlay from './CriticalAnnouncementOverlay'

export default function AppLayout() {
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  
  const { criticalMessage, setCriticalMessage } = useNotifications()

  const toggleRightPanel = () => setIsRightPanelOpen(!isRightPanelOpen)
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

  const sidebarWidth = isSidebarOpen ? '240px' : 'var(--sidebar-width)'

  return (
    <div className="app-layout" style={styles.layout}>
      {criticalMessage && (
        <CriticalAnnouncementOverlay 
          message={criticalMessage} 
          onClose={() => setCriticalMessage(null)} 
        />
      )}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div 
        className="main-container" 
        style={{ ...styles.mainContainer, marginLeft: sidebarWidth }}
      >
        <div 
          className="content-wrapper" 
          style={{
            ...styles.contentWrapper,
            marginRight: isRightPanelOpen ? 'var(--right-panel-width)' : '0'
          }}
        >
          <Topbar toggleRightPanel={toggleRightPanel} />
          <main style={styles.mainContent}>
            <Outlet />
          </main>
        </div>
        
        {isRightPanelOpen && <RightPanel />}
      </div>
    </div>
  )
}

const styles = {
  layout: {
    display: 'flex',
    minHeight: '100vh',
    background: 'var(--bg-main)',
  },
  mainContainer: {
    flex: 1,
    display: 'flex',
    transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  contentWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    transition: 'margin-right 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  mainContent: {
    padding: '0 40px 40px',
    flex: 1,
  }
}
