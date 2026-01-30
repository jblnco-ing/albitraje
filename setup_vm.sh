#!/bin/bash

# --- CONFIGURACIÓN DE COLORES ---
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}🚀 Iniciando Setup de KAIROS SNIPER en Google Cloud VM...${NC}"

# 1. ACTUALIZACIÓN DEL SISTEMA
echo -e "${YELLOW}📦 Actualizando paquetes del sistema...${NC}"
sudo apt-get update && sudo apt-get upgrade -y

# 2. CONFIGURACIÓN DE SWAP (CRUCIAL PARA E2-MICRO)
echo -e "${YELLOW}💾 Configurando 2GB de memoria SWAP...${NC}"
if [ -f /swapfile ]; then
    echo "Swap ya configurado."
else
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo -e "${GREEN}✅ SWAP configurado exitosamente.${NC}"
fi

# 3. INSTALACIÓN DE DOCKER
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}🐳 Instalando Docker...${NC}"
    sudo apt-get install -y ca-certificates curl gnupg
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg

    echo \
      "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
      "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
      sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    
    # Permitir al usuario actual usar docker sin sudo
    sudo usermod -aG docker $USER
    echo -e "${GREEN}✅ Docker instalado.${NC}"
else
    echo -e "${GREEN}✅ Docker ya está instalado.${NC}"
fi

# 4. PREPARATIVOS FINALES
echo -e "${CYAN}------------------------------------------------------------${NC}"
echo -e "${GREEN}¡TODO LISTO PARA EL DESPEGUE!${NC}"
echo -e ""
echo -e "Próximos pasos:"
echo -e "1. ${YELLOW}IMPORTANTE:${NC} Cierra sesión y vuelve a entrar para que los permisos de Docker surtan efecto."
echo -e "2. Ve a la carpeta del proyecto: ${CYAN}cd albitraje${NC}"
echo -e "3. Levanta el sistema: ${CYAN}docker compose up -d --build${NC}"
echo -e ""
echo -e "Recordatorio DevOps:"
echo -e "- Abre el puerto ${CYAN}4321${NC} (Dashboard) y ${CYAN}3000${NC} (API) en el Firewall de Google Cloud."
echo -e "------------------------------------------------------------"
