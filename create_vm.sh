#!/bin/bash

# --- CARGAR VARIABLES ---
# Intenta cargar desde .env si existe
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

INSTANCE_NAME="${GCP_INSTANCE_NAME:-sniper-vm}"
ZONE="${GCP_ZONE:-us-central1-a}"
MACHINE_TYPE="${GCP_MACHINE_TYPE:-e2-micro}"
IMAGE_FAMILY="debian-12"
IMAGE_PROJECT="debian-cloud"
DISK_SIZE="${GCP_DISK_SIZE:-30}"
TAGS="${GCP_TAGS:-sniper-server}"

echo "🎯 Iniciando creación de infraestructura en Google Cloud..."

# 1. Crear la Instancia VM
echo "🖥️ Creando instancia $INSTANCE_NAME en $ZONE..."
gcloud compute instances create $INSTANCE_NAME \
    --zone=$ZONE \
    --machine-type=$MACHINE_TYPE \
    --image-family=$IMAGE_FAMILY \
    --image-project=$IMAGE_PROJECT \
    --boot-disk-size=$DISK_SIZE \
    --boot-disk-type=pd-standard \
    --tags=$TAGS

if [ $? -eq 0 ]; then
    echo "✅ Instancia creada exitosamente."
else
    echo "❌ Error al crear la instancia. Revisa si ya existe o si tienes permisos."
    exit 1
fi

# 2. Crear Regla de Firewall
echo "🛡️ Configurando Firewall para puertos 4321 y 3000..."
gcloud compute firewall-rules create allow-sniper-ports \
    --allow=tcp:4321,tcp:3000 \
    --target-tags=$TAGS \
    --description="Permitir acceso al Dashboard y Sockets del Sniper"

if [ $? -eq 0 ]; then
    echo "✅ Regla de Firewall creada."
else
    echo "⚠️ La regla de firewall ya existe o no se pudo crear."
fi

# 3. Obtener IP Pública
IP=$(gcloud compute instances describe $INSTANCE_NAME --zone=$ZONE --format='get(networkInterfaces[0].accessConfigs[0].natIP)')

echo "------------------------------------------------------------"
echo "🚀 ¡INFRAESTRUCTURA LISTA!"
echo "📍 IP Pública de tu bot: $IP"
echo "🌐 URL Dashboard: http://$IP:4321"
echo ""
echo "Para conectarte y empezar:"
echo "gcloud compute ssh $INSTANCE_NAME --zone=$ZONE"
echo "------------------------------------------------------------"
