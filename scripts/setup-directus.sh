#!/bin/bash

URL="https://rayner-seguros.6vlrrp.easypanel.host"
TOKEN="VVnbHPcI1S_BkjM7jG8xN7qXnLCq2O8V"

function req() {
    endpoint=$1
    method=$2
    data=$3
    
    echo "Request: $method $endpoint"
    
    if [ -z "$data" ]; then
        curl -s -X $method "$URL$endpoint" \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json"
    else
        curl -s -X $method "$URL$endpoint" \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json" \
            -d "$data"
    fi
    echo ""
}

echo "🚀 Starting Directus Setup (Bash)..."

# 0. Cleanup (Delete existing collections if they are broken/folders)
echo "--- Cleaning up old collections ---"
req "/collections/events" "DELETE"
req "/collections/providers" "DELETE"
req "/collections/team_members" "DELETE"
req "/collections/document_requirements" "DELETE"
req "/collections/provider_documents" "DELETE"
req "/collections/event_documents" "DELETE"
req "/collections/debug_test" "DELETE"

echo "Waiting for deletions to propagate..."
sleep 2

# 1. Create Collections
echo "--- Creating Collections ---"
req "/collections" "POST" '{"collection":"events","schema":{},"meta":{"note":"Eventos","icon":"event"}}'
req "/collections" "POST" '{"collection":"providers","schema":{},"meta":{"note":"Proveedores","icon":"business"}}'
req "/collections" "POST" '{"collection":"team_members","schema":{},"meta":{"note":"Integrantes","icon":"group"}}'
req "/collections" "POST" '{"collection":"document_requirements","schema":{},"meta":{"note":"Requisitos","icon":"description"}}'
req "/collections" "POST" '{"collection":"provider_documents","schema":{},"meta":{"note":"Docs Prov","icon":"folder"}}'
req "/collections" "POST" '{"collection":"event_documents","schema":{},"meta":{"note":"Docs Evento","icon":"folder_special"}}'

# 2. Create Fields
echo "--- Creating Fields ---"

# Events
req "/fields/events" "POST" '{"field":"title","type":"string","meta":{"interface":"input","required":true,"width":"full"}}'
req "/fields/events" "POST" '{"field":"description","type":"text","meta":{"interface":"input-multiline","width":"full"}}'
req "/fields/events" "POST" '{"field":"start_date","type":"timestamp","meta":{"interface":"datetime","width":"half"}}'
req "/fields/events" "POST" '{"field":"end_date","type":"timestamp","meta":{"interface":"datetime","width":"half"}}'
req "/fields/events" "POST" '{"field":"location","type":"string","meta":{"interface":"input","width":"full"}}'
req "/fields/events" "POST" '{"field":"capacity","type":"integer","meta":{"interface":"input","width":"half"}}'
req "/fields/events" "POST" '{"field":"price","type":"integer","meta":{"interface":"input","width":"half"}}'
req "/fields/events" "POST" '{"field":"category","type":"string","meta":{"interface":"select-dropdown","width":"half","options":{"choices":[{"text":"Conferencia","value":"conferencia"},{"text":"Workshop","value":"workshop"},{"text":"Networking","value":"networking"}]}}}'
req "/fields/events" "POST" '{"field":"requires_liquor_license","type":"boolean","meta":{"interface":"boolean","width":"half"},"schema":{"default_value":false}}'
req "/fields/events" "POST" '{"field":"status","type":"string","meta":{"interface":"select-dropdown","width":"half","options":{"choices":[{"text":"Borrador","value":"draft"},{"text":"Publicado","value":"published"}]}},"schema":{"default_value":"draft"}}'

# Providers
req "/fields/providers" "POST" '{"field":"name","type":"string","meta":{"interface":"input","required":true,"width":"full"}}'
req "/fields/providers" "POST" '{"field":"description","type":"text","meta":{"interface":"input-multiline","width":"full"}}'
req "/fields/providers" "POST" '{"field":"email","type":"string","meta":{"interface":"input","width":"half"}}'
req "/fields/providers" "POST" '{"field":"phone","type":"string","meta":{"interface":"input","width":"half"}}'
req "/fields/providers" "POST" '{"field":"requires_liquor_license","type":"boolean","meta":{"interface":"boolean","width":"half"},"schema":{"default_value":false}}'

# Team Members
req "/fields/team_members" "POST" '{"field":"name","type":"string","meta":{"interface":"input","required":true,"width":"full"}}'
req "/fields/team_members" "POST" '{"field":"role","type":"string","meta":{"interface":"input","width":"full"}}'

