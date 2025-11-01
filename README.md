# 🔐 Autenticación y Autorización

## ¿Cuál es la diferencia entre autenticación y autorización?

**Autenticación** verifica **QUIÉN ERES** - confirma la identidad del usuario mediante credenciales como usuario/contraseña.

**Autorización** determina **QUÉ PUEDES HACER** - establece los permisos y niveles de acceso una vez autenticado.

## ¿Cuál es la función del token JWT en la guía?

El token JWT funciona como **mecanismo de autenticación stateless** que:

1. **Verifica la identidad** del usuario sin sesiones en servidor
2. **Contiene información** del usuario (ID, roles, permisos) 
3. **Controla acceso** a recursos basado en roles y permisos
4. **Garantiza seguridad** mediante firma digital y expiración

El token se envía en el header `Authorization` para acceder a endpoints protegidos.
