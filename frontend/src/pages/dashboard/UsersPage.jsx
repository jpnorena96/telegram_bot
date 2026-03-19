import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Users, UserPlus, Search, Filter } from 'lucide-react';
import { api } from '../../services/api';

const UsersPage = () => {
  const { role } = useOutletContext();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (role === 'ADMINISTRATOR' || role === 'AUDITOR') {
      const fetchUsers = async () => {
        try {
          const data = await api.getUsers();
          setUsers(data);
        } catch (err) {
          console.error("Failed to load users:", err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchUsers();
    } else {
      setIsLoading(false);
    }
  }, [role]);
  
  if (role !== 'ADMINISTRATOR' && role !== 'AUDITOR') {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in" style={{ padding: '4rem 2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--danger-color)', marginBottom: '1rem' }}>
          Acceso Denegado
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>No tienes permisos para ver esta sección.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Gestión de Usuarios
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Administra los usuarios del sistema y sus roles.
          </p>
        </div>
        
        {role === 'ADMINISTRATOR' && (
          <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserPlus size={20} />
            Nuevo Usuario
          </button>
        )}
      </div>

      <div className="glass" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
            <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Buscar por nombre o correo..." 
              className="input-field"
              style={{ paddingLeft: '3rem' }}
            />
          </div>
          <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={20} /> Por Rol
          </button>
        </div>
      </div>

      <div className="glass" style={{ overflow: 'x-auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(59, 130, 246, 0.05)', borderBottom: '1px solid var(--border-color, #e2e8f0)' }}>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Usuario</th>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Rol</th>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Estado</th>
              {role === 'ADMINISTRATOR' && <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
               <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Cargando usuarios...</td></tr>
            ) : users.length === 0 ? (
               <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No se encontraron usuarios.</td></tr>
            ) : users.map((u) => (
              <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color, #e2e8f0)', transition: 'background var(--transition-fast)' }}>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'rgba(59, 130, 246, 0.1)',
                      color: 'var(--primary-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Users size={20} />
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{u.name}</p>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>{u.email}</p>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    border: '1px solid var(--border-color)'
                  }}>
                    {u.role}
                  </span>
                </td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    background: u.status === 'Activo' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: u.status === 'Activo' ? 'var(--success-color)' : 'var(--danger-color)'
                  }}>
                    {u.status}
                  </span>
                </td>
                {role === 'ADMINISTRATOR' && (
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <button style={{
                      padding: '0.5rem 1rem',
                      background: 'transparent',
                      color: 'var(--primary-color)',
                      border: '1px solid var(--primary-color)',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: 500
                    }}>
                      Editar
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersPage;
