import { useState } from 'react';
import { 
  Home, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  BarChart3, 
  LogOut,
  Menu,
  X,
  User,
  Sparkles
} from 'lucide-react';

export default function Layout({ children, currentPage, onNavigate, user, profile, onSignOut }) {
  const [showMenu, setShowMenu] = useState(false);

  const handleSignOut = async () => {
    if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
      onSignOut();
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Inicio', icon: Home, gradient: 'from-blue-600 to-blue-500' },
    { id: 'products', label: 'Compras', icon: Package, gradient: 'from-cyan-600 to-cyan-500' },
    { id: 'sales', label: 'Ventas', icon: ShoppingCart, gradient: 'from-green-600 to-green-500' },
    { id: 'reports', label: 'Historial', icon: BarChart3, gradient: 'from-purple-600 to-purple-500' },
  ];

  const currentItem = menuItems.find(item => item.id === currentPage);

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(to bottom right, #111827, #1e293b, #0f172a)',
      paddingBottom: '96px'
    }}>
      {/* Header mejorado */}
      <header style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        borderBottom: '1px solid rgba(71, 85, 105, 0.3)'
      }}>
        <div style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                style={{
                  display: 'block',
                  padding: '8px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
              >
                {showMenu ? <X style={{ width: '24px', height: '24px', color: 'white' }} /> : <Menu style={{ width: '24px', height: '24px', color: 'white' }} />}
              </button>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles style={{ width: '20px', height: '20px', color: '#fbbf24' }} />
              
                </div>
                {/* MEJORADO: Texto más blanco y bold */}
                <p style={{ fontSize: '14px', color: '#f8fafc', fontWeight: '800', margin: '4px 0 0 0', letterSpacing: '0.5px' }}>
                  {currentItem?.label || 'Dashboard'}
                </p>
              </div>
            </div>

            {/* MEJORADO: Usuario siempre visible */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '14px', fontWeight: '800', color: '#f8fafc', margin: 0, letterSpacing: '0.3px' }}>
                  {profile?.full_name || user?.email?.split('@')[0] || 'Usuario'}
                </p>
                <p style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: '700', margin: '2px 0 0 0', textTransform: 'capitalize' }}>
                  {profile?.role === 'admin' ? '👑 Admin' : '👤 Empleado'}
                </p>
              </div>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
                border: '2px solid rgba(255, 255, 255, 0.1)'
              }}>
                <User style={{ width: '24px', height: '24px', color: 'white' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Menu móvil */}
        {showMenu && (
          <div style={{
            background: 'rgba(30, 41, 59, 0.95)',
            backdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(71, 85, 105, 0.3)'
          }}>
            <nav style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      setShowMenu(false);
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      borderRadius: '16px',
                      transition: 'all 0.2s',
                      fontWeight: '800',
                      fontSize: '14px',
                      border: 'none',
                      cursor: 'pointer',
                      background: isActive ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                      color: isActive ? '#60a5fa' : '#f8fafc',
                      letterSpacing: '0.3px'
                    }}
                    onMouseEnter={e => !isActive && (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)')}
                    onMouseLeave={e => !isActive && (e.currentTarget.style.background = 'transparent')}
                  >
                    <Icon style={{ width: '20px', height: '20px' }} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
              <button
                onClick={handleSignOut}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '16px',
                  background: 'rgba(239, 68, 68, 0.2)',
                  color: '#fca5a5',
                  transition: 'all 0.2s',
                  fontWeight: '800',
                  fontSize: '14px',
                  border: 'none',
                  cursor: 'pointer',
                  letterSpacing: '0.3px'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
              >
                <LogOut style={{ width: '20px', height: '20px' }} />
                <span>Cerrar Sesión</span>
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Contenido */}
      <main style={{ padding: '32px 16px', maxWidth: '1280px', margin: '0 auto' }}>
        {children}
      </main>

      {/* Navegación inferior con mejor contraste */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'rgba(30, 41, 59, 0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(71, 85, 105, 0.3)',
        zIndex: 50,
        boxShadow: '0 -10px 15px -3px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '4px',
          padding: '12px 8px'
        }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '8px 4px',
                  borderRadius: '16px',
                  transition: 'all 0.3s',
                  border: 'none',
                  cursor: 'pointer',
                  background: isActive ? `linear-gradient(135deg, ${item.gradient.split(' ')[1]} 0%, ${item.gradient.split(' ')[3]} 100%)` : 'transparent',
                  color: isActive ? '#ffffff' : '#cbd5e1',
                  transform: isActive ? 'scale(1.1)' : 'scale(1)'
                }}
                onMouseEnter={e => !isActive && (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)')}
                onMouseLeave={e => !isActive && (e.currentTarget.style.background = 'transparent')}
              >
                <Icon style={{ width: '24px', height: '24px' }} />
                <span style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '0.3px' }}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Botón flotante */}
      <button
        onClick={handleSignOut}
        style={{
          display: 'none',
          position: 'fixed',
          bottom: '32px',
          right: '32px',
          alignItems: 'center',
          gap: '8px',
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: 'white',
          padding: '16px 24px',
          borderRadius: '9999px',
          boxShadow: '0 20px 25px -5px rgba(239, 68, 68, 0.3)',
          border: 'none',
          cursor: 'pointer',
          fontWeight: '700',
          transition: 'all 0.3s'
        }}
        className="lg-flex"
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'scale(1.1) translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 25px 30px -5px rgba(239, 68, 68, 0.4)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'scale(1) translateY(0)';
          e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(239, 68, 68, 0.3)';
        }}
      >
        <LogOut style={{ width: '20px', height: '20px' }} />
        <span>Cerrar Sesión</span>
      </button>
    </div>
  );
}