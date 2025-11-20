// Componente de Login (ej. app/login/page.tsx o LoginForm.tsx)
import { login } from '@/lib/directus'; // Asegúrate de la ruta correcta
// ...

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  // ... obtener email y password del formulario
  
  try {
    const { user } = await login(email, password); // Usa la nueva función login
    
    // Si tiene éxito, redirigir
    router.push('/dashboard'); 
  } catch (error) {
    // Mostrar mensaje de error al usuario
    setErrorMessage((error as Error).message);
  }
};