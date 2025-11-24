@echo off
echo ================================================
echo Aplicando cambios para filtrar eventos por usuario
echo ================================================
echo.

REM Paso 1: Agregar función readUserEvents a directus.ts
echo [1/2] Agregando función readUserEvents a lib\directus.ts...

powershell -Command "$file = 'lib\directus.ts'; $content = Get-Content $file -Raw; $newFunc = \"`r`n`r`n// Read events filtered by user`r`nexport const readUserEvents = async (userId: string) =^> {`r`n  const response = await fetch(```${directusUrl}/items/events?filter[user_created][_eq]=${userId}^&sort=-date_created^&fields=*```, {`r`n    headers: getHeaders(),`r`n  });`r`n`r`n  if (!response.ok) {`r`n    throw new Error('Failed to read user events');`r`n  }`r`n`r`n  const data = await response.json();`r`n  return data.data;`r`n};\"; $content = $content -replace '(return response\.json\(\);[\r\n]+}\;)([\r\n]+\/\/ Hook personalizado)', ('$1' + $newFunc + '$2'); Set-Content $file -Value $content"

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: No se pudo modificar directus.ts
    echo Por favor aplica los cambios manualmente usando SOLUCION_SIMPLIFICADA.md
    pause
    exit /b 1
)

echo OK - Función agregada correctamente
echo.

REM Paso 2: Modificar el useEffect en events/page.tsx
echo [2/2] Modificando app\events\page.tsx...

powershell -Command "$file = 'app\events\page.tsx'; $content = Get-Content $file -Raw; $oldCode = '  \/\/ Fetch events from Directus[\r\n\s]+useEffect\(\(\) =^> \{[\r\n\s]+const fetchEvents = async \(\) =^> \{[\r\n\s]+try \{[\r\n\s]+\/\/ Import dynamically.*?fetchEvents\(\);[\r\n\s]+\}, \[\]\);'; $newCode = '  // Fetch events from Directus`r`n  useEffect(() =^> {`r`n    const fetchEvents = async () =^> {`r`n      try {`r`n        // Solo cargar eventos si el usuario está logueado`r`n        if (!user?.id) {`r`n          setEvents([]);`r`n          return;`r`n        }`r`n`r`n        const { readUserEvents } = await import(''@/lib/directus'');`r`n        const data = await readUserEvents(user.id);`r`n`r`n        const mappedEvents: Event[] = data.map((item: any) =^> ({`r`n          id: item.id,`r`n          title: item.name,`r`n          description: item.description,`r`n          startDate: item.start_date,`r`n          endDate: item.end_date,`r`n          location: item.location,`r`n          capacity: item.capacity,`r`n          price: item.price,`r`n          category: ''conferencia'',`r`n          requiresLiquorLicense: item.requires_liquor_license,`r`n          status: item.status,`r`n          createdAt: item.date_created`r`n        }));`r`n`r`n        setEvents(mappedEvents);`r`n      } catch (error) {`r`n        console.error(''Error fetching events:'', error);`r`n      }`r`n    };`r`n`r`n    fetchEvents();`r`n  }, [user]);'; $content = $content -replace $oldCode, $newCode; Set-Content $file -Value $content"

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: No se pudo modificar page.tsx
    echo Por favor aplica los cambios manualmente usando SOLUCION_SIMPLIFICADA.md
    pause
    exit /b 1
)

echo OK - Archivo modificado correctamente
echo.
echo ================================================
echo Cambios aplicados exitosamente!
echo ================================================
echo.
echo Ahora puedes:
echo 1. Crear un evento (se asignará automáticamente tu usuario)
echo 2. Ver la lista de eventos (solo verás tus eventos)
echo.
pause
