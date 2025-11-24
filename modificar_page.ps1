# Script para modificar app/events/page.tsx

$file = "app\events\page.tsx"
$content = Get-Content $file -Raw

# Patrón a buscar (el useEffect actual)
$oldPattern = @"
  // Fetch events from Directus
  useEffect\(\(\) => \{
    const fetchEvents = async \(\) => \{
      try \{
        // Import dynamically to avoid server-side issues if any, though readItems is safe
        const \{ readItems \} = await import\('@/lib/directus'\);

        const data = await readItems\('events', \{
          sort: \['-date_created'\],
          fields: \['\*'\]
        \}\);

        const mappedEvents: Event\[\] = data\.map\(\(item: any\) => \(\{
          id: item\.id,
          title: item\.name,
          description: item\.description,
          startDate: item\.start_date,
          endDate: item\.end_date,
          location: item\.location,
          capacity: item\.capacity,
          price: item\.price,
          category: 'conferencia', // Default or map if category field exists
          requiresLiquorLicense: item\.requires_liquor_license,
          status: item\.status,
          createdAt: item\.date_created
        \}\)\);

        setEvents\(mappedEvents\);
      \} catch \(error\) \{
        console\.error\('Error fetching events:', error\);
      \}
    \};

    fetchEvents\(\);
  \}, \[\]\);
"@

# Nuevo código
$newCode = @"
  // Fetch events from Directus
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Solo cargar eventos si el usuario está logueado
        if (!user?.id) {
          setEvents([]);
          return;
        }

        const { readUserEvents } = await import('@/lib/directus');
        const data = await readUserEvents(user.id);

        const mappedEvents: Event[] = data.map((item: any) => ({
          id: item.id,
          title: item.name,
          description: item.description,
          startDate: item.start_date,
          endDate: item.end_date,
          location: item.location,
          capacity: item.capacity,
          price: item.price,
          category: 'conferencia',
          requiresLiquorLicense: item.requires_liquor_license,
          status: item.status,
          createdAt: item.date_created
        }));

        setEvents(mappedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, [user]);
"@

# Reemplazar
$content = $content -replace [regex]::Escape($oldPattern), $newCode

# Guardar
Set-Content $file -Value $content

Write-Host "Archivo modificado exitosamente!" -ForegroundColor Green
