# Guía de Despliegue Continuo (CI/CD)

Este proyecto usa **GitHub Actions** para desplegar automáticamente cada vez que haces un `push` a la rama `master`.

## Configuración de Secretos en GitHub

Para que el deploy funcione, debes ir a tu repositorio en GitHub:
**Settings > Secrets and variables > Actions** y añadir los siguientes **Repository secrets**:

1.  **`GCP_VM_IP`**: La dirección IP pública de tu instancia (la que obtuviste con el script, ej: `34.123.145.167`).
2.  **`GCP_SSH_USER`**: Tu nombre de usuario en la VM (puedes verlo ejecutando `whoami` dentro de la VM).
3.  **`GCP_SSH_PRIVATE_KEY`**: Tu clave privada SSH (ver sección abajo).

---

## Cómo generar y configurar la SSH Key

1.  **En tu PC local (Windows/PowerShell):**

    ```powershell
    ssh-keygen -t rsa -b 4096 -f github_deploy_key
    ```

    _Esto generará dos archivos: `github_deploy_key` (privada) y `github_deploy_key.pub` (pública)._

2.  **Configura la Clave Pública en Google Cloud:**
    - Ve a la consola de Google Cloud -> **Compute Engine** -> **Metadata**.
    - Pestaña **SSH Keys**.
    - Haz clic en **Add SSH Key** y pega el contenido completo de `github_deploy_key.pub`.
    - **IMPORTANTE:** Al final de la clave suele decir algo como `...= usuario@pc`. Asegúrate de que ese "usuario" sea el mismo que pongas en `GCP_SSH_USER`.

3.  **Configura la Clave Privada en GitHub:**
    - Abre el archivo `github_deploy_key` (el que NO tiene .pub).
    - Copia todo el contenido (incluyendo las líneas BEGIN y END).
    - Pégalo en el secreto `GCP_SSH_PRIVATE_KEY` en GitHub.

---

## Cómo verificar el despliegue

Cada vez que hagas un `git push origin master`, puedes ir a la pestaña **Actions** de tu repositorio en GitHub para ver el progreso del despliegue en tiempo real.

Si el deploy falla, revisa los logs en GitHub; usualmente es un problema de permisos de la SSH key o de la IP del firewall.