# Document Requirements
req "/fields/document_requirements" "POST" '{"field":"type","type":"string","meta":{"interface":"select-dropdown","width":"half","options":{"choices":[{"text":"RC","value":"RC"},{"text":"ART","value":"ART"},{"text":"SS","value":"SS"}]}}}'
req "/fields/document_requirements" "POST" '{"field":"name","type":"string","meta":{"interface":"input","required":true,"width":"half"}}'
req "/fields/document_requirements" "POST" '{"field":"is_required","type":"boolean","meta":{"interface":"boolean","width":"half"},"schema":{"default_value":false}}'

# Provider Documents
req "/fields/provider_documents" "POST" '{"field":"status","type":"string","meta":{"interface":"select-dropdown","width":"half","options":{"choices":[{"text":"Pendiente","value":"pending"},{"text":"Verificado","value":"verified"}]}},"schema":{"default_value":"pending"}}'
req "/fields/provider_documents" "POST" '{"field":"upload_url","type":"string","meta":{"interface":"input","width":"full"}}'

# Event Documents
req "/fields/event_documents" "POST" '{"field":"is_required","type":"boolean","meta":{"interface":"boolean","width":"half"},"schema":{"default_value":false}}'

# 3. Create Relationships (M2O)
echo "--- Creating Relationships ---"

# Events -> Users (Owner)
req "/fields/events" "POST" '{"field":"owner","type":"string","meta":{"interface":"select-dropdown-m2o","special":["m2o"]},"schema":{"is_primary_key":false}}'
req "/relations" "POST" '{"collection":"events","field":"owner","related_collection":"directus_users","schema":{"on_delete":"SET NULL"}}'

# Providers -> Events
req "/fields/providers" "POST" '{"field":"event","type":"integer","meta":{"interface":"select-dropdown-m2o","special":["m2o"]},"schema":{"is_primary_key":false}}'
req "/relations" "POST" '{"collection":"providers","field":"event","related_collection":"events","schema":{"on_delete":"SET NULL"}}'

# Team Members -> Providers
req "/fields/team_members" "POST" '{"field":"provider","type":"integer","meta":{"interface":"select-dropdown-m2o","special":["m2o"]},"schema":{"is_primary_key":false}}'
req "/relations" "POST" '{"collection":"team_members","field":"provider","related_collection":"providers","schema":{"on_delete":"SET NULL"}}'

# Provider Documents -> Team Members
req "/fields/provider_documents" "POST" '{"field":"team_member","type":"integer","meta":{"interface":"select-dropdown-m2o","special":["m2o"]},"schema":{"is_primary_key":false}}'
req "/relations" "POST" '{"collection":"provider_documents","field":"team_member","related_collection":"team_members","schema":{"on_delete":"SET NULL"}}'

# Provider Documents -> Document Requirements
req "/fields/provider_documents" "POST" '{"field":"document_type","type":"integer","meta":{"interface":"select-dropdown-m2o","special":["m2o"]},"schema":{"is_primary_key":false}}'
req "/relations" "POST" '{"collection":"provider_documents","field":"document_type","related_collection":"document_requirements","schema":{"on_delete":"SET NULL"}}'

# Event Documents -> Events
req "/fields/event_documents" "POST" '{"field":"event","type":"integer","meta":{"interface":"select-dropdown-m2o","special":["m2o"]},"schema":{"is_primary_key":false}}'
req "/relations" "POST" '{"collection":"event_documents","field":"event","related_collection":"events","schema":{"on_delete":"SET NULL"}}'

# Event Documents -> Document Requirements
req "/fields/event_documents" "POST" '{"field":"document_type","type":"integer","meta":{"interface":"select-dropdown-m2o","special":["m2o"]},"schema":{"is_primary_key":false}}'
req "/relations" "POST" '{"collection":"event_documents","field":"document_type","related_collection":"document_requirements","schema":{"on_delete":"SET NULL"}}'


# 4. Insert Sample Data
echo "--- Inserting Sample Data ---"

# Doc Reqs
echo "Creating Doc Reqs..."
req "/items/document_requirements" "POST" '{"type":"RC","name":"Registro Civil","is_required":true}'
req "/items/document_requirements" "POST" '{"type":"ART","name":"Seguro ART","is_required":true}'

# Events
echo "Creating Events..."
req "/items/events" "POST" '{"title":"Conferencia Tech 2024","description":"Evento anual","start_date":"2024-11-01T09:00:00","end_date":"2024-11-01T18:00:00","location":"Buenos Aires","capacity":500,"category":"conferencia","status":"published"}'

echo "🎉 Setup Finished!"
