// app/login/page.tsx

'use client'; // 🚨 IMPORTANTE: Necesitas esta directiva para usar hooks y localStorage

import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; // Hook para redireccionar
import { login } from '@/lib/directus'; // Importar la función de login del SDK

// Componente principal de la página
export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(''); // Limpiar errores anteriores

        try {
            // Llama a la función de login del SDK de Directus
            const result = await login(email, password);
            
            console.log('Login exitoso. Usuario:', result.user.email);
            
            // Redirigir al usuario al dashboard o página principal
            // (Asegúrate de cambiar '/dashboard' a tu ruta real)
            router.push('/dashboard'); 

        } catch (err) {
            console.error(err);
            // Mostrar un mensaje de error al usuario
            setError('Fallo el inicio de sesión. Verifica tus credenciales.');
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
            <h2>Iniciar Sesión</h2>
            <form onSubmit={handleSubmit}>
                
                {/* Campo de Email */}
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>
                
                {/* Campo de Contraseña */}
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="password">Contraseña</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>

                {/* Mensaje de Error */}
                {error && <p style={{ color: 'red' }}>{error}</p>}
                
                {/* Botón de Submit */}
                <button type="submit" style={{ padding: '10px 15px', cursor: 'pointer' }}>
                    Entrar
                </button>
            </form>
        </div>
    );
}